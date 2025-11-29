
import { Metadata } from "next";
import UserForm from "@/app/ui/users/create-user-form";
import { fetchUsers } from "@/app/lib/data";

export const metadata: Metadata = {
  title: "Create User",
};

export default function Page() {
fetchUsers();
  return (
    <main className="p-6">
      <div className="max-w-2xl">
        <h1 className="mb-6 text-3xl font-semibold">Create User</h1>
        <UserForm />
      </div>
    </main>
  );
}