'use client';

import { useActionState } from 'react';
import { createReview, reviewState } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import { Product, Seller } from '@/app/lib/definitions';

import { User } from 'next-auth';

export default function Form(props: { product: Product; seller: Seller, user: User | undefined }) {
    const { product, seller, user } = props; 
    const initialState: reviewState = { message: null, errors: {} };

    const [state, formAction] = useActionState<reviewState, FormData>(
        createReview,
        initialState,
    );

    return (
        <form action={formAction} encType="multipart/form-data" className="rounded-lg bg-white p-6 shadow">
            {state?.message && (
                <div className={`mb-6 rounded-lg p-4 border ${
                    state.message.includes('successfully') 
                        ? 'bg-green-50 text-green-800 border-green-200' 
                        : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                    {state.message}
                </div>
            )}

            <input type="hidden" name="review_id" value="" />
            <input type="hidden" name="product_id" value={product.id} />
            <input type="hidden" name="seller_id" value={seller.seller_id} />
            <input type="hidden" name="user_id" value={user?.id ?? ''} />

            {/* Review Text */}
            <div className="mb-4">
                <label htmlFor="review_text" className="mb-2 block text-sm font-semibold text-gray-900">
                    Review Text
                </label>
                <input
                    id="review_text"
                    name="review_text"
                    type="text"
                    placeholder="e.g., Handmade Scarf"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.review_text && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.review_text.join(', ')}</p>
                )}
            </div>

            {/* Review Rating */}
            <div className="mb-4">
                <label htmlFor="review_rating" className="mb-2 block text-sm font-semibold text-gray-900">
                    Review Rating
                </label>
                <input
                    id="review_rating"
                    name="review_rating"
                    type="number"
                    placeholder="Rate 1-5"
                    min="1"
                    max="5"
                    step="1"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.review_rating && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.review_rating.join(', ')}</p>
                )}
            </div>

            {/* Review Date */}
            <div className="mb-4">
                <label htmlFor="review_date" className="mb-2 block text-sm font-semibold text-gray-900">
                    Review Date
                </label>
                <input
                    id="review_date"
                    name="review_date"
                    type="number"
                    placeholder="e.g., 2025"
                    step="1"
                    min="2020"
                    max="2030"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.review_date && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.review_date.join(', ')}</p>
                )}
            </div>

            

            {/* Form Actions */}
            <div className="flex gap-4">
                <Button type="submit" className="bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
                    Create Review
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