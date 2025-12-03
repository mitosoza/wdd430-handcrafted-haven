import SideNav from '@/app/ui/dashboard/sidenav';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Header from '../ui/header';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full flex-none md:w-64 h-full">
          <SideNav />
        </div>
        <div className="flex-1 p-6 md:overflow-y-auto md:p-12">{children}</div>
      </div>
    </div>
  );
}