import { Address } from '@/app/lib/definitions';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { UpdateAddress, DeleteAddress } from '@/app/ui/addresses/buttons';

export default function AddressesTable({
    addresses,
}: {
    addresses: Address[];
}) {
    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    {/* Mobile view */}
                    <div className="md:hidden">
                        {addresses.length === 0 ? (
                            <div className="mb-2 w-full rounded-md bg-white p-4">
                                <div className="text-center text-gray-500">No addresses found.</div>
                            </div>
                        ) : (
                            addresses.map((address) => (
                                <div key={address.address_id} className="mb-2 w-full rounded-md bg-white p-4">
                                    <div className="flex items-center justify-between border-b pb-4">
                                        <div>
                                            <div className="mb-2 flex items-center">
                                                <p className="text-sm font-medium">{address.street_address_1}</p>
                                                {address.is_default && (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            {address.street_address_2 && (
                                                <p className="text-sm text-gray-500">{address.street_address_2}</p>
                                            )}
                                            <p className="text-sm text-gray-900">
                                                {address.city}, {address.state_province} {address.postal_code}
                                            </p>
                                            <p className="text-sm text-gray-500">{address.country}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop view */}
                    <table className="hidden min-w-full text-gray-900 md:table">
                        <thead className="rounded-lg text-left text-sm font-normal">
                            <tr>
                                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                    Address
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    City
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    State
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Postal Code
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Default
                                </th>
                                <th scope="col" className="relative py-3 pl-6 pr-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {addresses.length === 0 ? (
                                <tr className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
                                    <td colSpan={6} className="whitespace-nowrap px-6 py-3 text-center text-gray-500">
                                        No addresses found.
                                    </td>
                                </tr>
                            ) : (
                                addresses.map((address) => (
                                    <tr
                                        key={address.address_id}
                                        className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                                    >
                                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex flex-col">
                                                <p className="font-medium">{address.street_address_1}</p>
                                                {address.street_address_2 && (
                                                    <p className="text-gray-500 text-xs">{address.street_address_2}</p>
                                                )}
                                                <p className="text-gray-500 text-xs">{address.country}</p>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                            {address.city}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                            {address.state_province}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                            {address.postal_code}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                            {address.is_default ? (
                                                <CheckIcon className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <XMarkIcon className="h-5 w-5 text-gray-400" />
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex justify-end gap-3">
                                                <UpdateAddress id={address.address_id} />
                                                <DeleteAddress id={address.address_id} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}