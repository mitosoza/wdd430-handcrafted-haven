'use client';

import { useActionState } from 'react';
import { createAddress, updateAddress, AddressState } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import { Address } from '@/app/lib/definitions';

export default function CreateAddressForm({ address }: { address?: Address }) {
    const initialState: AddressState = { message: null, errors: {} };
    const isEditing = !!address;

    // Create a bound version of updateAddress for this specific address
    const updateAddressWithId = isEditing
        ? updateAddress.bind(null, address.address_id)
        : createAddress;

    const [state, formAction] = useActionState<AddressState, FormData>(
        updateAddressWithId,
        initialState,
    );
    return (
        <form
            action={formAction}
            className="rounded-lg bg-gray-50 px-6 pb-4 pt-8 ring-gray-300 shadow-[0_0_15px_rgba(0,0,0,0.1)]"
        >
            {state?.message && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
                    {state.message}
                </div>
            )}

            <h1 className={`${lusitana.className} mb-3 text-2xl text-center font-bold`}>
                {isEditing ? 'Edit Address' : 'Create New Address'}
            </h1>
            <div className="mb-4">
                <label
                    htmlFor="first_name"
                    className="mb-2 block text-sm font-semibold text-gray-900"
                >
                    First Name *
                </label>
                <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="e.g., John"
                    defaultValue={state?.fieldValues?.first_name || address?.first_name || ''}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.first_name && (
                    <p className="mt-1 text-sm text-red-600">
                        {state.errors.first_name.join(', ')}
                    </p>
                )}
            </div>
            <div className="mb-4">
                <label
                    htmlFor="last_name"
                    className="mb-2 block text-sm font-semibold text-gray-900"
                >
                    Last Name *
                </label>
                <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="e.g., Doe"
                    defaultValue={state?.fieldValues?.last_name || address?.last_name || ''}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.last_name && (
                    <p className="mt-1 text-sm text-red-600">
                        {state.errors.last_name.join(', ')}
                    </p>
                )}
            </div>

            {/* Address Line 1 */}
            <div className="mb-4">
                <label
                    htmlFor="street_address_1"
                    className="mb-2 block text-sm font-semibold text-gray-900"
                >
                    Address Line 1 *
                </label>
                <input
                    id="street_address_1"
                    name="street_address_1"
                    type="text"
                    placeholder="e.g., 123 Main Street"
                    defaultValue={state?.fieldValues?.street_address_1 || address?.street_address_1 || ''}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.street_address_1 && (
                    <p className="mt-1 text-sm text-red-600">
                        {state.errors.street_address_1.join(', ')}
                    </p>
                )}
            </div>

            {/* Address Line 2 */}
            <div className="mb-4">
                <label
                    htmlFor="street_address_2"
                    className="mb-2 block text-sm font-semibold text-gray-900"
                >
                    Address Line 2
                </label>
                <input
                    id="street_address_2"
                    name="street_address_2"
                    type="text"
                    placeholder="e.g., Apartment, suite, etc. (optional)"
                    defaultValue={state?.fieldValues?.street_address_2 || address?.street_address_2 || ''}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.street_address_2 && (
                    <p className="mt-1 text-sm text-red-600">
                        {state.errors.street_address_2.join(', ')}
                    </p>
                )}
            </div>

            {/* City */}
            <div className="mb-4">
                <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-semibold text-gray-900"
                >
                    City *
                </label>
                <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="e.g., New York"
                    defaultValue={state?.fieldValues?.city || address?.city || ''}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.city && (
                    <p className="mt-1 text-sm text-red-600">
                        {state.errors.city.join(', ')}
                    </p>
                )}
            </div>

            {/* State/Province and Postal Code - side by side */}
            <div className="mb-4 flex gap-4">
                <div className="flex-1">
                    <label
                        htmlFor="state_province"
                        className="mb-2 block text-sm font-semibold text-gray-900"
                    >
                        State/Province *
                    </label>
                    <input
                        id="state_province"
                        name="state_province"
                        type="text"
                        placeholder="e.g., NY"
                        defaultValue={state?.fieldValues?.state_province || address?.state_province || ''}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    {state?.errors?.state_province && (
                        <p className="mt-1 text-sm text-red-600">
                            {state.errors.state_province.join(', ')}
                        </p>
                    )}
                </div>

                <div className="flex-1">
                    <label
                        htmlFor="postal_code"
                        className="mb-2 block text-sm font-semibold text-gray-900"
                    >
                        Postal Code *
                    </label>
                    <input
                        id="postal_code"
                        name="postal_code"
                        type="text"
                        placeholder="e.g., 10001"
                        defaultValue={state?.fieldValues?.postal_code || address?.postal_code || ''}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    {state?.errors?.postal_code && (
                        <p className="mt-1 text-sm text-red-600">
                            {state.errors.postal_code.join(', ')}
                        </p>
                    )}
                </div>
            </div>

            {/* Country */}
            <div className="mb-4">
                <label
                    htmlFor="country"
                    className="mb-2 block text-sm font-semibold text-gray-900"
                >
                    Country *
                </label>
                <select
                    id="country"
                    name="country"
                    defaultValue={state?.fieldValues?.country || address?.country || 'United States'}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Other">Other</option>
                </select>
                {state?.errors?.country && (
                    <p className="mt-1 text-sm text-red-600">
                        {state.errors.country.join(', ')}
                    </p>
                )}
            </div>

            {/* Set as Default Address */}
            <div className="mb-6">
                <div className="flex items-center">
                    <input
                        id="is_default"
                        name="is_default"
                        type="checkbox"
                        defaultChecked={address?.is_default || false}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                        htmlFor="is_default"
                        className="ml-2 block text-sm text-gray-900"
                    >
                        Set as default address
                    </label>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4">
                <Button
                    type="submit"
                    className="bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                >
                    {isEditing ? 'Update Address' : 'Create Address'}
                </Button>
                <Link
                    href="/dashboard/addresses"
                    className="rounded-lg border border-gray-300 px-6 py-2 text-gray-900 font-medium hover:bg-gray-50"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}