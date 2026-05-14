"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type CardVariant = "base" | "ticket" | "stats";

interface CardProps {
  variant?: CardVariant;
  padding?: boolean;
  className?: string;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  base: "rounded-lg p-4",
  ticket: "rounded-2xl overflow-hidden",
  stats: "rounded-xl p-6",
};

export default function Card({
  variant = "base",
  padding = true,
  className,
  children,
  href,
  onClick,
}: CardProps) {
  const baseClasses = cn(
    "bg-card border border-border shadow-level1 transition-shadow duration-200",
    !href && !onClick && variant !== "ticket" && padding ? variantStyles[variant] : "",
    (href || onClick) && "hover:shadow-level2 cursor-pointer",
    className
  );

  if (href) {
    return (
      <Link href={href} className={cn(baseClasses, "block", variantStyles[variant])}>
        {children}
      </Link>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );
}
