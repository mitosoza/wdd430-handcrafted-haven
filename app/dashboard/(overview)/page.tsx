import { lusitana } from '@/app/ui/fonts';
import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email || 'User';

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4">
      <h1 className={`${lusitana.className} text-3xl font-bold mb-6`}>Welcome, {userName}!</h1>
      <p className="mb-8 text-gray-700 text-lg">This is your dashboard. Here you can view, update your account and manage your addresses.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/orders" className="rounded-lg bg-green-600 text-white px-6 py-4 text-center font-semibold hover:bg-green-700 transition">My Orders</Link>
        <Link href="/dashboard/addresses" className="rounded-lg bg-green-600 text-white px-6 py-4 text-center font-semibold hover:bg-green-700 transition">My Addresses</Link>
        <Link href="/products" className="rounded-lg bg-green-600 text-white px-6 py-4 text-center font-semibold hover:bg-green-700 transition">Browse Products</Link>
      </div>
    </div>
  );
}