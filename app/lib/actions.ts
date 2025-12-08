'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import postgres from 'postgres';
import { signIn } from '@/auth';
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
  seller_id: z.string()
});

const userFormSchema = z.object({
  user_id: z.string(),
  user_first_name: z.string(),
  user_last_name: z.string(),
  user_email: z.string(),
  user_password: z.string()
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
  is_default: z.boolean().optional()
})

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
  };
  message?: string | null;
  fieldValues?: {
    street_address_1?: string;
    street_address_2?: string;
    city?: string;
    state_province?: string;
    postal_code?: string;
    country?: string;
  };
}

const CreateProduct = FormSchema.omit({ product_id: true, seller_id: true }).extend({
  product_id: z.string().optional(),
  seller_id: z.string().optional(),
});

const CreateUser = userFormSchema.omit({ user_id: true })

const CreateAddress = addressFormSchema.omit({ address_id: true, user_id: true })

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

export async function createUser(
  prevState: UserState,
  formData: FormData,
): Promise<UserState> {
  // Validate form using Zod
  const validated = CreateUser.safeParse({
    user_id: formData.get('user_id') || '',
    user_first_name: formData.get('user_first_name') || '',
    user_last_name: formData.get('user_last_name') || '',
    user_email: formData.get('user_email') || '',
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

  // Check if creating seller account
  const createSellerAccount = formData.get('create_seller_account') === 'on';

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

    if (createSellerAccount) {
      // Generate seller_id and insert into sellers table
      const sellerId = `s${Math.random().toString(36).substring(2, 5)}`;
      await sql`
        INSERT INTO public.sellers (seller_id, seller_first_name, seller_last_name, seller_email, seller_password, seller_image)
        VALUES (${sellerId}, ${validated.data.user_first_name}, ${validated.data.user_last_name}, ${validated.data.user_email}, ${hashedPassword}, '/sellers/default-avatar.png')
      `;
      return { message: 'Seller account created successfully!', errors: {} };
    } else {
      // Insert into users table
      await sql`
        INSERT INTO public.users (user_id, user_first_name, user_last_name, user_email, user_password)
        VALUES (${userId}, ${validated.data.user_first_name}, ${validated.data.user_last_name}, ${validated.data.user_email}, ${hashedPassword})
      `;
      return { message: 'User account created successfully!', errors: {} };
    }
  } catch (error) {
    console.log('Database Error:', error);
    return {
      message: 'Database Error: Failed to create user',
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
    street_address_1: formData.get('address_line_1') || '',
    street_address_2: formData.get('address_line_2') || '',
    city: formData.get('city') || '',
    state_province: formData.get('state_province') || '',
    postal_code: formData.get('postal_code') || '',
    country: formData.get('country') || '',
    is_default: formData.get('is_default') === 'on',
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
        street_address_1: formData.get('address_line_1') as string || '',
        street_address_2: formData.get('address_line_2') as string || '',
        city: formData.get('city') as string || '',
        state_province: formData.get('state_province') as string || '',
        postal_code: formData.get('postal_code') as string || '',
        country: formData.get('country') as string || '',
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
    const addressId = `a${Math.random().toString(36).substring(2, 8)}`;

    // If this is set as default, unset all other default addresses for this user
    if (validated.data.is_default) {
      await sql`
        UPDATE public.addresses 
        SET is_default = false 
        WHERE user_id = ${userId}
      `;
    }

    // Insert the new address
    await sql`
      INSERT INTO public.addresses (
        address_id, user_id, street_address_1, street_address_2, 
        city, state_province, postal_code, country, is_default
      )
      VALUES (
        ${addressId}, ${userId}, ${validated.data.street_address_1}, 
        ${validated.data.street_address_2 || null}, ${validated.data.city}, 
        ${validated.data.state_province}, ${validated.data.postal_code}, 
        ${validated.data.country}, ${validated.data.is_default || false}
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
    street_address_1: formData.get('address_line_1') || '',
    street_address_2: formData.get('address_line_2') || '',
    city: formData.get('city') || '',
    state_province: formData.get('state_province') || '',
    postal_code: formData.get('postal_code') || '',
    country: formData.get('country') || '',
    is_default: formData.get('is_default') === 'on',
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
        street_address_1: formData.get('address_line_1') as string || '',
        street_address_2: formData.get('address_line_2') as string || '',
        city: formData.get('city') as string || '',
        state_province: formData.get('state_province') as string || '',
        postal_code: formData.get('postal_code') as string || '',
        country: formData.get('country') as string || '',
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