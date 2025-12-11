
export type User = {
  user_id: string;
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  user_password: string;
};

export type Seller = {
  seller_id: string;
  seller_first_name: string;
  seller_last_name: string;
  seller_email: string;
  seller_image: string;
  seller_password: string;
};

export type Product = {
  id: string;
  product_description: string;
  price: string;
  product_name: string;
  seller_id: string;
  product_image: string;
  category_id: string;

};

export type Review = {
  review_id: string;
  review_date: string;
  review_text: string;
  product_id: string;
  seller_id: string;
  user_id: string;
  user_first_name: string;
  review_rating: number;
};

export type Category = {
  category_id: string;
  category_name: string;
  category_image: string;
}

export type Order = {
  order_id: string;
  user_id: string;
  order_date: string;
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: string;
  shipping_address_id: string;
  created_at: string;
  updated_at: string;
}

export type OrderItem = {
  order_item_id: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export type Address = {
  address_id: string;
  user_id: string;
  is_default: boolean;
  street_address_1: string;
  street_address_2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  seller_id?: string;
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  image_url: string;
  name: string;
  email: string;
  amount: string;
};

export type Account = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  profile_image: string;
};