'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { signIn } from 'next-auth/react';
import { AuthError } from 'next-auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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


const CreateProduct = FormSchema; 

export async function createProduct(
  prevState: State,
  formData: FormData,
): Promise<State> {
  // Validate form using Zod
  const validated = CreateProduct.safeParse({
    product_id: formData.get('product_id'),
    price: formData.get('price'),
    product_name: formData.get('product_name'),
    product_description: formData.get('product_description'),
    seller_id: formData.get('seller_id'),
  });

  if (!validated.success) {
    const fieldErrors = validated.error.format();
    const errors: State['errors'] = {};
    // Map zod errors to our State.errors structure
    for (const key of Object.keys(fieldErrors)) {
      // @ts-ignore - formatting keys may include _errors
      const val = fieldErrors[key];
      if (val && typeof val === 'object' && Array.isArray((val as any)._errors)) {
        // @ts-ignore
        errors[key as keyof State['errors']] = (val as any)._errors as string[];
      }
    }

    return { ...prevState, errors };
  }

  // Successful validation - return a success message. You can add DB insert logic here.
  // Insert data into the database
  try {
    await sql`
      INSERT INTO public.products (product_id, price, product_name, product_description, seller_id)
      VALUES (${validated.data.product_id}, ${validated.data.price}, ${validated.data.product_name}, ${validated.data.product_description}, ${validated.data.seller_id})
    `;

    // Revalidate the catalog page cache so the new product appears.
    revalidatePath('/catalog');

    return { message: 'Product created', errors: {} };
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to create product.',
      errors: {},
    };
  }
  // Note: redirect handled by the client if desired. Server action returns status.
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
    seller_id: formData.get('seller_id'),
  });

  if (!validated.success) {
    const fieldErrors = validated.error.format();
    const errors: State['errors'] = {};
    for (const key of Object.keys(fieldErrors)) {
      // @ts-ignore
      const val = fieldErrors[key];
      if (val && typeof val === 'object' && Array.isArray((val as any)._errors)) {
        // @ts-ignore
        errors[key as keyof State['errors']] = (val as any)._errors as string[];
      }
    }
    return { ...prevState, errors };
  }

  try {
    await sql`
      UPDATE public.products
      SET price = ${validated.data.price},
          product_name = ${validated.data.product_name},
          product_description = ${validated.data.product_description},
          seller_id = ${validated.data.seller_id}
      WHERE product_id = ${id}
    `;

    revalidatePath('/catalog');
    return { message: 'Product updated', errors: {} };
  } catch (error) {
    return { message: 'Database Error: Failed to update product.', errors: {} };
  }
}