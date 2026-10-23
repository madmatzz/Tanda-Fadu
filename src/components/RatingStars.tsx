import { Star } from "lucide-react";
import { cn } from "../lib/cn";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md";
  showValue?: boolean;
  valueLabel?: string;
}

const starSize = {
  sm: "size-3",
  md: "size-icon",
};

export function RatingStars({ rating, size = "sm", showValue = false, valueLabel }: RatingStarsProps) {
  const rounded = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${rating} de 5`} role="img">
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            aria-hidden
            className={cn(
              starSize[size],
              star <= rounded ? "fill-accent text-accent" : "text-border",
            )}
          />
        ))}
      </span>
      {showValue && (
        <span className="text-small font-semibold text-ink">
          {valueLabel ?? rating.toFixed(1).replace(".", ",")}
        </span>
      )}
    </span>
  );
}
