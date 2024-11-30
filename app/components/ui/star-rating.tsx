import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  className?: string;
}

export function StarRating({ value, onChange, size = 24, className }: StarRatingProps) {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          onClick={() => onChange(rating)}
          className={cn(
            "focus:outline-none transition-colors",
            className
          )}
        >
          <Star
            size={size}
            className={cn(
              "transition-colors",
              rating <= value ? "fill-primary text-primary" : "fill-none text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}