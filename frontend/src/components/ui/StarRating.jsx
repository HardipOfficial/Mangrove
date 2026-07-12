import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, size = 16, interactive = false, onRate }) {
  return (
    <div className="stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={size}
          fill={star <= Math.round(rating) ? '#f59e0b' : 'none'}
          color={star <= Math.round(rating) ? '#f59e0b' : '#475569'}
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'all 0.1s' }}
          onClick={() => interactive && onRate && onRate(star)}
        />
      ))}
    </div>
  );
}
