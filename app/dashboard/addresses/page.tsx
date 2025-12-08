import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import { fetchUserAddresses } from '@/app/lib/data';
import AddressesTable from '@/app/ui/addresses/table';
import { auth } from '@/auth';

export const metadata: Metadata = {
    title: 'My Addresses',
};

export const dynamic = 'force-dynamic';

function CreateAddress() {
    return (
        <Link
            href="/dashboard/addresses/create"
            className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
            <span className="hidden md:block">Create Address</span>{' '}
            <PlusIcon className="h-5 md:ml-4" />
        </Link>
    );
}

async function AddressesWrapper() {
    const session = await auth();

    if (!session?.user?.email) {
        return (
            <div className="mt-6 text-center text-gray-500">
                Please log in to view your addresses.
            </div>
        );
    }

    const addresses = await fetchUserAddresses(session.user.email);

    return <AddressesTable addresses={addresses} />;
}

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
                <h1 className={`${lusitana.className} text-2xl`}>My Addresses</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search addresses..." />
                <CreateAddress />
            </div>
            <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
                <AddressesWrapper />
            </Suspense>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    );
}
