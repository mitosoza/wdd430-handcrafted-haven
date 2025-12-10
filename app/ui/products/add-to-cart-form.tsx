'use client';

import { useState } from 'react';
import { CartState } from '@/app/lib/actions';

interface CartItem {
    productId: string;
    quantity: number;
    productName: string;
    price: string;
    productImage: string;
}

interface AddToCartFormProps {
    productId: string;
    productName: string;
    price: string;
    productImage: string;
    cartState?: CartState;
    onAddToCart?: (formData: FormData) => void;
}

export default function AddToCartForm({
    productId,
    productName,
    price,
    productImage,
    cartState,
    onAddToCart
}: AddToCartFormProps) {
    const [quantity, setQuantity] = useState(1);

    const handleSubmit = async (formData: FormData) => {
        // Add localStorage logic here
        try {
            // Get existing cart from localStorage
            const existingCart = localStorage.getItem('havenCart');
            let cartItems: CartItem[] = existingCart ? JSON.parse(existingCart) : [];

            // Check if item already exists in cart
            const existingItemIndex = cartItems.findIndex(item => item.productId === productId);

            if (existingItemIndex !== -1) {
                // Update quantity if item exists
                cartItems[existingItemIndex].quantity += quantity;
            } else {
                // Add new item to cart
                const newItem: CartItem = {
                    productId,
                    quantity,
                    productName,
                    price,
                    productImage
                };
                cartItems.push(newItem);
            }

            // Save updated cart to localStorage
            localStorage.setItem('havenCart', JSON.stringify(cartItems));

        } catch (error) {
            console.error('Error adding to cart:', error);
        }

        // Call the server action to show success message
        if (onAddToCart) {
            onAddToCart(formData);
        }
    };

    return (
        <div className="space-y-4">
            <form action={handleSubmit}>
                <input type="hidden" name="productName" value={productName} />
                <input type="hidden" name="quantity" value={quantity} />

                <div className="flex items-center gap-4 ml-20">
                    <div className="flex items-center gap-2">
                        <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                            Quantity:
                        </label>
                        <select
                            id="quantity"
                            name="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm w-20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        >
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="rounded-full bg-cyan-200/50 px-8 py-3 text-gray-900 font-semibold hover:bg-cyan-200 transition-colors"
                    >
                        Add to cart
                    </button>
                </div>
            </form>
        </div>
    );
}