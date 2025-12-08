import CreateAddressForm from '@/app/ui/addresses/create-address-form';
import Breadcrumbs from '@/app/ui/addresses/breadcrumbs';
import { fetchAddressById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { auth } from '@/auth';

export const metadata: Metadata = {
    title: 'Edit Address',
};

export const dynamic = 'force-dynamic';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;

    // Get current user session
    const session = await auth();

    if (!session?.user?.email) {
        notFound();
    }

    const address = await fetchAddressById(id, session.user.email);

    if (!address) {
        notFound();
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Addresses', href: '/dashboard/addresses' },
                    {
                        label: 'Edit Address',
                        href: `/dashboard/addresses/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            <CreateAddressForm address={address} />
        </main>
    );
}