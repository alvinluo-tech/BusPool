"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StarRating from "@/components/ui/StarRating";

function ReputationBadge({ reputation, labels }: { reputation: number; labels: Record<string, string> }) {
  if (reputation >= 80) {
    return <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">{labels.excellent}</span>;
  }
  if (reputation >= 50) {
    return <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{labels.good}</span>;
  }
  if (reputation >= 30) {
    return <span className="text-xs font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full">{labels.fair}</span>;
  }
  return <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">{labels.restricted}</span>;
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/auth/login");
        return;
      }
      const { data, error } = await supabase.from("users").select("*").eq("id", authUser.id).single();
      if (error) {
        console.error("Profile fetch error:", error);
      }
      setUser(data ?? null);
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Icon name="profile" size={48} className="text-muted-foreground" />
        <p className="text-muted-foreground text-sm">{t("profileNotFound")}</p>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          {t("logout")}
        </Button>
      </div>
    );
  }

  const successRate = user.total_borrows > 0
    ? Math.round((user.successful_uses / user.total_borrows) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar size="2xl" src={user.avatar_url} name={user.nickname ?? ""} />
        <div>
          <h1 className="text-xl font-bold text-foreground">{user.nickname}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Reputation Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{t("reputation")}</span>
          <div className="flex items-center gap-2">
            <StarRating rating={user.reputation} />
            <ReputationBadge reputation={user.reputation} labels={{ excellent: t("reputationExcellent"), good: t("reputationGood"), fair: t("reputationFair"), restricted: t("reputationRestricted") }} />
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${Math.min(user.reputation, 100)}%` }}
          />
        </div>
      </Card>

      {/* Stats Grid */}
      <Card className="p-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{user.total_uploads}</p>
            <p className="text-xs text-muted-foreground">{t("uploads")}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{user.total_borrows}</p>
            <p className="text-xs text-muted-foreground">{t("borrows")}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{successRate}%</p>
            <p className="text-xs text-muted-foreground">{t("successRate")}</p>
          </div>
        </div>
      </Card>

      {/* Primary Menu */}
      <Card className="overflow-hidden !p-0">
        <Link href="/reputation" className="flex items-center gap-3 px-5 py-4 border-b border-border hover:bg-muted transition-colors">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <Icon name="shield" size={20} className="text-muted-foreground" />
          </div>
          <span className="flex-1 text-sm font-medium text-foreground">{t("reputation")}</span>
          <Icon name="chevron-right" size={20} className="text-muted-foreground" />
        </Link>
        <Link href="/settings/notifications" className="flex items-center gap-3 px-5 py-4 border-b border-border hover:bg-muted transition-colors">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <Icon name="bell" size={20} className="text-muted-foreground" />
          </div>
          <span className="flex-1 text-sm font-medium text-foreground">{t("notifications")}</span>
          <Icon name="chevron-right" size={20} className="text-muted-foreground" />
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-5 py-4 border-b border-border hover:bg-muted transition-colors">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <Icon name="settings" size={20} className="text-muted-foreground" />
          </div>
          <span className="flex-1 text-sm font-medium text-foreground">{t("settings")}</span>
          <Icon name="chevron-right" size={20} className="text-muted-foreground" />
        </Link>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-3 px-5 py-4 w-full hover:bg-muted transition-colors"
        >
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <Icon name="settings" size={20} className="text-muted-foreground" />
          </div>
          <span className="flex-1 text-sm font-medium text-foreground text-left">
            {theme === "dark" ? t("lightMode") : t("darkMode")}
          </span>
        </button>
      </Card>

      {/* Secondary Menu */}
      <Card className="overflow-hidden !p-0">
        <Link href="/agreement" className="flex items-center gap-3 px-5 py-4 border-b border-border hover:bg-muted transition-colors">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <Icon name="file-text" size={20} className="text-muted-foreground" />
          </div>
          <span className="flex-1 text-sm font-medium text-foreground">{t("termsConditions")}</span>
          <Icon name="chevron-right" size={20} className="text-muted-foreground" />
        </Link>
        <Link href="/help" className="flex items-center gap-3 px-5 py-4 hover:bg-muted transition-colors">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <Icon name="help" size={20} className="text-muted-foreground" />
          </div>
          <span className="flex-1 text-sm font-medium text-foreground">{t("helpCenter")}</span>
          <Icon name="chevron-right" size={20} className="text-muted-foreground" />
        </Link>
      </Card>

      {/* Admin Button */}
      <Link href="/admin" className="block">
        <Button variant="primary" size="lg" className="w-full">
          <Icon name="grid" size={20} />
          {t("adminPanel")}
        </Button>
      </Link>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full text-center text-sm font-medium text-muted-foreground py-3 hover:text-destructive transition-colors"
      >
        {t("logout")}
      </button>

      {/* Footer */}
      <div className="text-center pb-4">
        <p className="text-xs text-muted-foreground">{t("version")}</p>
        <p className="text-xs text-muted-foreground">{t("madeFor")}</p>
      </div>
    </div>
  );
}
