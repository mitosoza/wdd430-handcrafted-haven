import EditProductForm from "@/app/ui/products/edit-product-form";
import { Metadata } from "next";
import { fetchProductById, fetchSellers } from "@/app/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Update Product",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch product and sellers
  const [product, sellers] = await Promise.all([
    fetchProductById(id).catch(() => null),
    fetchSellers().catch(() => []),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <main className="p-6">
      <div className="max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Update Product</h1>
          {/*Back link to products */}
          <Link
            href="/products"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
          >
            ← Back to Products
          </Link>
        </div>

        <EditProductForm product={product} sellers={sellers} />
      </div>
    </main>
  );
}