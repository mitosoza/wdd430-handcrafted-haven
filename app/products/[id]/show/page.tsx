import { notFound } from 'next/navigation';
import { fetchProductById, fetchSellerById, fetchProductsBySellerId } from '@/app/lib/data';
import ImageWithFallback from '@/app/ui/products/image-with-fallback';
import { formatCurrency } from '@/app/lib/utils';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  const seller = product.seller_id ? await fetchSellerById(product.seller_id) : null;

  // Resolve product image so the client receives an absolute public path.
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
          // ignore and continue
        }
      }
      return null;
    };

    const resolved = tryExtensions(candidate) ?? tryExtensions(path.basename(candidate));
    return resolved ?? '/placeholder.svg';
  };

  const productImage = resolveImage(product.product_image);

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto rounded-xl bg-white p-6 shadow-md">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2 flex items-center justify-center">
            <div className="w-64 h-64 rounded-lg bg-gray-50 p-4 shadow-sm flex items-center justify-center">
              <ImageWithFallback src={productImage} alt={product.product_name} className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="md:w-1/2">
            <h1 className="text-2xl font-semibold">{product.product_name}</h1>
            <p className="mt-4 text-gray-700">{product.product_description}</p>

            <div className="mt-6 flex items-center gap-4">
              <span className="rounded-full bg-gray-100 px-4 py-2 text-lg font-semibold">{formatCurrency(Number(product.price))}</span>
              <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-blue-500">Add to cart</button>
              <Link href="/products" className="text-sm text-gray-600 underline">Back to products</Link>
              <Link className="text-sm text-gray-600 underline" href={`/products/${id}/reviews`}>Reviews</Link>
            </div>

            {seller ? (
              <Link className="text-sm text-gray-600 underline" href={`/products/${seller.seller_id}/products`}>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  
                  <ImageWithFallback src={resolveImage(seller.seller_image)} alt={seller.seller_first_name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-sm font-medium">{seller.seller_first_name}</div>
                  <div className="text-xs text-gray-500">{seller.seller_email}</div>
                </div>
              </div>
              </Link>
            ) : (
              <div className="mt-6 text-sm text-gray-500">Seller ID: {product.seller_id}</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
