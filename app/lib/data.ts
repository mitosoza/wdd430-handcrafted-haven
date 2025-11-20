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
  }
  catch(error){
    console.error('Database Error:', error);
    throw new Error('Failed to fetch products.');
  }
}

