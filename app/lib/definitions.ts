
export type User = {
  user_id: string;
  user_first_name: string;
  user_last_name: string;
  email: string;
  password: string;
};

export type Seller = {
  seller_id: string;
  seller_first_name: string;
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
};

export type Category = {
  category_id: string;
  category_name: string;
  category_image: string;
}

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