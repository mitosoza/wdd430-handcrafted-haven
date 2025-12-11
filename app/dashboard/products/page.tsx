import { lusitana } from '@/app/ui/fonts';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import { fetchProductsBySellerId } from '@/app/lib/data';
import { auth } from '@/auth';
import ImageWithFallback from '@/app/ui/products/image-with-fallback';

export const metadata = {
    title: 'My Products',
};

export default async function Page() {
    const session = await auth();
    if (!session?.user?.email) {
        return (
            <div className="mt-6 text-center text-gray-500">
                Please log in to view your products.
            </div>
        );
    }

    // Assume only sellers can access this page
    const sellerId = session.user.id;
    const products = await fetchProductsBySellerId(sellerId);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>My Products</h1>
                <Link
                    href="/products/create"
                    className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                    <span className="hidden md:block">Add Product</span>{' '}
                    <PlusIcon className="h-5 md:ml-4" />
                </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length === 0 ? (
                    <div className="col-span-full text-gray-500">No products found.</div>
                ) : (
                    products.map((product) => (
                        <div key={product.id} className="rounded-lg border p-4 bg-white shadow">
                            <ImageWithFallback src={`/${product.product_image}`} alt={product.product_name} className="h-40 w-full object-cover rounded mb-4" />
                            <h2 className="font-semibold text-lg mb-2">{product.product_name}</h2>
                            <p className="text-gray-600 mb-2">{product.product_description}</p>
                            <div className="text-blue-700 font-bold mb-2">${(parseFloat(product.price)/100).toFixed(2)}</div>
                            <Link href={`/products/${product.id}/update`} className="text-blue-600 hover:underline text-sm">Edit</Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
