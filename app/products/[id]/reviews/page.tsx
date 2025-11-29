import { fetchReviewsByProductId, fetchProductById } from "@/app/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link"; import { Metadata } from "next";

export const metadata: Metadata = { title: "Product Reviews", };

export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params;
// Fetch product and reviews in parallel 
const [product, reviews] = await Promise.all([ fetchProductById(id).catch(() => null), fetchReviewsByProductId(id).catch(() => []), ]);

if (!product) { notFound(); }
return ( <main className="p-6"> <div className="max-w-4xl mx-auto"> {/* Header with product info */} <div className="mb-8"> <Link href={`/products/${id}/show
`} className="text-blue-600 hover:underline mb-4 inline-block"> ← Back to product </Link> <h1 className="text-3xl font-semibold text-gray-900">{product.product_name}</h1> <p className="text-gray-600 mt-2">Reviews ({reviews.length})</p> </div>
    {/* Reviews Section */}
    <div className="bg-white rounded-lg shadow-md p-6">
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No reviews yet for this product.</p>
          <p className="text-gray-500 mt-2">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            
            <div key={review.review_id} className="border-b pb-6 last:border-b-0">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">User Name: {review.user_first_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.review_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed">{review.review_text}</p>

              {/* Review Metadata */}
              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <p>Review ID: {review.review_id}</p>
                <p>Seller ID: {review.seller_id}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Bottom action */}
    <div className="mt-8 flex gap-4">
      <Link
        href={`/products/${id}/show`}
        className="rounded-lg bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700"
      >
        Back to Product
      </Link>
      <Link
        href="/products"
        className="rounded-lg border border-gray-300 px-6 py-2 text-gray-900 font-medium hover:bg-gray-50"
      >
        All Products
      </Link>
    </div>
  </div>
</main>)}
