import Form from "@/app/ui/products/create-product-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Product",
};

export default function Page() {
  return (
    <main className="p-6">
      <div className="max-w-2xl">
        <h1 className="mb-6 text-3xl font-semibold">Create Product</h1>
        <Form />
      </div>
    </main>
  );
}