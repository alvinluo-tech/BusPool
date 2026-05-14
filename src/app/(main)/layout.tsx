"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const navItems = [
    { label: t("home"), href: "/", icon: "home" as IconName },
    { label: t("share"), href: "/upload", icon: "share" as IconName },
    { label: t("tickets"), href: "/borrows", icon: "tickets" as IconName },
    { label: t("wallet"), href: "/wallet", icon: "wallet" as IconName },
    { label: t("profile"), href: "/profile", icon: "profile" as IconName },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom Navigation — 80px height per design spec */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border z-50">
        <div
          className="max-w-lg mx-auto grid items-center h-20 pb-[env(safe-area-inset-bottom)]"
          style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)` }}
        >
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1.5 h-full relative py-2"
              >
                <Icon
                  name={item.icon}
                  size={24}
                  filled={isActive}
                  className={isActive ? "text-primary" : "text-muted-foreground"}
                />
                <span
                  className={`text-[11px] font-medium ${
                    isActive ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute bottom-2 w-1 h-1 bg-primary rounded-full animate-scale-in" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
