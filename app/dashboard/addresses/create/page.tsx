import Breadcrumbs from '@/app/ui/addresses/breadcrumbs';
import CreateAddressForm from '@/app/ui/addresses/create-address-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Address',
};

export const dynamic = 'force-dynamic';

export default async function Page() {
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Addresses', href: '/dashboard/addresses' },
                    {
                        label: 'Create Address',
                        href: '/dashboard/addresses/create',
                        active: true,
                    },
                ]}
            />
            <CreateAddressForm />
        </main>
    );
}
