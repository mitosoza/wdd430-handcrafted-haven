'use client';

import { useActionState } from 'react';
import { createUser, UserState } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';

export default function UserForm() {
  const initialState: UserState = { message: null, errors: {} };

  const [state, formAction] = useActionState<UserState, FormData>(
    createUser,
    initialState,
  );

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="rounded-lg bg-gray-50 px-6 pb-4 pt-8  ring-gray-300 shadow-[0_0_15px_rgba(0,0,0,0.1)]"
    >
      {state?.message && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
          {state.message}
        </div>
      )}

      <h1 className={`${lusitana.className} mb-3 text-2xl text-center font-bold`}>
        Sign up
      </h1>
      <div className="mb-4">
        <label
          htmlFor="user_first_name"
          className="mb-2 block text-sm font-semibold text-gray-900"
        >
          First Name
        </label>
        <input
          id="user_first_name"
          name="user_first_name"
          type="text"
          placeholder="e.g., John"
          defaultValue={state?.fieldValues?.user_first_name || ''}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        {state?.errors?.user_first_name && (
          <p className="mt-1 text-sm text-red-600">
            {state.errors.user_first_name.join(', ')}
          </p>
        )}
      </div>

      {/* Last Name */}
      <div className="mb-4">
        <label
          htmlFor="user_last_name"
          className="mb-2 block text-sm font-semibold text-gray-900"
        >
          Last Name
        </label>
        <input
          id="user_last_name"
          name="user_last_name"
          type="text"
          placeholder="e.g., Doe"
          defaultValue={state?.fieldValues?.user_last_name || ''}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        {state?.errors?.user_last_name && (
          <p className="mt-1 text-sm text-red-600">
            {state.errors.user_last_name.join(', ')}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="mb-4">
        <label
          htmlFor="user_email"
          className="mb-2 block text-sm font-semibold text-gray-900"
        >
          Email
        </label>
        <input
          id="user_email"
          name="user_email"
          type="email"
          placeholder="e.g., john.doe@example.com"
          defaultValue={state?.fieldValues?.user_email || ''}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        {state?.errors?.user_email && (
          <p className="mt-1 text-sm text-red-600">
            {state.errors.user_email.join(', ')}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="mb-4">
        <label
          htmlFor="user_password"
          className="mb-2 block text-sm font-semibold text-gray-900"
        >
          Password
        </label>
        <input
          id="user_password"
          name="user_password"
          type="password"
          placeholder="Enter a secure password"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        {state?.errors?.user_password && (
          <p className="mt-1 text-sm text-red-600">
            {state.errors.user_password.join(', ')}
          </p>
        )}
      </div>

      {/* Create Seller Account Checkbox */}
      <div className="mb-6">
        <div className="flex items-center">
          <input
            id="create_seller_account"
            name="create_seller_account"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="create_seller_account"
            className="ml-2 block text-sm text-gray-900"
          >
            Create seller account (allows you to sell products)
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4">
        <Button
          type="submit"
          className="bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          Create User
        </Button>
        <Link
          href="/"
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-900 font-medium hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}