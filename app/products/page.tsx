import Link from 'next/link';
import { fetchProducts } from '@/app/lib/data';
import { formatCurrency } from '@/app/lib/utils';
import ImageWithFallback from '@/app/ui/products/image-with-fallback';
import fs from 'fs';
import path from 'path';

export default async function Page() {
  const products = (await fetchProducts()) ?? [];

  return (
    <main suppressHydrationWarning={true} className="p-6">
      <h1 className="mb-6 text-2xl font-semibold">Products</h1>

      {products.length === 0 ? (
        <div className="text-gray-600">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p: any, idx: number) => {
            const id = p.product_id ?? p.id;
            const name = p.product_name ?? p.name ?? 'Untitled';
            const description = p.product_description ?? '';
            const priceRaw = typeof p.price === 'number' ? p.price : Number(p.price ?? 0);
            // Resolve product image robustly. Handles:
            // - absolute URLs (http(s)://)
            // - absolute paths starting with '/'
            // - DB values that include 'public/' prefix
            // - bare filenames and attempts common extensions if missing (.jpg/.jpeg/.png/.webp)
            const imgCandidateRaw = (p.product_image ?? '').toString().trim();
            let image = '/placeholder.svg';

            if (imgCandidateRaw) {
              // external URLs
              if (/^https?:\/\//.test(imgCandidateRaw)) {
                image = imgCandidateRaw;
              } else {
                // normalize leading prefixes like 'public/' or '/public/' or './public/'
                let candidate = imgCandidateRaw.replace(/^\.\/?/, '');
                candidate = candidate.replace(/^public\//, '');
                candidate = candidate.replace(/^\/public\//, '');

                // if candidate is an absolute path (starts with '/'), use as-is (but strip /public if present)
                if (candidate.startsWith('/')) {
                  candidate = candidate.slice(1);
                }

                const tryExtensions = (name: string) => {
                  const exts = ['', '.jpg', '.jpeg', '.png', '.webp'];
                  for (const ex of exts) {
                    const filename = name.endsWith(ex) ? name : name + ex;
                    const publicPath = path.join(process.cwd(), 'public', filename);
                    try {
                      if (fs.existsSync(publicPath)) return '/' + filename;
                    } catch (e) {
                      // ignore and try next
                    }
                  }
                  return null;
                };

                // If candidate already started with '/', keep that behavior
                const resolved = tryExtensions(candidate);
                if (resolved) {
                  image = resolved;
                } else {
                  // also try without directories (basename) as a last resort
                  const base = path.basename(candidate);
                  const resolvedBase = tryExtensions(base);
                  image = resolvedBase ?? '/placeholder.svg';
                }
              }
            }

            // color palettes for diagonal backgrounds
            const bgClasses = [
              'from-emerald-300 to-emerald-100',
              'from-purple-400 to-purple-100',
              'from-orange-400 to-orange-100',
            ];
            const bg = bgClasses[idx % bgClasses.length];

            return (
              <article key={id} className="relative overflow-hidden rounded-xl bg-white shadow-lg">
                {/* diagonal background */}
                <div className={`absolute inset-0 -z-10 transform -rotate-6 bg-gradient-to-br ${bg} opacity-90`}></div>

                {/* price badge top-right */}
                <div className="absolute right-4 top-4 z-10">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold shadow">{formatCurrency(priceRaw)}</span>
                </div>

                <div className="p-6 pt-16">
                  {/* floating product image */}
                  <div className="-mt-20 flex justify-center">
                    <div className="w-40 h-40 rounded-lg bg-white p-2 shadow-md flex items-center justify-center">
                      <ImageWithFallback src={image} alt={name} className="w-full h-full object-contain" />
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{description}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-4">
                    <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-blue-500">Add to cart</button>
                    <Link href={`/products/${id}`} className="text-sm font-medium text-gray-700 underline">
                      View
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
