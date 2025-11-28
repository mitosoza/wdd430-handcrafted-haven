import EditProductForm from "@/app/ui/products/edit-product-form";
import { Metadata } from "next";
import { fetchProductById, fetchSellers } from "@/app/lib/data";
import { notFound } from 'next/navigation';



export const metadata: Metadata = {
  title: "Update Product",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params;
// Fetch product and sellers.
const [product, sellers] = await Promise.all([ fetchProductById(id).catch(() => null), fetchSellers().catch(() => []), ]);
   {
    if (product){
  return (
    <main className="p-6">
      <div className="max-w-2xl">
        <h1 className="mb-6 text-3xl font-semibold">Update Product</h1>
        <EditProductForm product={product} sellers={sellers} />
      </div>
    </main>
  );}

  else{
    notFound();
  }
}}