"use client";

import {
  UserIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const baseLinks = [
  {
    name: 'Account',
    href: '/dashboard/account',
    icon: UserIcon
  },
  {
    name: 'Orders',
    href: '/dashboard/orders',
    icon: ArchiveBoxIcon
  },
  {
    name: 'Shop',
    href: '/products',
    icon: ShoppingBagIcon
  },
];

const sellerLinks = [
  {
    name: 'My Products',
    href: '/dashboard/inventory',
    icon: Squares2X2Icon,
  },
  {
    name: 'Invoices',
    href: '/dashboard/invoices',
    icon: DocumentDuplicateIcon,
  },
];

interface NavLinksProps {
  userRole?: 'user' | 'seller';
}

export default function NavLinks({ userRole }: NavLinksProps) {
  const pathname = usePathname();

  const links = userRole === 'seller'
    ? [...baseLinks, ...sellerLinks]
    : baseLinks;
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
