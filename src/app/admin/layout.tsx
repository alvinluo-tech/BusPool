"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Icon from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import NotificationBell from "@/components/notifications/NotificationBell";
import type { IconName } from "@/components/ui/Icon";

const sidebarItems = [
  { key: "dashboard", href: "/admin", icon: "grid" as IconName },
  { key: "users", href: "/admin/users", icon: "users" as IconName },
  { key: "tickets", href: "/admin/tickets", icon: "tickets" as IconName },
  { key: "transactions", href: "/admin/transactions", icon: "activity" as IconName },
  { key: "appeals", href: "/admin/appeals", icon: "alert" as IconName },
  { key: "points", href: "/admin/points", icon: "dollar" as IconName },
  { key: "announcements", href: "/admin/announcements", icon: "bell" as IconName },
  { key: "logs", href: "/admin/logs", icon: "file-text" as IconName },
];

interface NavLinksProps {
  pathname: string;
  t: (key: string) => string;
  closeMenu: () => void;
}

function NavLinks({ pathname, t, closeMenu }: NavLinksProps) {
  return (
    <>
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={closeMenu}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminChecked, setAdminChecked] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      const { data: profile } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      setAdminChecked(profile?.is_admin ?? false);
    };
    checkAdmin();
  }, [router]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Loading — admin status not yet determined
  if (adminChecked === null) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Not admin — show unauthorized
  if (!adminChecked) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Icon name="alert" size={28} className="text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">{t("unauthorized")}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t("unauthorizedDesc")}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Icon name="chevron-left" size={16} />
            {tc("back")}
          </Link>
        </div>
      </div>
    );
  }

  const currentPage = sidebarItems.find((item) => item.href === pathname);

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar — Desktop (lg+) */}
      <aside className="w-64 bg-card border-r border-border hidden lg:flex flex-col fixed left-0 top-0 h-full z-30">
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0 justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {tc("appName")}
          </h2>
          <NotificationBell />
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          <NavLinks pathname={pathname} t={t} closeMenu={closeMenu} />
        </nav>

        <div className="border-t border-border p-4 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Icon name="chevron-left" size={20} />
            {tc("back")}
          </Link>
        </div>
      </aside>

      {/* Main content — sidebar offset via lg:pl-64 */}
      <main className="flex-1 min-h-screen lg:pl-64">
        {/* Mobile top bar with hamburger (hidden on lg+) */}
        <div className="lg:hidden sticky top-0 z-20 bg-card/95 backdrop-blur-lg border-b border-border flex items-center h-14 px-4">
          <button
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors -ml-2"
            aria-label="Open menu"
          >
            <Icon name="grid" size={22} />
          </button>
          <h1 className="flex-1 text-center text-sm font-semibold text-foreground truncate px-2">
            {currentPage ? t(currentPage.key) : tc("appName")}
          </h1>
          <NotificationBell />
        </div>

        <div className="max-w-6xl mx-auto p-4 lg:p-8">{children}</div>
      </main>

      {/* Mobile overlay + drawer */}
      {menuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={closeMenu}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 flex flex-col animate-slide-in-left">
            <div className="h-14 flex items-center px-4 border-b border-border shrink-0 justify-between">
              <Link
                href="/admin"
                onClick={closeMenu}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="bus" size={18} className="text-primary-foreground" />
                </div>
                <h2 className="text-base font-bold text-foreground">
                  {tc("appName")}
                </h2>
              </Link>
              <button
                onClick={closeMenu}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                aria-label="Close menu"
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
              <NavLinks pathname={pathname} t={t} closeMenu={closeMenu} />
            </nav>

            <div className="border-t border-border p-4 shrink-0">
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Icon name="chevron-left" size={20} />
                {tc("back")}
              </Link>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
