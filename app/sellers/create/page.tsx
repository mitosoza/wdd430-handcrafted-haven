import CreateSellerForm from "@/app/ui/sellers/create-seller-form";
import { Metadata } from "next";
import { lusitana } from "@/app/ui/fonts";

export const metadata: Metadata = {
  title: "Create Seller Profile",
};

export default function Page() {
  return (
    <main className="min-h-screen landing-page-gradient p-6">
      <div className="max-w-2xl">
        <h1 className={`${lusitana.className} mb-6 text-3xl font-semibold`}>
          Create Seller Profile
        </h1>
        <CreateSellerForm />
      </div>
    </main>
  );
}
