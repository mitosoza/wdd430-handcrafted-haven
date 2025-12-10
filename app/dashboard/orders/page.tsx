import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchOrdersForUser } from '@/app/lib/data';
import { auth } from '@/auth';
import { Order } from '@/app/lib/definitions';

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

    const session = await auth();
    let userId = null;
    if (session?.user?.id) {
        userId = session.user.id;
    }

    let orders: Order[] = [];
    if (userId) {
        orders = await fetchOrdersForUser(userId);
    }

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>My Orders</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search orders..." />
            </div>
            <div className="mt-6 flow-root">
                <div className="inline-block min-w-full align-middle">
                    <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                        <div className="md:hidden">
                            <div className="mb-2 w-full rounded-md bg-white p-4">
                                <div className="text-center text-gray-500">
                                    {orders.length === 0 ? 'No orders found.' : `${orders.length} orders found.`}
                                </div>
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
                                        Time
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium">
                                        Status
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="whitespace-nowrap px-6 py-3 text-center text-gray-500">
                                            No orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.order_id} className="border-b last-of-type:border-none">
                                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-cyan-700">{order.order_id}</td>
                                            <td className="whitespace-nowrap px-3 py-3">{order.order_date ? new Date(order.order_date).toLocaleDateString() : ''}</td>
                                            <td className="whitespace-nowrap px-3 py-3">{order.order_date ? new Date(order.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</td>
                                            <td className="whitespace-nowrap px-3 py-3 capitalize">{order.order_status}</td>
                                            <td className="whitespace-nowrap px-3 py-3">${order.total_amount}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    );
}
