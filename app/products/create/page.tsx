import Form from "@/app/ui/products/create-product-form";
import { Metadata } from "next";
import { auth } from "@/auth";
import { fetchCategories } from "@/app/lib/data";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create Product",
};

export default async function Page() {
  const session = await auth();
  const isSeller = session?.user?.role === 'seller';
  const sellerId = session?.user?.id;

  // Redirect if not a seller
  if (!isSeller || !sellerId) {
    redirect('/login');
  }

  const categories = await fetchCategories();

  return (
    <main className="p-6">
      <div className="max-w-2xl">
        <h1 className="mb-6 text-3xl font-semibold">Create Product</h1>
        <Form categories={categories} sellerId={sellerId} />
      </div>
    </main>
  );
}