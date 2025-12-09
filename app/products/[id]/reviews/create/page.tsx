import Form from "@/app/ui/products/create-review-form";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProductById, fetchSellerById } from "@/app/lib/data";

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Create Review",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch product
  const product = await fetchProductById(id).catch(() => null);

  if (!product) {
    notFound();
  }

  const seller = await fetchSellerById(product.seller_id).catch(() => null);

  if (!seller) {
    notFound();
  }
  
  return (
    <main className="p-6">
      <div className="max-w-2xl">
        <h1 className="mb-6 text-3xl font-semibold">Create Review for {product.product_name}</h1>
        <Form product={product} seller={seller} /> 
      </div>
    </main>
  );
}