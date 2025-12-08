import Link from 'next/link';
import HavenLogo from '@/app/ui/haven-logo';
import { auth } from '@/auth';
import { ShoppingCartIcon, WrenchIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { fetchCategories } from '@/app/lib/data';

interface HeaderProps {
  className?: string;
}

export default async function Header({ className = "" }: HeaderProps) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const DashboardIcon = WrenchIcon;
  const CartIcon = ShoppingCartIcon;
  const categories = await fetchCategories();

  return (
    <header className={`pb-6 flex justify-between items-center px-10 pt-5 ${className}`}>
      <HavenLogo className="text-gray-900" />
      <div className="flex items-center gap-2">
        <Link
          href="/products"
          className="rounded-full bg-cyan-200 px-8 py-3 text-gray-900 font-semibold hover:bg-white transition-colors"
        >
          Products
        </Link>
        <div className="relative group">
          <button className="rounded-full bg-cyan-200 px-8 py-3 text-gray-900 font-semibold hover:bg-white transition-colors flex items-center gap-2">
            Categories
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              {categories.map((category) => (
                <Link
                  key={category.category_id}
                  href={`/products/${category.category_id}/categories`}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {category.category_name}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <Link
          href="/sellers"
          className="rounded-full bg-cyan-200 px-8 py-3 text-gray-900 font-semibold hover:bg-white transition-colors"
        >
          Artisans
        </Link>
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-full bg-cyan-200 px-3 py-3 text-gray-900 font-semibold hover:bg-white transition-colors"
            >
              <DashboardIcon className="w-6" />
            </Link>
            <Link
              href="/cart"
              className="rounded-full bg-cyan-200 px-3 py-3 text-gray-900 font-semibold hover:bg-white transition-colors"
            >
              <CartIcon className="w-6" />
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-cyan-200 px-8 py-3 text-gray-900 font-semibold hover:bg-white transition-colors"
          >
            Log In
          </Link>
        )}
      </div>
    </header>
  );
}