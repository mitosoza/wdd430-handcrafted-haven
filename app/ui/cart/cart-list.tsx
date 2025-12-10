'use client';

import { useState, useEffect } from 'react';
import {
  ShoppingCartIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import ImageWithFallback from '@/app/ui/products/image-with-fallback';
import { formatCurrency } from '@/app/lib/utils';
import Link from 'next/link';
interface CartItem {
  productId: string;
  quantity: number;
  productName: string;
  price: string;
  productImage: string;
}

export default function CartList() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get cart items from localStorage
    const savedCart = localStorage.getItem('havenCart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const removeItem = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('havenCart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const updatedCart = cartItems.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('havenCart', JSON.stringify(updatedCart));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500 mb-4">Start shopping to add items to your cart</p>
        <Link
          href="/products"
          className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {cartItems.map((item) => (
          <div key={item.productId} className="bg-white rounded-lg border p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg bg-gray-50 p-2 flex-shrink-0">
                <ImageWithFallback
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.productId}/show`}
                  className="text-lg font-medium text-gray-900 hover:text-cyan-600 transition-colors"
                >
                  {item.productName}
                </Link>
                <p className="text-gray-600 mt-1">{formatCurrency(parseFloat(item.price))}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label htmlFor={`quantity-${item.productId}`} className="text-sm font-medium text-gray-700">
                    Qty:
                  </label>
                  <select
                    id={`quantity-${item.productId}`}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm w-16 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-lg font-semibold text-gray-900 min-w-[80px] text-right">
                  {formatCurrency(parseFloat(item.price) * item.quantity)}
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove item"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center text-xl font-semibold">
          <span>Total:</span>
          <span>{formatCurrency(getTotalPrice())}</span>
        </div>

        <div className="mt-4 flex gap-3">
          <Link
            href="/products"
            className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg text-center hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/checkout"
            className="flex-1 bg-cyan-600 text-white px-6 py-3 rounded-lg text-center hover:bg-cyan-700 transition-colors"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}