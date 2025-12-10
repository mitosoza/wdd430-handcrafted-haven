'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import postgres from 'postgres';
import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { unlink } from 'fs/promises';
import bcrypt from 'bcrypt';





const sql = postgres(process.env.POSTGRES_URL || '', { ssl: 'require' });

const FormSchema = z.object({
  product_id: z.string(),
  price: z.string(),
  product_name: z.string({
    invalid_type_error: 'Please enter a valid product',
  }),
  product_description: z.string(),
  seller_id: z.string(),
  category_id: z.string({
    invalid_type_error: 'Please select a product category',
  })
});

const reviewFormSchema = z.object({
  review_id: z.string(),
  user_id: z.string(),
  seller_id: z.string(),
  product_id: z.string(),
  review_text: z.string(),
  review_date: z.string(),
  review_rating: z.coerce.number(),
})

const addressFormSchema = z.object({
  address_id: z.string(),
  user_id: z.string(),
  street_address_1: z.string().min(1, 'Address line 1 is required'),
  street_address_2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state_province: z.string().min(1, 'State/Province is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  is_default: z.boolean().optional(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required')
})

const orderSchema = z.object({
  total_amount: z.string().min(1, 'Total amount is required'),
  shipping_address_id: z.string().min(1, 'Shipping address is required'),
  cart_items: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().min(1),
    unit_price: z.string(),
    seller_id: z.string().optional()
  })).min(1, 'Cart cannot be empty')
});

export type State = {
  errors?: {
    product_id?: string[];
    product_name?: string[];
    product_description?: string[];
    product_image?: string[];
    price?: string[];
    seller_id?: string[];
    category_id?: string[];
  };
  message?: string | null;
};

export type UserState = {
  errors?: {
    user_id?: string[];
    user_first_name?: string[];
    user_last_name?: string[];
    user_email?: string[];
    user_password?: string[]
  };
  message?: string | null;
  fieldValues?: {
    user_first_name?: string;
    user_last_name?: string;
    user_email?: string;
  };
}

export type AddressState = {
  errors?: {
    street_address_1?: string[];
    street_address_2?: string[];
    city?: string[];
    state_province?: string[];
    postal_code?: string[];
    country?: string[];
    is_default?: string[];
    first_name?: string[];
    last_name?: string[];
  };
  message?: string | null;
  fieldValues?: {
    street_address_1?: string;
    street_address_2?: string;
    city?: string;
    state_province?: string;
    postal_code?: string;
    country?: string;
    first_name?: string;
    last_name?: string;
  };
}
export type reviewState = {
  errors?: {
    review_id?: string[];
    user_id?: string[];
    product_id?: string[];
    review_text?: string[];
    seller_id?: string[];
    review_date?: string[];
    review_rating?: string[];
  }
  message?: string | null;
}


const CreateProduct = FormSchema.omit({ product_id: true, seller_id: true }).extend({
  product_id: z.string().optional(),
  seller_id: z.string().optional(),
});

// Removed unused CreateUser

const CreateAddress = addressFormSchema.omit({ address_id: true, user_id: true })

const CreateReview = reviewFormSchema.omit({ review_id: true })

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
    category_id: formData.get('category_id'),
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

  // Generate a product_id
  const productId = validated.data.product_id || `p${Date.now()}`;

  // Get seller_id from session
  const session = await auth();
  const sellerId = session?.user?.id;

  if (!sellerId) {
    return {
      ...prevState,
      message: 'Error: You must be logged in as a seller to create a product.',
    };
  }

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
      INSERT INTO public.products (product_id, price, product_name, product_description, seller_id, product_image, category_id)
      VALUES (${productId}, ${validated.data.price}, ${validated.data.product_name}, ${validated.data.product_description}, ${sellerId}, ${productImage}, ${validated.data.category_id})
    `;

    // Revalidate the products page cache so the new product appears
    revalidatePath('/products');

    return { message: 'Product created successfully!', errors: undefined };
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
    return { message: 'Product updated successfully!', errors: undefined };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to update product.', errors: undefined };
  }
}

export async function createUser(
  prevState: UserState,
  formData: FormData,
): Promise<UserState> {
  // Extract user_type first to determine validation logic
  const userType = formData.get('user_type') as string;

  // Base schema for common fields
  const baseSchema = z.object({
    user_first_name: z.string().min(1, 'First name is required'),
    user_last_name: z.string().min(1, 'Last name is required'),
    user_email: z.string().email('Invalid email address'),
    user_password: z.string().min(6, 'Password must be at least 6 characters'),
  });

  // Validate common fields
  const validated = baseSchema.safeParse({
    user_first_name: formData.get('user_first_name'),
    user_last_name: formData.get('user_last_name'),
    user_email: formData.get('user_email'),
    user_password: formData.get('user_password'),
  });

  if (!validated.success) {
    const fieldErrors = validated.error.format();
    const errors: UserState['errors'] = {};
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
        user_first_name: formData.get('user_first_name') as string || '',
        user_last_name: formData.get('user_last_name') as string || '',
        user_email: formData.get('user_email') as string || '',
      }
    };
  }

  // Generate user_id
  const userId = `u${Math.random().toString(36).substring(2, 5)}`;

  // Use user_type selector to determine account type
  const isSeller = userType === 'seller';

  try {
    // Check if email already exists in both users and sellers tables
    const [existingUser, existingSeller] = await Promise.all([
      sql`SELECT user_email FROM public.users WHERE user_email = ${validated.data.user_email}`,
      sql`SELECT seller_email FROM public.sellers WHERE seller_email = ${validated.data.user_email}`
    ]);

    if (existingUser.length > 0 || existingSeller.length > 0) {
      return {
        message: null,
        errors: {
          user_email: ['Email already exists. Please use a different email address.']
        },
        fieldValues: {
          user_first_name: validated.data.user_first_name,
          user_last_name: validated.data.user_last_name,
          user_email: validated.data.user_email,
        }
      };
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(validated.data.user_password, 10);

    if (isSeller) {
      // Seller account creation
      let sellerImage = '';
      const imageFile = formData.get('seller_image') as File | null;
      if (imageFile && imageFile.size > 0) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(imageFile.type)) {
          return { ...prevState, message: 'Invalid image type. Only JPG, PNG, WebP allowed.' };
        }
        // Validate file size (5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
          return { ...prevState, message: 'Image size too large. Max 5MB.' };
        }
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = join(process.cwd(), 'public', 'sellers');
        await mkdir(uploadDir, { recursive: true });
        const timestamp = Date.now();
        const sellerId = `s${Math.random().toString(36).substring(2, 5)}`;
        const fileExtension = imageFile.type.split('/')[1];
        const fileName = `${sellerId}-${timestamp}.${fileExtension}`;
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        sellerImage = `sellers/${fileName}`;
        await sql`
          INSERT INTO public.sellers (seller_id, seller_first_name, seller_last_name, seller_email, seller_image, seller_password)
          VALUES (${sellerId}, ${validated.data.user_first_name}, ${validated.data.user_last_name}, ${validated.data.user_email}, ${sellerImage}, ${hashedPassword})
        `;
        return { message: 'Seller account created successfully!', errors: undefined };
      } else {
        return { ...prevState, message: 'Seller image is required.' };
      }
    } else {
      // Buyer account creation
      await sql`
        INSERT INTO public.users (user_id, user_first_name, user_last_name, user_email, user_password)
        VALUES (${userId}, ${validated.data.user_first_name}, ${validated.data.user_last_name}, ${validated.data.user_email}, ${hashedPassword})
      `;
      return { message: 'Account created successfully!', errors: undefined };
    }
  } catch (error) {
    console.log('Database Error:', error);
    return {
      message: 'Database Error: Failed to create account.',
      errors: {},
    };
  }
}

export async function createReview(
  prevState: reviewState,
  formData: FormData,
): Promise<reviewState> {
  const session = await auth();
  const userId = session?.user?.id;
  const userRole = (session?.user as any)?.role;

  if (!userId) {
    return {
      ...prevState,
      message: 'Error: You must be logged in to review.',
    };
  }

  if (userRole === 'seller') {
    return {
      ...prevState,
      message: 'Error: Sellers cannot review products.',
    };
  }

  const validated = CreateReview.safeParse({
    review_id: formData.get('review_id') || '',
    review_text: formData.get('review_text'),
    review_date: formData.get('review_date'),
    review_rating: formData.get('review_rating'),
    seller_id: formData.get('seller_id'),
    user_id: userId,
    product_id: formData.get('product_id'),
  });

  if (!validated.success) {
    const fieldErrors = validated.error.format();
    const errors: reviewState['errors'] = {};
    for (const key of Object.keys(fieldErrors)) {
      const val = (fieldErrors as any)[key];
      if (val && typeof val === 'object' && Array.isArray(val._errors)) {
        (errors as any)[key] = val._errors as string[];
      }
    }
    return { ...prevState, errors };
  }

  const reviewId = `r${Math.random().toString(36).substring(2, 5)}`;

  try {
    await sql`
      INSERT INTO public.reviews (review_id, review_text, review_date, review_rating, seller_id, user_id, product_id)
      VALUES (${reviewId}, ${validated.data.review_text}, ${validated.data.review_date}, ${validated.data.review_rating}, ${validated.data.seller_id}, ${validated.data.user_id}, ${validated.data.product_id})
    `;

    revalidatePath('/reviews');

    return { message: 'Review created successfully!', errors: undefined };
  } catch (error) {
    console.log('Database Error:', error);
    return {
      message: 'Database Error: Failed to create review',
      errors: {},
    };
  }
}

export async function createAddress(
  prevState: AddressState,
  formData: FormData,
): Promise<AddressState> {
  // Get current user session
  const { auth } = await import('@/auth');
  const session = await auth();
  if (!session?.user?.email) {
    return {
      message: 'You must be logged in to create an address',
      errors: {},
    };
  }

  // Validate form using Zod
  const validated = CreateAddress.safeParse({
    street_address_1: formData.get('street_address_1') || '',
    street_address_2: formData.get('street_address_2') || '',
    city: formData.get('city') || '',
    state_province: formData.get('state_province') || '',
    postal_code: formData.get('postal_code') || '',
    country: formData.get('country') || '',
    is_default: formData.get('is_default') === 'on',
    first_name: formData.get('first_name') || '',
    last_name: formData.get('last_name') || '',
  });

  if (!validated.success) {
    const fieldErrors = validated.error.format();
    const errors: AddressState['errors'] = {};
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
        street_address_1: formData.get('street_address_1') as string || '',
        street_address_2: formData.get('street_address_2') as string || '',
        city: formData.get('city') as string || '',
        state_province: formData.get('state_province') as string || '',
        postal_code: formData.get('postal_code') as string || '',
        country: formData.get('country') as string || '',
        first_name: formData.get('first_name') as string || '',
        last_name: formData.get('last_name') as string || '',
      }
    };
  }

  try {
    // Get the user's ID from their email
    console.log('Session:', session);
    // Check both users and sellers tables for user_id/seller_id
    const [userResult, sellerResult] = await Promise.all([
      sql`SELECT user_id FROM public.users WHERE user_email = ${session.user.email}`,
      sql`SELECT seller_id FROM public.sellers WHERE seller_email = ${session.user.email}`
    ]);

    let userId: string | undefined = undefined;
    let sellerId: string | undefined = undefined;
    if (userResult.length > 0) {
      userId = userResult[0].user_id;
    } else if (sellerResult.length > 0) {
      sellerId = sellerResult[0].seller_id;
    }

    if (!userId && !sellerId) {
      return {
        message: 'User not found',
        errors: {},
      };
    }
    const addressId = `a${Math.random().toString(36).substring(2, 8)}`;
    console.log('Generated Address ID:', addressId);
    console.log('User ID:', userId);
    console.log('Seller ID:', sellerId);
    console.log('Validated Address Data:', validated.data);
    // If this is set as default, unset all other default addresses for this user/seller
    if (validated.data.is_default) {
      if (userId) {
        await sql`
          UPDATE public.addresses
          SET is_default = false
          WHERE user_id = ${userId}
        `;
      } else if (sellerId) {
        await sql`
          UPDATE public.addresses
          SET is_default = false
          WHERE seller_id = ${sellerId}
        `;
      }
    }

    // Insert the new address
    await sql`
      INSERT INTO public.addresses (
        address_id, user_id, seller_id, street_address_1, street_address_2, 
        city, state_province, postal_code, country, is_default, first_name, last_name
      )
      VALUES (
        ${addressId}, ${userId || null}, ${sellerId || null}, ${validated.data.street_address_1}, 
        ${validated.data.street_address_2 || null}, ${validated.data.city}, 
        ${validated.data.state_province}, ${validated.data.postal_code}, 
        ${validated.data.country}, ${validated.data.is_default || false}, 
        ${validated.data.first_name}, ${validated.data.last_name}
      )
    `;

    // Revalidate the addresses page to show the new address
    revalidatePath('/dashboard/addresses');

    return {
      message: 'Address created successfully!',
      errors: {}
    };

  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to create address',
      errors: {},
    };
  }
}

export async function updateAddress(
  addressId: string,
  prevState: AddressState,
  formData: FormData,
): Promise<AddressState> {
  // Get current user session
  const { auth } = await import('@/auth');
  const session = await auth();

  if (!session?.user?.email) {
    return {
      message: 'You must be logged in to update an address',
      errors: {},
    };
  }

  // Validate form using Zod
  const validated = CreateAddress.safeParse({
    street_address_1: formData.get('street_address_1') || '',
    street_address_2: formData.get('street_address_2') || '',
    city: formData.get('city') || '',
    state_province: formData.get('state_province') || '',
    postal_code: formData.get('postal_code') || '',
    country: formData.get('country') || '',
    is_default: formData.get('is_default') === 'on',
    first_name: formData.get('first_name') || '',
    last_name: formData.get('last_name') || '',
  });

  if (!validated.success) {
    const fieldErrors = validated.error.format();
    const errors: AddressState['errors'] = {};
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
        street_address_1: formData.get('street_address_1') as string || '',
        street_address_2: formData.get('street_address_2') as string || '',
        city: formData.get('city') as string || '',
        state_province: formData.get('state_province') as string || '',
        postal_code: formData.get('postal_code') as string || '',
        country: formData.get('country') as string || '',
        first_name: formData.get('first_name') as string || '',
        last_name: formData.get('last_name') as string || '',
      }
    };
  }

  try {
    // Get the user's ID from their email
    const userResult = await sql`
      SELECT user_id FROM public.users WHERE user_email = ${session.user.email}
    `;

    if (userResult.length === 0) {
      return {
        message: 'User not found',
        errors: {},
      };
    }

    const userId = userResult[0].user_id;

    // Verify the address belongs to this user
    const addressCheck = await sql`
      SELECT address_id FROM public.addresses 
      WHERE address_id = ${addressId} AND user_id = ${userId}
    `;

    if (addressCheck.length === 0) {
      return {
        message: 'Address not found or access denied',
        errors: {},
      };
    }

    // If this is set as default, unset all other default addresses for this user
    if (validated.data.is_default) {
      await sql`
        UPDATE public.addresses 
        SET is_default = false 
        WHERE user_id = ${userId}
      `;
    }

    // Update the address
    await sql`
      UPDATE public.addresses 
      SET 
        street_address_1 = ${validated.data.street_address_1},
        street_address_2 = ${validated.data.street_address_2 || null},
        city = ${validated.data.city},
        state_province = ${validated.data.state_province},
        postal_code = ${validated.data.postal_code},
        country = ${validated.data.country},
        is_default = ${validated.data.is_default || false},
        first_name = ${validated.data.first_name},
        last_name = ${validated.data.last_name},
        updated_at = NOW()
      WHERE address_id = ${addressId} AND user_id = ${userId}
    `;

    // Revalidate the addresses page to show the updated address
    revalidatePath('/dashboard/addresses');
    revalidatePath(`/dashboard/addresses/${addressId}/edit`);

    return {
      message: 'Address updated successfully!',
      errors: {}
    };

  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to update address',
      errors: {},
    };
  }
}

export async function deleteAddress(addressId: string) {
  // Get current user session
  const { auth } = await import('@/auth');
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error('You must be logged in to delete an address');
  }

  try {
    // Get the user's ID from their email
    const userResult = await sql`
      SELECT user_id FROM public.users WHERE user_email = ${session.user.email}
    `;

    if (userResult.length === 0) {
      throw new Error('User not found');
    }

    const userId = userResult[0].user_id;

    // Verify the address belongs to this user and delete it
    const deleteResult = await sql`
      DELETE FROM public.addresses 
      WHERE address_id = ${addressId} AND user_id = ${userId}
      RETURNING address_id
    `;

    if (deleteResult.length === 0) {
      throw new Error('Address not found or access denied');
    }

    // Revalidate the addresses page to remove the deleted address
    revalidatePath('/dashboard/addresses');

  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
}

export async function deleteProduct(id: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Verify ownership and get image path
    const product = await sql`SELECT seller_id, product_image FROM products WHERE product_id = ${id}`;

    if (!product.length) {
      return { message: 'Product not found' };
    }

    if (product[0].seller_id !== userId) {
      throw new Error('Unauthorized: You can only delete your own products.');
    }

    // Delete image if exists
    if (product[0].product_image) {
      const imagePath = join(process.cwd(), 'public', product[0].product_image);
      try {
        await unlink(imagePath);
      } catch (err) {
        console.warn('Failed to delete image file:', err);
      }
    }

    // Delete from database
    await sql`DELETE FROM products WHERE product_id = ${id}`;

    revalidatePath('/products');

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete product.');
  }
}

export type CartState = {
  message?: string | null;
  errors?: unknown;
}

export type OrderState = {
  message?: string | null;
  errors?: {
    user_id?: string[];
    total_amount?: string[];
    shipping_address_id?: string[];
    cart_items?: string[];
    general?: string[];
  };
}

export async function addToCart(
  prevState: CartState,
  formData: FormData,
): Promise<CartState> {

  const productName = formData.get('productName') as string;
  const quantity = formData.get('quantity') as string;

  return {
    message: `${quantity} x ${productName} added successfully to cart!`,
    errors: {}
  };
}

export async function createOrder(
  prevState: OrderState,
  formData: FormData,
): Promise<OrderState> {

  const rawFormData = {
    total_amount: formData.get('total_amount') as string,
    shipping_address_id: formData.get('shipping_address_id') as string,
    cart_items: JSON.parse(formData.get('cart_items') as string || '[]')
  };
  console.log('Raw Form Data:', rawFormData);
  const validatedFields = orderSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing or invalid fields. Failed to create order.',
    };
  }

  const { total_amount, shipping_address_id, cart_items } = validatedFields.data;
  console.log('Validated Total:', total_amount);
  try {
    const { auth } = await import('@/auth');
    const session = await auth();

    if (!session?.user?.email || !session?.user?.role) {
      return {
        message: 'You must be logged in to place an order.',
        errors: { general: ['Please log in to continue.'] }
      };
    }


    let actualUserId: string | null = null;
    let actualSellerId: string | null = null;

    if (session.user.role === 'user') {
      const userResult = await sql`
        SELECT user_id FROM users WHERE user_email = ${session.user.email}
      `;
      if (userResult.length === 0) {
        return {
          message: 'User account not found.',
          errors: { general: ['Please create an account to place orders.'] }
        };
      }
      actualUserId = userResult[0].user_id;
    } else if (session.user.role === 'seller') {
      const sellerResult = await sql`
        SELECT seller_id FROM sellers WHERE seller_email = ${session.user.email}
      `;
      if (sellerResult.length === 0) {
        return {
          message: 'Seller account not found.',
          errors: { general: ['Please create an account to place orders.'] }
        };
      }
      actualSellerId = sellerResult[0].seller_id;
    } else {
      return {
        message: 'Invalid account type.',
        errors: { general: ['Unable to determine account type.'] }
      };
    }


    await sql.begin(async sql => {
      console.log('Actual User ID:', actualUserId);
      console.log('Actual Seller ID:', actualSellerId);
      console.log('Provided Shipping Address ID:', shipping_address_id);

      let existingAddress;
      if (actualUserId) {
        existingAddress = await sql`
          SELECT address_id FROM addresses WHERE address_id = ${shipping_address_id} AND user_id = ${actualUserId}
        `;
      } else if (actualSellerId) {
        existingAddress = await sql`
          SELECT address_id FROM addresses WHERE address_id = ${shipping_address_id} AND seller_id = ${actualSellerId}
        `;
      } else {
        throw new Error('No valid user or seller ID for address check.');
      }

      if (existingAddress.length === 0) {
        throw new Error('Invalid shipping address. Please select a valid address.');
      }

      const orderId = crypto.randomUUID();

      // Insert into orders with correct user_id or seller_id
      if (actualUserId) {
        await sql`
          INSERT INTO orders (order_id, user_id, order_date, order_status, total_amount, shipping_address_id, created_at, updated_at)
          VALUES (${orderId}, ${actualUserId}, NOW(), 'pending', ${total_amount}, ${shipping_address_id}, NOW(), NOW())
        `;
      } else if (actualSellerId) {
        await sql`
          INSERT INTO orders (order_id, seller_id, order_date, order_status, total_amount, shipping_address_id, created_at, updated_at)
          VALUES (${orderId}, ${actualSellerId}, NOW(), 'pending', ${total_amount}, ${shipping_address_id}, NOW(), NOW())
        `;
      } else {
        throw new Error('No valid user or seller ID for order.');
      }

      for (const item of cart_items) {
        const orderItemId = crypto.randomUUID();
        const totalPrice = (parseFloat(item.unit_price) * item.quantity).toString();

        const productResult = await sql`
          SELECT seller_id FROM products WHERE product_id = ${item.product_id}
        `;

        const sellerId = productResult[0]?.seller_id;

        if (!sellerId) {
          throw new Error(`Product ${item.product_id} not found or has no seller`);
        }

        await sql`
          INSERT INTO order_items (order_item_id, order_id, product_id, seller_id, quantity, unit_price, total_price)
          VALUES (${orderItemId}, ${orderId}, ${item.product_id}, ${sellerId}, ${item.quantity}, ${item.unit_price}, ${totalPrice})
        `;
      }
    });

    revalidatePath('/dashboard/orders');
    return {
      message: 'Order placed successfully! Thank you for your purchase.',
      errors: {}
    };

  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to create order.',
      errors: { general: ['Failed to create order. Please try again.'] }
    };
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