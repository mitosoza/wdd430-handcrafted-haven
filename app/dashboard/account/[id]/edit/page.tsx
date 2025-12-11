import EditAccountForm from '@/app/ui/account/edit-account-form';
import Breadcrumbs from '@/app/ui/account/breadcrumbs';
import { fetchAccountByEmail } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { auth } from '@/auth';

export const metadata: Metadata = {
    title: 'Edit Account',
};

export const dynamic = 'force-dynamic';

export default async function Page(props: { params: Promise<{ id: string }> }) {

    const session = await auth();

    if (!session?.user?.email) {
        notFound();
    }

    const account = await fetchAccountByEmail(session.user.email, session.user.role || 'user');

    if (!account) {
        notFound();
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Account', href: '/dashboard/account' },
                    {
                        label: 'Edit Account',
                        href: `/dashboard/account/${account.id}/edit`,
                        active: true,
                    },
                ]}
            />
            <EditAccountForm account={account} />
        </main>
    );
}