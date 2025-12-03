import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import Link from 'next/link';

interface HavenLogoProps {
  className?: string;
  clickable?: boolean;
}

export default function HavenLogo({ className = 'text-white', clickable = true }: HavenLogoProps) {
  const content = (
    <>
      <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />
      <p className="text-[44px]">Handcrafted Haven</p>
    </>
  );

  if (clickable) {
    return (
      <Link
        href="/"
        className={`${lusitana.className} flex flex-row items-center leading-none ${className} hover:opacity-80 transition-opacity cursor-pointer`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`${lusitana.className} flex flex-row items-center leading-none ${className}`}>
      {content}
    </div>
  );
}
