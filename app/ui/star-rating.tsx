
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

export default function StarRating({ rating }: { rating: number }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<StarIcon key={i} className="h-5 w-5 text-yellow-500" />);
    } else if (i === fullStars + 1 && hasHalfStar) {
     
       stars.push(<StarIconOutline key={i} className="h-5 w-5 text-yellow-500" />);
    } else {
      stars.push(<StarIconOutline key={i} className="h-5 w-5 text-gray-300" />);
    }
  }

 
  
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= Math.round(rating) ? (
            <StarIcon className="h-5 w-5 text-yellow-500" />
          ) : (
            <StarIconOutline className="h-5 w-5 text-gray-400" />
          )}
        </span>
      ))}
      <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
    </div>
  );
}
