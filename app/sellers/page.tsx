import Link from 'next/link';
import { fetchSellersWithProducts } from '@/app/lib/data';
import ImageWithFallback from '@/app/ui/products/image-with-fallback';
import fs from 'fs';
import path from 'path';
import Header from '@/app/ui/header';
import { lusitana } from '@/app/ui/fonts';

export default async function Page() {
    const sellers = (await fetchSellersWithProducts()) ?? [];

    // Helper to resolve seller images
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
                <h1 className={`${lusitana.className} text-4xl text-gray-900 mb-16`}>Sellers</h1>

                {sellers.length === 0 ? (
                    <div className="text-gray-600">No sellers found.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {sellers.map((seller: any, idx: number) => {
                            const sellerId = seller.seller_id;
                            const firstName = seller.seller_first_name ?? '';
                            const lastName = seller.seller_last_name ?? '';
                            const fullName = `${firstName} ${lastName}`.trim();
                            const email = seller.seller_email ?? '';
                            const image = resolveImage(seller.seller_image);

                            // Gradient backgrounds
                            const bgClasses = [
                                'from-emerald-300 to-emerald-100',
                                'from-purple-400 to-purple-100',
                                'from-orange-400 to-orange-100',
                            ];
                            const bg = bgClasses[idx % bgClasses.length];

                            return (
                                <article
                                    key={sellerId}
                                    className="relative pt-10 overflow-hidden rounded-xl bg-white shadow-lg"
                                >
                                    {/* diagonal background */}
                                    <div
                                        className={`absolute inset-0 -z-10 transform -rotate-6 bg-gradient-to-br ${bg} opacity-90`}
                                    ></div>

                                    <div className="p-6 pt-16">
                                        {/* seller image */}
                                        <div className="-mt-16 flex justify-center">
                                            <div className="w-40 h-40 rounded-full bg-white p-2 shadow-md flex items-center justify-center overflow-hidden">
                                                <ImageWithFallback
                                                    src={image}
                                                    alt={fullName}
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 text-center">
                                            <h2 className="text-lg font-semibold text-gray-900">{fullName}</h2>
                                            <p className="mt-2 text-sm text-gray-600">
                                                {email}
                                            </p>
                                        </div>

                                        <div className="mt-6 flex items-center justify-center gap-4">
                                            <Link
                                                href={`/products/${sellerId}/products`}
                                                className="rounded-full bg-cyan-200/50 px-8 py-3 text-gray-900 font-semibold hover:bg-cyan-200 transition-colors"
                                            >
                                                View products
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
