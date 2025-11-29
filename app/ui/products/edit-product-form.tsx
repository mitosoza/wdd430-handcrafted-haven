"use client";

import { Product, Seller } from "@/app/lib/definitions";
import { CurrencyDollarIcon, UserCircleIcon, PhotoIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "@/app/ui/button";
import { updateProduct, State } from "@/app/lib/actions";
import { useActionState } from "react";

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
    <form action={formAction} encType="multipart/form-data">
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* ✅ Success Message */}
        {state?.message && (
          <div className="mb-4 flex items-center rounded-md bg-green-100 p-3 text-green-700">
            <CheckCircleIcon className="mr-2 h-5 w-5" />
            <span>{state.message}</span>
          </div>
        )}

        {/* Product Name */}
        <div className="mb-4">
          <label htmlFor="product_name" className="mb-2 block text-sm font-medium">
            Product name
          </label>
          <input
            id="product_name"
            name="product_name"
            type="text"
            defaultValue={product.product_name}
            required
            className="block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm"
          />
          {state?.errors?.product_name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.product_name.join(", ")}</p>
          )}
        </div>

        {/* Product Description */}
        <div className="mb-4">
          <label htmlFor="product_description" className="mb-2 block text-sm font-medium">
            Description
          </label>
          <textarea
            id="product_description"
            name="product_description"
            rows={4}
            defaultValue={product.product_description}
            required
            className="block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm"
          />
          {state?.errors?.product_description && (
            <p className="mt-1 text-sm text-red-600">{state.errors.product_description.join(", ")}</p>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <label htmlFor="price" className="mb-2 block text-sm font-medium">
            Price (in cents)
          </label>
          <div className="relative">
            <input
              id="price"
              name="price"
              type="number"
              step="1"
              defaultValue={product.price as unknown as string}
              required
              className="block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm"
            />
            <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          {state?.errors?.price && (
            <p className="mt-1 text-sm text-red-600">{state.errors.price.join(", ")}</p>
          )}
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
              defaultValue={product.seller_id}
              className="block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm"
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
            <p className="mt-1 text-sm text-red-600">{state.errors.seller_id.join(", ")}</p>
          )}
        </div>

        {/* Product Image Upload */}
        <div className="mb-4">
          <label htmlFor="product_image" className="mb-2 block text-sm font-medium">
            Product Image
          </label>
          {product.product_image && (
            <div className="mb-2">
              <img
                src={`/${product.product_image}`}
                alt="Current product image"
                className="h-32 w-32 object-cover rounded-md border"
              />
            </div>
          )}
          <input
            id="product_image"
            name="product_image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
          />
          {state?.errors?.product_image && (
            <p className="mt-1 text-sm text-red-600">{state.errors.product_image.join(", ")}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/products"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Product</Button>
      </div>
    </form>
  );
}