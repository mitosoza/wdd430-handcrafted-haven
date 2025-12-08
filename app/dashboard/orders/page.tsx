import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Orders',
};

export const dynamic = 'force-dynamic';

export default async function Page(props: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    const totalPages = 1;

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>My Orders</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search orders..." />
            </div>
            <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
                <div className="mt-6 flow-root">
                    <div className="inline-block min-w-full align-middle">
                        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                            <div className="md:hidden">
                                {/* Mobile view placeholder */}
                                <div className="mb-2 w-full rounded-md bg-white p-4">
                                    <div className="text-center text-gray-500">No orders found.</div>
                                </div>
                            </div>
                            <table className="hidden min-w-full text-gray-900 md:table">
                                <thead className="rounded-lg text-left text-sm font-normal">
                                    <tr>
                                        <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                            Order ID
                                        </th>
                                        <th scope="col" className="px-3 py-5 font-medium">
                                            Date
                                        </th>
                                        <th scope="col" className="px-3 py-5 font-medium">
                                            Status
                                        </th>
                                        <th scope="col" className="px-3 py-5 font-medium">
                                            Total
                                        </th>
                                        <th scope="col" className="px-3 py-5 font-medium">
                                            Items
                                        </th>
                                        <th scope="col" className="relative py-3 pl-6 pr-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    <tr className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
                                        <td colSpan={6} className="whitespace-nowrap px-6 py-3 text-center text-gray-500">
                                            No orders found.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Suspense>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    );
}
