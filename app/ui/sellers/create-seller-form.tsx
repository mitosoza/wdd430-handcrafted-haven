'use client';

import { useActionState } from 'react';
import { createSeller, SellerState } from '@/app/sellers/actions';
import { Button } from '@/app/ui/button';
import Link from 'next/link';

export default function CreateSellerForm() {
    const initialState: SellerState = { message: null, errors: {} };

    const [state, formAction] = useActionState<SellerState, FormData>(
        createSeller,
        initialState,
    );

    return (
        <form action={formAction} className="rounded-lg bg-white p-6 shadow">
            {state?.message && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
                    {state.message}
                </div>
            )}

            <input type="hidden" name="seller_id" value="" />

            {/* First Name */}
            <div className="mb-4">
                <label htmlFor="seller_first_name" className="mb-2 block text-sm font-semibold text-gray-900">
                    First Name
                </label>
                <input
                    id="seller_first_name"
                    name="seller_first_name"
                    type="text"
                    placeholder="e.g., John"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.seller_first_name && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.seller_first_name.join(', ')}</p>
                )}
            </div>

            {/* Last Name */}
            <div className="mb-4">
                <label htmlFor="seller_last_name" className="mb-2 block text-sm font-semibold text-gray-900">
                    Last Name
                </label>
                <input
                    id="seller_last_name"
                    name="seller_last_name"
                    type="text"
                    placeholder="e.g., Doe"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.seller_last_name && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.seller_last_name.join(', ')}</p>
                )}
            </div>

            {/* Email */}
            <div className="mb-4">
                <label htmlFor="seller_email" className="mb-2 block text-sm font-semibold text-gray-900">
                    Email
                </label>
                <input
                    id="seller_email"
                    name="seller_email"
                    type="email"
                    placeholder="e.g., john.doe@example.com"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.seller_email && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.seller_email.join(', ')}</p>
                )}
            </div>

            {/* Password */}
            <div className="mb-4">
                <label htmlFor="seller_password" className="mb-2 block text-sm font-semibold text-gray-900">
                    Password
                </label>
                <input
                    id="seller_password"
                    name="seller_password"
                    type="password"
                    placeholder="Enter a secure password"
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.seller_password && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.seller_password.join(', ')}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Must be at least 6 characters</p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4">
                <Button type="submit" className="bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
                    Create Seller Profile
                </Button>
                <Link
                    href="/sellers"
                    className="rounded-lg border border-gray-300 px-6 py-2 text-gray-900 font-medium hover:bg-gray-50"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
