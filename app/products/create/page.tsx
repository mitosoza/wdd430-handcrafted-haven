import Form from "@/app/ui/products/create-product-form";
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { fetchCategories } from "@/app/lib/data";

export const metadata: Metadata = {
  title: "Create Product",
};

export default async function Page() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'seller') {
      redirect('/dashboard');
  }

  const categories = await fetchCategories();

  return (
    <main className="p-6">
      <div className="max-w-2xl">
        <h1 className="mb-6 text-3xl font-semibold">Create Product</h1>
        <Form categories={categories} />
      </div>
    </main>
  );
}