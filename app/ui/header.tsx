import Link from 'next/link';
import HavenLogo from '@/app/ui/haven-logo';
import { auth } from '@/auth';
import { ShoppingCartIcon, WrenchIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  className?: string;
}

export default async function Header({ className = "" }: HeaderProps) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const DashboardIcon = WrenchIcon;
  const CartIcon = ShoppingCartIcon;

  return (
    <header className={`mb-8 flex justify-between items-center px-10 pt-5 ${className}`}>
      <HavenLogo className="text-gray-900" />
      {isLoggedIn ? (
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-full bg-white px-3 py-3 text-gray-900 font-semibold hover:bg-cyan-200 transition-colors"
          >
            <DashboardIcon className="w-6" />
          </Link>
          <Link
            href="/cart"
            className="rounded-full bg-white px-3 py-3 text-gray-900 font-semibold hover:bg-cyan-200 transition-colors"
          >
            <CartIcon className="w-6" />
          </Link>
        </div>
      ) : (
        <Link
          href="/login"
          className="rounded-full bg-white px-8 py-3 text-gray-900 font-semibold hover:bg-cyan-200 transition-colors"
        >
          Log In
        </Link>
      )}
    </header>
  );
}