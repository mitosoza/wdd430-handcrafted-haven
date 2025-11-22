'use client';
 

import { useActionState } from 'react';
import { createProduct, State } from '@/app/lib/actions';
import { Product } from '@/app/lib/definitions';
import Link from 'next/link';
import { Button } from '@/app/ui/button';


export default function form(){
    const initialState: State = { message: null, errors: {} };

    const [state, formAction] = useActionState<State, FormData>(
        createProduct,
        initialState,
    );

    return (
        <form action={formAction} className="w-full max-w-lg space-y-4">
            {state?.message && (
                <div className="rounded bg-green-50 p-3 text-green-800">{state.message}</div>
            )}

            <input type="hidden" name="product_id" value="" />

            <div>
                <label htmlFor="product_name" className="block text-sm font-medium text-gray-700">
                    Product name
                </label>
                <input
                    id="product_name"
                    name="product_name"
                    type="text"
                    required
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                />
                {state?.errors?.product_name && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.product_name.join(', ')}</p>
                )}
            </div>

            <div>
                <label htmlFor="product_description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    id="product_description"
                    name="product_description"
                    rows={4}
                    required
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                />
                {state?.errors?.product_description && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.product_description.join(', ')}</p>
                )}
            </div>

            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price (in cents)
                </label>
                <input
                    id="price"
                    name="price"
                    type="number"
                    required
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                />
                {state?.errors?.price && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.price.join(', ')}</p>
                )}
            </div>

            <div>
                <label htmlFor="seller_id" className="block text-sm font-medium text-gray-700">
                    Seller ID
                </label>
                <input
                    id="seller_id"
                    name="seller_id"
                    type="text"
                    required
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                />
                {(state?.errors as Record<string, string[] | undefined>)?.seller_id && (
                    <p className="mt-1 text-sm text-red-600">{(state.errors as Record<string, string[] | undefined>)?.seller_id?.join(', ')}</p>
                )}
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit">Create product</Button>
                {/** Show pending state if available */}
                {/** useActionState provides isPending as the third value, but the current usage only grabbed two — form submit will still work */}
            </div>
        </form>
    );
}