import HavenLogo from '@/app/ui/haven-logo';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import AnimateOnScroll from '@/app/ui/animate-on-scroll';

export default function Page() {
  return (
    <main className="min-h-screen landing-page-gradient">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-8">
        <header className="mb-12">
          <HavenLogo className="text-gray-900" />
        </header>

        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <AnimateOnScroll animation="animate-slideUp" className="md:w-1/2 space-y-6">
            <h1 className={`${lusitana.className} text-5xl md:text-6xl text-gray-900 leading-tight`}>
              Where Makers <br /> Meet Their Market.
            </h1>
            <p className="text-xl text-gray-700 max-w-md">
              Discover one-of-a-kind creations made with heart and skill.
            </p>
            <div className="flex gap-4 pt-4">
              <Link
                href="/products"
                className="rounded-full bg-white px-8 py-3 text-gray-900 font-semibold shadow-sm hover:bg-gray-50 transition-colors"
              >
                Buy Now
              </Link>
              <Link
                href="/products"
                className="rounded-full bg-cyan-200/50 px-8 py-3 text-gray-900 font-semibold hover:bg-cyan-200 transition-colors"
              >
                Shop All
              </Link>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="animate-slideUp" className="md:w-1/2 relative">
            <div className="relative z-10">
              <Image
                src="/chair.png"
                width={600}
                height={600}
                alt="Green velvet armchair"
                className="rounded-lg object-cover"
              />
              <div className="absolute bottom-8 left-8 bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                <span className="text-sm font-medium text-gray-900">Made By Ella</span>
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>

      {/* All-New Platform Section */}
      <div className="container mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <AnimateOnScroll animation="animate-slideUp" className="md:w-1/2 space-y-6">
            <h2 className={`${lusitana.className} text-4xl text-gray-900`}>All-New Platform</h2>
            <p className="text-gray-700 leading-relaxed">
              We&apos;re redefining the way handmade goods are discovered. Handcrafted Haven combines modern technology with timeless artistry, giving local crafters the tools to showcase their work, tell their stories, and sell directly to those who value authenticity.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="animate-slideInRight" className="md:w-1/2">
            <Image
              src="/kitchen.jpg"
              width={800}
              height={600}
              alt="Modern kitchen interior"
              className="rounded-tr-[100px] rounded-bl-[100px] object-cover shadow-xl"
            />
          </AnimateOnScroll>
        </div>
      </div>

      {/* Shop by category Section */}
      <div className="container mx-auto px-6 py-24 text-center">
        <h2 className={`${lusitana.className} text-4xl text-gray-900 mb-16`}>Shop by category</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Card 1 */}
          <Link href={`/products/c001/categories`}>
          <AnimateOnScroll animation="animate-slideUp" delay="delay-100" className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-48 mb-6 overflow-hidden rounded-t-xl">
              <Image
                src="/img1.jpg"
                width={400}
                height={300}
                alt="Home and Living"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 uppercase tracking-wide">HOME & LIVING</h3>
            <p className="text-sm text-gray-600">Warm, personal touches for the spaces that matter most.</p>
          </AnimateOnScroll>
          </Link>

          {/* Card 2 */}
          <Link href={`/products/c002/categories`}>
          <AnimateOnScroll animation="animate-slideUp" delay="delay-200" className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-48 mb-6 overflow-hidden rounded-t-xl">
              <Image
                src="/img2.jpg"
                width={400}
                height={300}
                alt="Jewelry and Accessories"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 uppercase tracking-wide">JEWELRY & ACCESSORIES</h3>
            <p className="text-sm text-gray-600">Every piece tells a story crafted with care, made to last.</p>
          </AnimateOnScroll>
          </Link>

          {/* Card 3 */}
          <Link href={`/products/c003/categories`}>
          <AnimateOnScroll animation="animate-slideUp" delay="delay-300" className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-48 mb-6 overflow-hidden rounded-t-xl">
              <Image
                src="/img3.jpg"
                width={400}
                height={300}
                alt="Miscellaneous Items"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 uppercase tracking-wide">MISCELLANEOUS ITEMS</h3>
            <p className="text-sm text-gray-600">Transform your walls and spaces with creations that inspire.</p>
          </AnimateOnScroll>
          </Link>
        </div>

        <Link
          href="/products"
          className="inline-block rounded-full bg-cyan-200/50 px-12 py-3 text-gray-900 font-semibold hover:bg-cyan-200 transition-colors"
        >
          Shop All
        </Link>
      </div>

      {/* Support for Artisans Section */}
      <div className="container mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <AnimateOnScroll animation="animate-slideUp" className="md:w-1/2 space-y-8">
            <h2 className={`${lusitana.className} text-4xl text-gray-900`}>Support for Artisans</h2>
            <p className="text-gray-700 leading-relaxed">
              From setup guidance to marketing tools and secure transactions, Handcrafted Haven helps creators turn passion into profession. Our support team ensures a seamless experience for every maker and buyer.
            </p>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 uppercase tracking-wide text-sm">OUR COMMITMENT</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="text-green-500">🍃</span>
                  <span className="font-bold text-gray-800 text-sm">FAIR TRADE PRICING</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">🌱</span>
                  <span className="font-bold text-gray-800 text-sm">SUSTAINABLE MATERIALS FOCUS</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-yellow-500">🤝</span>
                  <span className="font-bold text-gray-800 text-sm">COMMUNITY-DRIVEN CONNECTIONS</span>
                </li>
              </ul>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="animate-slideInRight" className="md:w-1/2">
            <Image
              src="/img1.jpg"
              width={800}
              height={800}
              alt="Artisan living room"
              className="rounded-tl-[100px] rounded-br-[100px] object-cover shadow-xl"
            />
          </AnimateOnScroll>
        </div>
      </div>

      {/* Connect with us Section */}
      <div className="container mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <h2 className={`${lusitana.className} text-4xl md:text-5xl text-gray-900 mb-8 md:mb-0 md:w-1/3`}>Connect with us</h2>

          <div className="md:w-2/3 flex flex-col md:flex-row gap-12 md:gap-24">
            <div>
              <h3 className="font-bold text-gray-900 uppercase tracking-wide mb-4">MAIN OFFICE</h3>
              <address className="not-italic text-gray-700 space-y-2 text-lg">
                <p>123 Artisan Lane,</p>
                <p>Phoenix, AZ 85001</p>
                <p>(480) 555-1289</p>
              </address>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 uppercase tracking-wide mb-4">SOCIAL MEDIA</h3>
              <div className="text-gray-700 space-y-2 text-lg">
                <p>@HandcraftedHaven</p>
                <p>hello@handcraftedhaven.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
