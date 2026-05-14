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
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col fixed left-0 top-0 h-full z-30">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="bus" size={18} className="text-primary-foreground" />
            </div>
            <h2 className="text-base font-bold text-foreground">BusPool</h2>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon name={item.icon} size={20} />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {/* Back to main app */}
        <div className="p-4 border-t border-border shrink-0">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Icon name="chevron-left" size={20} />
            Main App
          </Link>
        </div>
      </aside>

      {/* Spacer for fixed sidebar */}
      <div className="hidden md:block w-64 shrink-0" />

      {/* Main content */}
      <main className="flex-1 min-h-screen pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 flex-1 min-w-0 relative ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon name={item.icon} size={22} />
                <span className="text-[11px] font-medium leading-tight">{t(item.key)}</span>
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
