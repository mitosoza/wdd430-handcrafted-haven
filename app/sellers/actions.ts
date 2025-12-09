'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import postgres from 'postgres';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import bcrypt from 'bcrypt';

const sql = postgres(process.env.POSTGRES_URL || '', { ssl: 'require' });

// Seller Form Schema
const sellerFormSchema = z.object({
  seller_id: z.string(),
  seller_first_name: z.string().min(1, 'First name is required'),
  seller_last_name: z.string().min(1, 'Last name is required'),
  seller_email: z.string().email('Invalid email address'),
  seller_password: z.string().min(6, 'Password must be at least 6 characters'),
  seller_image: z.string().optional()
});

// Product Form Schema for sellers
const productFormSchema = z.object({
  product_id: z.string(),
  product_name: z.string().min(1, 'Product name is required'),
  product_description: z.string().min(1, 'Description is required'),
  price: z.string().min(1, 'Price is required'),
  seller_id: z.string(),
  category_id: z.string().optional(),
  product_image: z.string().optional()
});

// State Types
export type SellerState = {
  errors?: {
    seller_id?: string[];
    seller_first_name?: string[];
    seller_last_name?: string[];
    seller_email?: string[];
    seller_password?: string[];
    seller_image?: string[];
  };
  message?: string | null;
  fieldValues?: {
    seller_first_name?: string;
    seller_last_name?: string;
    seller_email?: string;
  };
};

export type ProductState = {
  errors?: {
    product_id?: string[];
    product_name?: string[];
    product_description?: string[];
    price?: string[];
    seller_id?: string[];
    category_id?: string[];
    product_image?: string[];
  };
  message?: string | null;
  fieldValues?: {
    product_name?: string;
    product_description?: string;
    price?: string;
  };
};

const CreateSeller = sellerFormSchema.omit({ seller_id: true });
const CreateProduct = productFormSchema.omit({ product_id: true });

/**
 * Create a new seller profile
 */
export async function createSeller(
  prevState: SellerState,
  formData: FormData,
): Promise<SellerState> {
  // Validate form data
  const validated = CreateSeller.safeParse({
    seller_first_name: formData.get('seller_first_name'),
    seller_last_name: formData.get('seller_last_name'),
    seller_email: formData.get('seller_email'),
    seller_password: formData.get('seller_password'),
    seller_image: '',
  });

  if (!validated.success) {
    const fieldErrors = validated.error.format();
    const errors: SellerState['errors'] = {};

    for (const key of Object.keys(fieldErrors)) {
      const val = (fieldErrors as any)[key];
      if (val && typeof val === 'object' && Array.isArray(val._errors)) {
        (errors as any)[key] = val._errors as string[];
      }
    }

    return {
      ...prevState,
      errors,
      fieldValues: {
        seller_first_name: formData.get('seller_first_name') as string,
        seller_last_name: formData.get('seller_last_name') as string,
        seller_email: formData.get('seller_email') as string,
      }
    };
  }

  // Generate seller ID
  const sellerId = `seller_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Use default seller image
  const sellerImage = '/camila.jpg';

  // Hash password
  const hashedPassword = await bcrypt.hash(validated.data.seller_password, 10);

  // Insert seller into database
  try {
    await sql`
      INSERT INTO sellers (
        seller_id, 
        seller_first_name, 
        seller_last_name, 
        seller_email, 
        seller_password,
        seller_image
      )
      VALUES (
        ${sellerId},
        ${validated.data.seller_first_name},
        ${validated.data.seller_last_name},
        ${validated.data.seller_email},
        ${hashedPassword},
        ${sellerImage}
      )
    `;
  } catch (error) {
    console.error('Database error:', error);
    return {
      message: 'Database Error: Failed to create seller profile.',
      fieldValues: {
        seller_first_name: validated.data.seller_first_name,
        seller_last_name: validated.data.seller_last_name,
        seller_email: validated.data.seller_email,
      }
    };
  }

  // Revalidate the sellers page
  revalidatePath('/sellers');

  return {
    message: 'Seller profile created successfully!',
    errors: {},
  };
}

/**
 * Create a new product for a seller
 */
export async function createProductForSeller(
  prevState: ProductState,
  formData: FormData,
  sellerId: string
): Promise<ProductState> {
  // Validate form data
  const validated = CreateProduct.safeParse({
    product_name: formData.get('product_name'),
    product_description: formData.get('product_description'),
    price: formData.get('price'),
    seller_id: sellerId,
    category_id: formData.get('category_id') || '',
    product_image: '',
  });

  if (!validated.success) {
    const fieldErrors = validated.error.format();
    const errors: ProductState['errors'] = {};

    for (const key of Object.keys(fieldErrors)) {
      const val = (fieldErrors as any)[key];
      if (val && typeof val === 'object' && Array.isArray(val._errors)) {
        (errors as any)[key] = val._errors as string[];
      }
    }

    return {
      ...prevState,
      errors,
      fieldValues: {
        product_name: formData.get('product_name') as string,
        product_description: formData.get('product_description') as string,
        price: formData.get('price') as string,
      }
    };
  }

  // Generate product ID
  const productId = `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  let productImage = '';

  // Handle image upload
  const imageFile = formData.get('product_image') as File | null;
  if (imageFile && imageFile.size > 0) {
    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(imageFile.type)) {
        return {
          ...prevState,
          errors: { product_image: ['Only JPEG, PNG, and WebP images are allowed'] },
          fieldValues: {
            product_name: validated.data.product_name,
            product_description: validated.data.product_description,
            price: validated.data.price,
          }
        };
      }

      // Check file size (max 5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        return {
          ...prevState,
          errors: { product_image: ['Image size must be less than 5MB'] },
          fieldValues: {
            product_name: validated.data.product_name,
            product_description: validated.data.product_description,
            price: validated.data.price,
          }
        };
      }

      // Create products directory if it doesn't exist
      const uploadDir = join(process.cwd(), 'public', 'products');
      await mkdir(uploadDir, { recursive: true });

      // Generate unique filename
      const fileExtension = imageFile.name.split('.').pop();
      const fileName = `${productId}.${fileExtension}`;
      const filePath = join(uploadDir, fileName);

      // Save file
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      productImage = `/products/${fileName}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        ...prevState,
        errors: { product_image: ['Failed to upload image'] },
        fieldValues: {
          product_name: validated.data.product_name,
          product_description: validated.data.product_description,
          price: validated.data.price,
        }
      };
    }
  }

  // Insert product into database
  try {
    await sql`
      INSERT INTO products (
        id, 
        product_name, 
        product_description, 
        price, 
        seller_id,
        category_id,
        product_image
      )
      VALUES (
        ${productId},
        ${validated.data.product_name},
        ${validated.data.product_description},
        ${validated.data.price},
        ${sellerId},
        ${validated.data.category_id || null},
        ${productImage}
      )
    `;
  } catch (error) {
    console.error('Database error:', error);
    return {
      message: 'Database Error: Failed to create product.',
      fieldValues: {
        product_name: validated.data.product_name,
        product_description: validated.data.product_description,
        price: validated.data.price,
      }
    };
  }

  // Revalidate the products and sellers pages
  revalidatePath('/products');
  revalidatePath('/sellers');

  return {
    message: 'Product created successfully!',
    errors: {},
  };
}

/**
 * Update seller profile
 */
export async function updateSeller(
  sellerId: string,
  prevState: SellerState,
  formData: FormData,
): Promise<SellerState> {
  const validated = sellerFormSchema.omit({ seller_id: true, seller_password: true }).safeParse({
    seller_first_name: formData.get('seller_first_name'),
    seller_last_name: formData.get('seller_last_name'),
    seller_email: formData.get('seller_email'),
    seller_image: '',
  });

  if (!validated.success) {
    const fieldErrors = validated.error.format();
    const errors: SellerState['errors'] = {};

    for (const key of Object.keys(fieldErrors)) {
      const val = (fieldErrors as any)[key];
      if (val && typeof val === 'object' && Array.isArray(val._errors)) {
        (errors as any)[key] = val._errors as string[];
      }
    }

    return { ...prevState, errors };
  }

  try {
    await sql`
      UPDATE sellers
      SET seller_first_name = ${validated.data.seller_first_name},
          seller_last_name = ${validated.data.seller_last_name},
          seller_email = ${validated.data.seller_email}
      WHERE seller_id = ${sellerId}
    `;
  } catch (error) {
    console.error('Database error:', error);
    return {
      message: 'Database Error: Failed to update seller profile.',
    };
  }

  revalidatePath('/sellers');
  revalidatePath(`/sellers/${sellerId}`);

  return {
    message: 'Seller profile updated successfully!',
    errors: {},
  };
}

/**
 * Delete seller profile
 */
export async function deleteSeller(sellerId: string): Promise<{ message: string }> {
  try {
    await sql`DELETE FROM sellers WHERE seller_id = ${sellerId}`;
    revalidatePath('/sellers');
    return { message: 'Seller deleted successfully' };
  } catch (error) {
    console.error('Database error:', error);
    return { message: 'Database Error: Failed to delete seller.' };
  }
}
