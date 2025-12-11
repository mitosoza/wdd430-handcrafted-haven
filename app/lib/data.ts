export async function fetchOrdersForUser(userEmail: string): Promise<Order[]> {
  try {
    console.log('Fetching orders for user email:', userEmail);
    const [userResult, sellerResult] = await Promise.all([
      sql`SELECT user_id FROM public.users WHERE user_email = ${userEmail}`,
      sql`SELECT seller_id FROM public.sellers WHERE seller_email = ${userEmail}`
    ]);

    let actualUserId: string | undefined = undefined;
    let actualSellerId: string | undefined = undefined;
    if (userResult.length > 0) {
      actualUserId = userResult[0].user_id;
    }
    if (sellerResult.length > 0) {
      actualSellerId = sellerResult[0].seller_id;
    }
    console.log('Actual User ID:', actualUserId);
    console.log('Actual Seller ID:', actualSellerId);
    if (!actualUserId && !actualSellerId) {
      return [];
    }

    const rows = await sql<Order[]>`
      SELECT * FROM public.orders WHERE user_id = ${actualUserId || null} OR seller_id = ${actualSellerId || null} ORDER BY order_date DESC
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch orders for user');
  }
}

import postgres from 'postgres';
import {
  Product, Seller, User, Review, Category, Address, Order, Account
} from './definitions';

const sql = postgres(process.env.POSTGRES_URL || '', { ssl: 'require' });

export async function fetchProducts(search?: string) {
  if (search) {
    return await sql`
      SELECT product_id, product_name, product_description, price, product_image
      FROM public.products
      WHERE product_name ILIKE ${'%' + search + '%'}
      ORDER BY product_name ASC
    `;
  }

  return await sql`
    SELECT product_id, product_name, product_description, price, product_image
    FROM public.products
    ORDER BY product_name ASC
  `;
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

export async function fetchCategories() {
  try {
    const data = await sql<Category[]>`
    SELECT category_id, category_name, category_image FROM public.categories ORDER BY category_name ASC  `;
    return data;
  }
  catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch categories.');
  }
}

export async function fetchSellersWithProducts() {
  try {
    const data = await sql<Seller[]>`
    SELECT DISTINCT s.seller_id, s.seller_first_name, s.seller_last_name, s.seller_email, s.seller_image
    FROM public.sellers s
    INNER JOIN public.products p ON s.seller_id = p.seller_id
    ORDER BY s.seller_first_name ASC  `;
    return data;
  }
  catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch sellers with products.');
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

    const user: User = {
      user_id: row.user_id,
      user_first_name: row.user_first_name,
      user_last_name: row.user_last_name
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
      SELECT product_id, price, product_image, product_description, seller_id, product_name, category_id
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
      category_id: row.category_id ?? '',
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
      SELECT product_id, price, product_image, product_description, seller_id, product_name, category_id
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
      category_id: row.category_id ?? '',
    }));

    return products;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch products by seller');
  }
}

export async function fetchCategoryById(id: string): Promise<Category> {
  try {
    const rows = await sql`
      SELECT category_id, category_name, category_image
      FROM public.categories
      WHERE category_id = ${id}
      LIMIT 1
    `;

    const row = rows[0];

    const category: Category = {
      category_id: row?.category_id ?? '',
      category_name: row?.category_name ?? '',
      category_image: row?.category_image ?? ''
    };
    console.log(category);
    return category;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch category by id');
  }
}

export async function fetchProductsByCategoryId(id: string): Promise<Product[]> {
  try {
    const rows = await sql`
      SELECT product_id, price, product_image, product_description, seller_id, product_name, category_id
      FROM public.products
      WHERE category_id = ${id}
    `;

    // Map all rows to Product shape
    const products: Product[] = rows.map((row: any) => ({
      id: row.product_id ?? '',
      product_description: row.product_description ?? '',
      price: row.price ?? '0',
      product_name: row.product_name ?? '',
      seller_id: row.seller_id ?? '',
      product_image: row.product_image ?? '',
      category_id: row.category_id ?? '',
    }));

    return products;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch products by category');
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
    public.reviews.review_rating,        
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
      user_first_name: row.user_first_name,
      review_rating: row.review_rating ?? '',
    }));
    console.log(reviews);
    return reviews;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch reviews by product');
  }
}

export async function fetchUserAddresses(userEmail: string, userRole?: 'user' | 'seller'): Promise<Address[]> {
  try {
    let userId: string | undefined = undefined;
    let sellerId: string | undefined = undefined;

    // Try to get both user_id and seller_id from email
    const [userResult, sellerResult] = await Promise.all([
      sql`SELECT user_id FROM public.users WHERE user_email = ${userEmail}`,
      sql`SELECT seller_id FROM public.sellers WHERE seller_email = ${userEmail}`
    ]);

    if (userResult.length > 0) {
      userId = userResult[0].user_id;
    }
    if (sellerResult.length > 0) {
      sellerId = sellerResult[0].seller_id;
    }

    if (!userId && !sellerId) {
      return [];
    }

    // Fetch addresses for this user or seller
    const addresses = await sql<Address[]>`
      SELECT 
        address_id,
        user_id,
        seller_id,
        street_address_1,
        street_address_2,
        city,
        state_province,
        postal_code,
        country,
        is_default,
        first_name,
        last_name,
        created_at,
        updated_at
      FROM public.addresses 
      WHERE (user_id = ${userId || null} OR seller_id = ${sellerId || null})
      ORDER BY is_default DESC, created_at DESC
    `;

    return addresses;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user addresses');
  }
}

export async function fetchAddressById(addressId: string, userEmail: string): Promise<Address | null> {
  try {
    // Get both user_id and seller_id from the email
    const [userResult, sellerResult] = await Promise.all([
      sql`SELECT user_id FROM public.users WHERE user_email = ${userEmail}`,
      sql`SELECT seller_id FROM public.sellers WHERE seller_email = ${userEmail}`
    ]);

    let userId: string | undefined = undefined;
    let sellerId: string | undefined = undefined;
    if (userResult.length > 0) {
      userId = userResult[0].user_id;
    }
    if (sellerResult.length > 0) {
      sellerId = sellerResult[0].seller_id;
    }

    if (!userId && !sellerId) {
      return null;
    }

    // Fetch the specific address for this user or seller
    const addresses = await sql<Address[]>`
      SELECT 
        address_id,
        user_id,
        seller_id,
        street_address_1,
        street_address_2,
        city,
        state_province,
        postal_code,
        country,
        is_default,
        created_at,
        updated_at,
        first_name,
        last_name
      FROM public.addresses 
      WHERE address_id = ${addressId} AND (user_id = ${userId || null} OR seller_id = ${sellerId || null})
    `;

    return addresses.length > 0 ? addresses[0] : null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch address');
  }
}

export async function fetchAccountByEmail(email: string, role: 'user' | 'seller'): Promise<Account | null> {
  try {
    let rows;
    if (role === 'seller') {
      rows = await sql`
        SELECT seller_id as id, seller_first_name as first_name, seller_last_name as last_name, seller_email as email, seller_image as profile_image
        FROM public.sellers
        WHERE seller_email = ${email}
        LIMIT 1
      `;
    } else {
      rows = await sql`
        SELECT user_id as id, user_first_name as first_name, user_last_name as last_name, user_email as email, NULL as profile_image
        FROM public.users
        WHERE user_email = ${email}
        LIMIT 1
      `;
    }

    const row = rows && rows[0];
    if (!row) return null;

    const account: Account = {
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      profile_image: row.profile_image,
      password: ''
    };

    return account;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch account by email');
  }
}