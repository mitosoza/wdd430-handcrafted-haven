import { fetchProductsBySellerId, fetchSellerById } from "@/app/lib/data";
import { notFound } from 'next/navigation';
import ImageWithFallback from '@/app/ui/products/image-with-fallback';
import { formatCurrency } from '@/app/lib/utils';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch seller and products in parallel
  const [seller, products] = await Promise.all([
    fetchSellerById(id).catch(() => null),
    fetchProductsBySellerId(id).catch(() => []),
  ]);

  if (!seller) {
    notFound();
  }

  // Helper to resolve image paths on the server
  const resolveImage = (imgCandidateRaw?: string) => {
    const raw = (imgCandidateRaw ?? '').toString().trim();
    if (!raw) return '/placeholder.svg';
    if (/^https?:\/\//.test(raw)) return raw;

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
        } catch (e) {
          // ignore
        }
      }
      return null;
    };

    const resolved = tryExtensions(candidate) ?? tryExtensions(path.basename(candidate));
    return resolved ?? '/placeholder.svg';
  };

  return (
    <main className="p-6">
      {/* Seller header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
          <ImageWithFallback 
            src={resolveImage(seller.seller_image)} 
            alt={seller.seller_first_name} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div>
          <h1 className="text-3xl font-semibold">{seller.seller_first_name}</h1>
          <p className="text-gray-600">{seller.seller_email}</p>
        </div>
      </div>

      {/* Products grid */}
      <div>
        <h2 className="mb-6 text-2xl font-semibold">Products</h2>

        {products.length === 0 ? (
          <div className="text-gray-600">No products found from this seller.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p: any, idx: number) => {
              const id = p.id ?? p.product_id;
              const name = p.product_name ?? 'Untitled';
              const description = p.product_description ?? '';
              const priceRaw = typeof p.price === 'number' ? p.price : Number(p.price ?? 0);
              const image = resolveImage(p.product_image);

              // Color palettes for diagonal backgrounds
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
                      <Link href={`/products/${id}/show`} className="text-sm font-medium text-gray-700 underline">
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Link href="/products" className="text-sm text-gray-600 underline">
          ← Back to all products
        </Link>
      </div>
    </main>
  );
}
