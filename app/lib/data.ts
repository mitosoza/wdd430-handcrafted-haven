import postgres from 'postgres';
import {
  Product, Seller, User
} from './definitions';

const sql = postgres(process.env.POSTGRES_URL || '', { ssl: 'require' });

export async function fetchProducts() {
  try {
    const data = await sql<Product[]>`
    SELECT product_id, price, product_image, product_description, seller_id, product_name FROM public.products ORDER BY product_name DESC  `;
    console.log(data);
    return data;
  }
  catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch products.');
  }
}

export async function fetchSellers() {
  try {
    const data = await sql<Seller[]>`
    SELECT seller_id, seller_first_name, seller_last_name, seller_email, seller_image FROM public.sellers ORDER BY seller_first_name DESC  `;
    console.log(data);
    return data;
  }
  catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch sellers.');
  }
}

export async function fetchUsers() {
  try {
    const data = await sql<User[]>`
    SELECT user_id, user_first_name, user_last_name, user_email FROM public.users ORDER BY user_first_name DESC  `;
    console.log(data);
    return data;
  }
  catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch users.');
  }
}

export async function fetchSellerById(id: string) {
  try {
    const rows = await sql`
      SELECT seller_id, seller_first_name, seller_last_name, seller_email, seller_image
      FROM public.sellers
      WHERE seller_id = ${id}
      LIMIT 1
    `;

    const row = rows && rows[0];
    if (!row) return null;

    const seller: Seller = {
      seller_id: row.seller_id,
      seller_first_name: row.seller_first_name ?? '',
      seller_email: row.seller_email ?? '',
      seller_image: row.seller_image ?? '',
      seller_password: row.seller_password ?? '',
    } as Seller;

    

    return seller;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch seller');
  }
}

export async function fetchProductById(id: string) {
  try {
    const rows = await sql`
      SELECT product_id, price, product_image, product_description, seller_id, product_name
      FROM public.products
      WHERE product_id = ${id}
      LIMIT 1
    `;

    const row = rows && rows[0];
    if (!row) return null;

    // Map DB row (product_id) to Product shape (id)
    const product: Product = {
      id: row.product_id ?? String(id),
      product_description: row.product_description ?? '',
      price: row.price ?? '0',
      product_name: row.product_name ?? '',
      seller_id: row.seller_id ?? '',
      product_image: row.product_image ?? '',
    };

    return product;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch product');
  }
}

export async function fetchProductsBySellerId(id: string): Promise<Product[]> {
  try {
    const rows = await sql`
      SELECT product_id, price, product_image, product_description, seller_id, product_name
      FROM public.products
      WHERE seller_id = ${id}
    `;

    // Map all rows to Product shape
    const products: Product[] = rows.map((row: any) => ({
      id: row.product_id ?? '',
      product_description: row.product_description ?? '',
      price: row.price ?? '0',
      product_name: row.product_name ?? '',
      seller_id: row.seller_id ?? '',
      product_image: row.product_image ?? '',
    }));

    return products;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch products by seller');
  }
}

