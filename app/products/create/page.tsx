import Form from "@/app/ui/products/create-product-form";
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { fetchCategories } from "@/app/lib/data";
import Header from '@/app/ui/header';

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
    <main className="flex flex-col min-h-screen landing-page-gradient">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl">
          <h1 className="mb-6 text-3xl font-semibold">Create Product</h1>
          <Form categories={categories} />
        </div>
      </div>
    </main>
  );
}