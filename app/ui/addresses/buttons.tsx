'use client';

import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteAddress } from '@/app/lib/actions';

export function UpdateAddress({ id }: { id: string }) {
    return (
        <Link
            href={`/dashboard/addresses/${id}/edit`}
            className="rounded-md border p-2 hover:bg-gray-100"
        >
            <PencilIcon className="w-5" />
        </Link>
    );
}

export function DeleteAddress({ id }: { id: string }) {
    const deleteAddressWithId = deleteAddress.bind(null, id);

    return (
        <form action={deleteAddressWithId}>
            <button
                type="submit"
                className="rounded-md border p-2 hover:bg-red-50 hover:border-red-300 transition-colors"
                onClick={(e) => {
                    if (!confirm('Are you sure you want to delete this address?')) {
                        e.preventDefault();
                    }
                }}
            >
                <TrashIcon className="w-5 text-gray-600 hover:text-red-600 transition-colors" />
            </button>
        </form>
    );
}