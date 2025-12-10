'use client';

import { useState, useActionState } from 'react';
import { addToCart, CartState } from '@/app/lib/actions';
import AddToCartForm from '@/app/ui/products/add-to-cart-form';

interface ProductCartWrapperProps {
    productId: string;
    productName: string;
    price: string;
    productImage: string;
    children: React.ReactNode;
}

export default function ProductCartWrapper({
    productId,
    productName,
    price,
    productImage,
    children
}: ProductCartWrapperProps) {
    const initialState: CartState = { message: null, errors: {} };

    const [state, formAction] = useActionState<CartState, FormData>(
        addToCart,
        initialState,
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {state?.message && (
                <div className="rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
                    {state.message}
                </div>
            )}

            <div className="rounded-xl bg-white p-6 shadow-md">
                {children}

                <AddToCartForm
                    productId={productId}
                    productName={productName}
                    price={price}
                    productImage={productImage}
                    cartState={state}
                    onAddToCart={formAction}
                />
            </div>
        </div>
    );
}