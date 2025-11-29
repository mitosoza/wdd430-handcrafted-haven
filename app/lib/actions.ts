'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import postgres from 'postgres';
import { signIn } from 'next-auth/react';
import { AuthError } from 'next-auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { unlink } from 'fs/promises';



const sql = postgres(process.env.POSTGRES_URL || '', { ssl: 'require' });

const FormSchema = z.object({
  product_id: z.string(),
  price: z.string(),
  product_name: z.string({
    invalid_type_error: 'Please enter a valid product',
  }),
  product_description: z.string(),
  seller_id: z.string()
});

export type State = {
  errors?: {
    product_id?: string[];
    product_name?: string[];
    product_description?: string[];
    product_image?: string[];
    price?: string[];
    seller_id?: string[];
  };
  message?: string | null;
};


const CreateProduct = FormSchema.omit({ product_id: true, seller_id: true }).extend({
  product_id: z.string().optional(),
  seller_id: z.string().optional(),
});

export async function createProduct(
  prevState: State,
  formData: FormData,
): Promise<State> {
  // Validate form using Zod
  const validated = CreateProduct.safeParse({
    product_id: formData.get('product_id') || '',
    price: formData.get('price'),
    product_name: formData.get('product_name'),
    product_description: formData.get('product_description'),
    seller_id: '',
  });

  if (!validated.success) {
    const fieldErrors = validated.error.format();
    const errors: State['errors'] = {};
    // Map zod errors
    for (const key of Object.keys(fieldErrors)) {
      const val = (fieldErrors as any)[key];
      if (val && typeof val === 'object' && Array.isArray(val._errors)) {
        (errors as any)[key] = val._errors as string[];
      }
    }

    return { ...prevState, errors };
  }

  // Generate a product_id and seller_id
  const productId = validated.data.product_id || `p${Date.now()}`;
  const sellerId = `s${Math.random().toString(36).substring(2, 5)}`;

  let productImage = '';

  // Handle image upload if provided
  const imageFile = formData.get('product_image') as File | null;
  if (imageFile && imageFile.size > 0) {
    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(imageFile.type)) {
        return {
          ...prevState,
          errors: { product_image: ['Only JPEG, PNG, and WebP images are allowed'] },
        };
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (imageFile.size > maxSize) {
        return {
          ...prevState,
          errors: { product_image: ['Image size must be less than 5MB'] },
        };
      }

      // Convert File to Buffer and save
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create directory if it doesn't exist
      const uploadDir = join(process.cwd(), 'public', 'products');
      await mkdir(uploadDir, { recursive: true });

      // Generate filename with timestamp to avoid collisions
      const timestamp = Date.now();
      const fileExtension = imageFile.type.split('/')[1];
      const fileName = `${productId}-${timestamp}.${fileExtension}`;
      const filePath = join(uploadDir, fileName);

      // Save file
      await writeFile(filePath, buffer);

      // Store relative path for database
      productImage = `products/${fileName}`;
    } catch (error) {
      console.error('Image upload error:', error);
      return {
        ...prevState,
        errors: { product_image: ['Failed to upload image'] },
      };
    }
  }

  // Insert data into the database
  try {
    await sql`
      INSERT INTO public.products (product_id, price, product_name, product_description, seller_id, product_image)
      VALUES (${productId}, ${validated.data.price}, ${validated.data.product_name}, ${validated.data.product_description}, ${sellerId}, ${productImage})
    `;

    // Revalidate the products page cache so the new product appears
    revalidatePath('/products');

    return { message: 'Product created successfully!', errors: {} };
  } catch (error) {
    console.error('Database Error:', error);
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to create product.',
      errors: {},
    };
  }
}




export async function updateProduct(
  id: string,
  prevState: State,
  formData: FormData,
): Promise<State> {
  const validated = CreateProduct.safeParse({
    product_id: formData.get('product_id') ?? id,
    price: formData.get('price'),
    product_name: formData.get('product_name'),
    product_description: formData.get('product_description'),
    seller_id: formData.get('seller_id') ?? '',
  });

  if (!validated.success) {
    const fieldErrors = validated.error.format();
    const errors: State['errors'] = {};
    for (const key of Object.keys(fieldErrors)) {
      const val = (fieldErrors as any)[key];
      if (val && typeof val === 'object' && Array.isArray(val._errors)) {
        (errors as any)[key] = val._errors as string[];
      }
    }
    return { ...prevState, errors };
  }

  let productImage: string | undefined;

  // Handle image upload if provided
  const imageFile = formData.get('product_image') as File | null;
  if (imageFile && imageFile.size > 0) {
    try {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(imageFile.type)) {
        return {
          ...prevState,
          errors: { product_image: ['Only JPEG, PNG, and WebP images are allowed'] },
        };
      }

      const maxSize = 5 * 1024 * 1024;
      if (imageFile.size > maxSize) {
        return {
          ...prevState,
          errors: { product_image: ['Image size must be less than 5MB'] },
        };
      }

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = join(process.cwd(), 'public', 'products');
      await mkdir(uploadDir, { recursive: true });

      const timestamp = Date.now();
      const fileExtension = imageFile.type.split('/')[1];
      const fileName = `${id}-${timestamp}.${fileExtension}`;
      const filePath = join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      productImage = `products/${fileName}`;

      //Delete old image if exists
const oldImageResult = await sql`
  SELECT product_image FROM public.products WHERE product_id = ${id}
`;
const oldImage = oldImageResult[0]?.product_image;
if (oldImage) {
  const oldPath = join(process.cwd(), 'public', oldImage);
  try {
    await unlink(oldPath);
  } catch (err) {
    console.warn('Failed to delete old image:', err);
  }
}
    } catch (error) {
      console.error('Image upload error:', error);
      return {
        ...prevState,
        errors: { product_image: ['Failed to upload image'] },
      };
    }
  }

  try {
    const { price, product_name, product_description, seller_id } = validated.data;

    if (productImage) {
      await sql`
        UPDATE public.products
        SET price = ${price},
            product_name = ${product_name},
            product_description = ${product_description ?? ''},
            seller_id = ${seller_id ?? ''},
            product_image = ${productImage}
        WHERE product_id = ${id}
      `;
    } else {
      await sql`
        UPDATE public.products
        SET price = ${price},
            product_name = ${product_name},
            product_description = ${product_description ?? ''},
            seller_id = ${seller_id ?? ''}
        WHERE product_id = ${id}
      `;
    }

    revalidatePath('/products');
    return { message: 'Product updated successfully!', errors: {} };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to update product.', errors: {} };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const redirectTo = formData.get('redirectTo') as string || '/dashboard';
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}