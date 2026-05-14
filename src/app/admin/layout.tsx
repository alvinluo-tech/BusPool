"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";

const sidebarItems = [
  { key: "dashboard", href: "/admin", icon: "grid" as IconName },
  { key: "users", href: "/admin/users", icon: "users" as IconName },
  { key: "tickets", href: "/admin/tickets", icon: "tickets" as IconName },
  { key: "transactions", href: "/admin/transactions", icon: "activity" as IconName },
  { key: "appeals", href: "/admin/appeals", icon: "alert" as IconName },
  { key: "points", href: "/admin/points", icon: "dollar" as IconName },
  { key: "logs", href: "/admin/logs", icon: "file-text" as IconName },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("admin");
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar — Desktop */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{t("dashboard")}</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon name={item.icon} size={20} />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="flex overflow-x-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] flex-1 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon name={item.icon} size={20} />
                <span className="text-[9px] font-medium">{t(item.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-6 pb-20 md:pb-6 max-w-6xl">{children}</main>
    </div>
  );
}
