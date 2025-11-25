import postgres from 'postgres';
import {
  Product, Seller, User, Review
} from './definitions';
import { formatCurrency } from './utils';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchProducts() {
  try{
    const data = await sql<Product[]>`
    SELECT product_id, price, product_image, product_description, seller_id, product_name FROM public.products ORDER BY product_name DESC  `;
    console.log(data);
    return data;
  }
  catch(error){
    console.error('Database Error:', error);
    throw new Error('Failed to fetch products.');
  }
}

export async function fetchSellers(){
  try{
const data = await sql<Seller[]>`
    SELECT seller_id, seller_first_name, seller_last_name, seller_email, seller_image FROM public.sellers ORDER BY seller_first_name DESC  `;
    console.log(data);
    return data;
  }
  catch(error){
    console.error('Database Error:', error);
    throw new Error('Failed to fetch sellers.');
  }
}

export async function fetchUsers(){
  try{
const data = await sql<User[]>`
    SELECT user_id, user_first_name, user_last_name, user_email FROM public.users ORDER BY user_first_name DESC  `;
    console.log(data);
    return data;
  }
  catch(error){
    console.error('Database Error:', error);
    throw new Error('Failed to fetch users.');
  }
}