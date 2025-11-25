"use client";

import { Product, Seller } from '@/app/lib/definitions';
import { CheckIcon, ClockIcon, CurrencyDollarIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateProduct, State } from '@/app/lib/actions';
import { useActionState } from 'react';

export default function EditProductForm({
  product,
  sellers,
}: {
  product: Product;
  sellers: Seller[];
}) {
  const initialState: State = { message: null, errors: {} };
  const updateProductWithId = updateProduct.bind(null, product.id);
  const [state, formAction] = useActionState(updateProductWithId, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Product Name */}
        <div className="mb-4">
          <label htmlFor="product_name" className="mb-2 block text-sm font-medium">
            Product name
          </label>
          <div className="relative">
            <input
              id="product_name"
              name="product_name"
              type="text"
              defaultValue={product.product_name}
              required
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
          {state?.errors?.product_name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.product_name.join(', ')}</p>
          )}
        </div>

        {/* Product Description */}
        <div className="mb-4">
          <label htmlFor="product_description" className="mb-2 block text-sm font-medium">
            Description
          </label>
          <div className="relative">
            <textarea
              id="product_description"
              name="product_description"
              rows={4}
              defaultValue={product.product_description}
              required
              className="mt-1 block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
          {state?.errors?.product_description && (
            <p className="mt-1 text-sm text-red-600">{state.errors.product_description.join(', ')}</p>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <label htmlFor="price" className="mb-2 block text-sm font-medium">
            Price (in cents)
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="price"
                name="price"
                type="number"
                step="1"
                defaultValue={product.price as unknown as string}
                required
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          {state?.errors?.price && <p className="mt-1 text-sm text-red-600">{state.errors.price.join(', ')}</p>}
        </div>

        {/* Seller Select */}
        <div className="mb-4">
          <label htmlFor="seller_id" className="mb-2 block text-sm font-medium">
            Seller
          </label>
          <div className="relative">
            <select
              id="seller_id"
              name="seller_id"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={product.seller_id}
            >
              <option value="" disabled>
                Select a seller
              </option>
              {sellers.map((s) => (
                <option key={s.seller_id} value={s.seller_id}>
                  {s.seller_first_name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          {state?.errors?.seller_id && (
            <p className="mt-1 text-sm text-red-600">{state.errors.seller_id.join(', ')}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/products"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Product</Button>
      </div>
    </form>
  );
}