import Link from 'next/link';
import { fetchProducts } from '@/app/lib/data';
import { formatCurrency } from '@/app/lib/utils';
import ImageWithFallback from '@/app/ui/products/image-with-fallback';
import fs from 'fs';
import path from 'path';
import Header from '@/app/ui/header';
import { lusitana } from '@/app/ui/fonts';
import { PlusIcon } from '@heroicons/react/24/outline';
import { auth } from '@/auth';

type ProductSearchParams = { q?: string };

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<ProductSearchParams>;
}) {
  const params = await searchParams;
  const q = params?.q ?? "";
  const session = await auth();
  const isSeller = session?.user?.role === 'seller';

  const products = (await fetchProducts(q)) ?? [];


  // Helper to resolve product images
  const resolveImage = (imgCandidateRaw?: string) => {
    const raw = (imgCandidateRaw ?? '').toString().trim();
    if (!raw) return '/placeholder.svg';

    // External URLs
    if (/^https?:\/\//.test(raw)) return raw;

    // Normalize prefixes
    let candidate = raw.replace(/^\.\/?/, '');
    candidate = candidate.replace(/^public\//, '');
    candidate = candidate.replace(/^\/public\//, '');
    if (candidate.startsWith('/')) candidate = candidate.slice(1);

    const tryExtensions = (name: string) => {
      const exts = ['', '.jpg', '.jpeg', '.png', '.webp'];
      for (const ex of exts) {
        const filename = name.endsWith(ex) ? name : name + ex;
        const publicPath = path.join(process.cwd(), 'public', filename);
        try {
          if (fs.existsSync(publicPath)) return '/' + filename;
        } catch {
          // ignore
        }
      }
      return null;
    };

    return tryExtensions(candidate) ?? tryExtensions(path.basename(candidate)) ?? '/placeholder.svg';
  };

  return (
    <main className="min-h-screen landing-page-gradient">
      <Header />
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`${lusitana.className} text-4xl text-gray-900`}>Products</h1>
          {isSeller && (
            <Link
              href="/products/create"
              className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <span className="hidden md:block">Add Product</span>
              <PlusIcon className="h-5 md:ml-4" />
            </Link>
          )}
        </div>

        {/* Search form */}
        <form className="mb-6">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search products..."
            className="w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
        </form>

        {/* Back to all products link */}
        {q && (
          <div className="mb-6">
            <Link href="/products" className="text-sm text-gray-600 underline">
              ← Show all products
            </Link>
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-gray-600">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p: any, idx: number) => {
              const id = p.product_id ?? p.id;
              const name = p.product_name ?? p.name ?? 'Untitled';
              const description = p.product_description ?? '';
              const priceRaw =
                typeof p.price === 'number' ? p.price : Number(p.price ?? 0);
              const image = resolveImage(p.product_image);

              // Gradient backgrounds
              const bgClasses = [
                'from-emerald-300 to-emerald-100',
                'from-purple-400 to-purple-100',
                'from-orange-400 to-orange-100',
              ];
              const bg = bgClasses[idx % bgClasses.length];

              return (
                <article
                  key={id}
                  className="relative pt-10 overflow-hidden rounded-xl bg-white shadow-lg"
                >
                  {/* diagonal background */}
                  <div
                    className={`absolute inset-0 -z-10 transform -rotate-6 bg-gradient-to-br ${bg} opacity-90`}
                  ></div>

                  {/* price badge */}
                  <div className="absolute right-4 top-4 z-10">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold shadow">
                      {formatCurrency(priceRaw)}
                    </span>
                  </div>

                  <div className="p-6 pt-16">
                    {/* product image */}
                    <div className="-mt-16 flex justify-center">
                      <div className="w-40 h-40 rounded-lg bg-white p-2 shadow-md flex items-center justify-center">
                        <ImageWithFallback
                          src={image}
                          alt={name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                        {description}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-4">
                      <Link
                        href={`/products/${id}/show`}
                        className="rounded-full bg-cyan-200/50 px-8 py-3 text-gray-900 font-semibold hover:bg-cyan-200 transition-colors"
                      >
                        Shop now
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}