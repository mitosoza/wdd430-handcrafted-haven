import { Suspense } from 'react';
import { Metadata } from 'next';
import Header from '@/app/ui/header';
import CartList from '../ui/cart/cart-list';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cart',
};

export default function CartPage() {
  return (
    <main className="min-h-screen landing-page-gradient">
      <Header />
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
            <Suspense fallback={
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              </div>
            }>
              <CartList />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}