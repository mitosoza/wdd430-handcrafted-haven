import postgres from 'postgres';
import {
  Product, Seller, User, Review
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

export async function fetchUserbyId(id: string) {
  try {
    const rows = await sql`
    SELECT user_id, user_first_name, user_last_name, user_email FROM public.users WHERE user_id = ${id}
    LIMIT 1
    `;

    const row = rows && rows[0];
    if (!row) return null;

    const user : User = {
    user_id : row.user_id,
    user_first_name : row.user_first_name,
    user_last_name : row.user_last_name
  } as User

    return user;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user');
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

export async function fetchReviewsByProductId(id: string): Promise<Review[]> {
  try {
   const rows = await sql`
  SELECT 
    public.reviews.review_id,
    public.reviews.review_date,
    public.reviews.review_text,
    public.reviews.product_id,
    public.reviews.seller_id,
    public.reviews.user_id,        
    public.users.user_first_name
  FROM public.reviews
  JOIN public.users ON public.reviews.user_id = public.users.user_id
  WHERE public.reviews.product_id = ${id}
  ORDER BY public.reviews.review_date DESC
`;

    const reviews: Review[] = rows.map((row: any) => ({
      review_id: row.review_id ?? '',
      review_date: row.review_date ?? '',
      review_text: row.review_text ?? '',
      product_id: row.product_id ?? '',
      seller_id: row.seller_id ?? '',
      user_id: row.user_id ?? '',
      user_first_name: row.user_first_name
    }));

    return reviews;
    console.log(reviews);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch reviews by product');
  }
}

