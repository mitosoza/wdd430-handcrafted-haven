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
  };
  message?: string | null;
};

export function createProduct(){
    
}