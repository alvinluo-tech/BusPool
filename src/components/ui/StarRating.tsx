import Icon from "./Icon";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // 0-100 reputation score
  showValue?: boolean;
  size?: number;
  className?: string;
}

export default function StarRating({ rating, showValue = true, size = 14, className }: StarRatingProps) {
  // Convert 0-100 reputation to 0-5 star scale
  const starCount = rating / 20;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="star"
          size={size}
          filled
          className={star <= Math.round(starCount) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}
        />
      ))}
      {showValue && (
        <span className="text-xs font-medium text-foreground ml-0.5">
          {starCount.toFixed(1)}
        </span>
      )}
    </div>
  );
}
