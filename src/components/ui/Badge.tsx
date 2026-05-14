import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "error";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-muted text-foreground border-border",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "h-5 px-2 text-xs rounded-xs",
  md: "h-6 px-2.5 text-xs rounded-xs",
  lg: "h-7 px-3 text-sm rounded-xs",
};

export default function Badge({
  variant = "default",
  size = "md",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-medium border",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
