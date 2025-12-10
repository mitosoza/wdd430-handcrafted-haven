
import { Metadata } from "next";
import UserForm from "@/app/ui/users/create-user-form";
import { Suspense } from 'react';
import Header from '@/app/ui/header';
import { fetchSellers, fetchUsers } from "@/app/lib/data";


export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: "Create User",
};

export default function Page() {
fetchUsers();
fetchSellers();
  return (
    <main className="flex flex-col min-h-screen landing-page-gradient">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
          <Suspense>
            <UserForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}