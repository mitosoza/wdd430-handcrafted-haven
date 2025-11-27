'use client';

import { useActionState } from 'react';
import { createProduct, State } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';
import Link from 'next/link';

export default function Form() {
    const initialState: State = { message: null, errors: {} };

    const [state, formAction] = useActionState<State, FormData>(
        createProduct,
        initialState,
    );

    return (
        <form action={formAction} encType="multipart/form-data" className="rounded-lg bg-white p-6 shadow">
            {state?.message && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
                    {state.message}
                </div>
            )}

            <input type="hidden" name="product_id" value="" />

            {/* Product Name */}
            <div className="mb-4">
                <label htmlFor="product_name" className="mb-2 block text-sm font-semibold text-gray-900">
                    Product Name
                </label>
                <input
                    id="product_name"
                    name="product_name"
                    type="text"
                    placeholder="e.g., Handmade Scarf"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.product_name && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.product_name.join(', ')}</p>
                )}
            </div>

            {/* Product Description */}
            <div className="mb-4">
                <label htmlFor="product_description" className="mb-2 block text-sm font-semibold text-gray-900">
                    Description
                </label>
                <textarea
                    id="product_description"
                    name="product_description"
                    placeholder="Describe your product in detail..."
                    rows={4}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.product_description && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.product_description.join(', ')}</p>
                )}
            </div>

            {/* Price */}
            <div className="mb-4">
                <label htmlFor="price" className="mb-2 block text-sm font-semibold text-gray-900">
                    Price (in cents)
                </label>
                <input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="e.g., 2999 for $29.99"
                    step="1"
                    min="0"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.price && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.price.join(', ')}</p>
                )}
            </div>

            {/* Product Image */}
            <div className="mb-6">
                <label htmlFor="product_image" className="mb-2 block text-sm font-semibold text-gray-900">
                    Product Image (Optional)
                </label>
                <input
                    id="product_image"
                    name="product_image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 file:mr-4 file:rounded file:border-0 file:bg-blue-500 file:px-4 file:py-1 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-600"
                />
                <p className="mt-1 text-sm text-gray-500">Supported formats: JPEG, PNG, WebP (Max 5MB)</p>
                {state?.errors?.product_image && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.product_image.join(', ')}</p>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4">
                <Button type="submit" className="bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
                    Create Product
                </Button>
                <Link 
                    href="/products" 
                    className="rounded-lg border border-gray-300 px-6 py-2 text-gray-900 font-medium hover:bg-gray-50"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}