'use client';

import { useActionState } from 'react';
import { createUser, UserState } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';
import Link from 'next/link';

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
      className="rounded-lg bg-white p-6 shadow"
    >
      {state?.message && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
          {state.message}
        </div>
      )}

      {/* First Name */}
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
      <div className="mb-6">
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