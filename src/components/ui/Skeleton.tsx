import { cn } from "@/lib/utils";

type SkeletonVariant = "text" | "circular" | "rectangular";

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: "h-4 rounded-sm",
  circular: "rounded-full",
  rectangular: "rounded-lg",
};

export default function Skeleton({ variant = "text", className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted animate-pulse-soft",
        variantStyles[variant],
        className
      )}
    />
  );
}
