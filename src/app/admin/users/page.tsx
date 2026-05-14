"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";
import Input from "@/components/ui/Input";
import Icon from "@/components/ui/Icon";

type UserStatus = "all" | "normal" | "restricted" | "banned";
type RepLevel = "all" | "excellent" | "good" | "average" | "poor";

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: "all", label: "all" },
  { value: "normal", label: "正常" },
  { value: "restricted", label: "受限" },
  { value: "banned", label: "封禁" },
];

const REP_RANGES: { value: RepLevel; label: string; min?: number; max?: number }[] = [
  { value: "excellent", label: "优秀(80+)", min: 80 },
  { value: "good", label: "良好(50-79)", min: 50, max: 79 },
  { value: "average", label: "一般(30-49)", min: 30, max: 49 },
  { value: "poor", label: "限制(<30)", max: 29 },
];

function deriveStatus(rep: number): "normal" | "restricted" | "banned" {
  if (rep >= 50) return "normal";
  if (rep >= 30) return "restricted";
  return "banned";
}

function RepBadge({ value }: { value: number }) {
  const colors =
    value >= 80
      ? "bg-success/10 text-success"
      : value >= 50
        ? "bg-blue-500/10 text-blue-600"
        : value >= 30
          ? "bg-warning/10 text-warning"
          : "bg-destructive/10 text-destructive";

  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${colors}`}>
      {value}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("admin");
  const cfg: Record<string, { colors: string; label: string }> = {
    normal: {
      colors: "bg-success/10 text-success border-success/20",
      label: t("正常"),
    },
    restricted: {
      colors: "bg-warning/10 text-warning border-warning/20",
      label: t("受限"),
    },
    banned: {
      colors: "bg-destructive/10 text-destructive border-destructive/20",
      label: t("封禁"),
    },
  };

  const c = cfg[status];
  if (!c) return null;

  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium border ${c.colors}`}>
      {c.label}
    </span>
  );
}

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus>("all");
  const [repFilter, setRepFilter] = useState<RepLevel>("all");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setUsers(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const q = search.toLowerCase();
        if (
          q &&
          !u.nickname.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q) &&
          !u.id.toLowerCase().includes(q)
        )
          return false;

        const derived = deriveStatus(u.reputation);
        if (statusFilter !== "all" && derived !== statusFilter) return false;

        if (repFilter !== "all") {
          const range = REP_RANGES.find((r) => r.value === repFilter);
          if (range) {
            if (range.min !== undefined && u.reputation < range.min) return false;
            if (range.max !== undefined && u.reputation > range.max) return false;
          }
        }
        return true;
      }),
    [users, search, statusFilter, repFilter],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {t("用户管理")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("查看和管理所有用户")}
        </p>
      </div>

      {/* Filter Card */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("搜索昵称、邮箱或 ID...")}
              leftIcon={<Icon name="search" size={16} />}
            />
          </div>
        </div>

        {/* Status pills */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {s.value === "all" ? tCommon("all") : t(s.label)}
            </button>
          ))}
        </div>

        {/* Reputation pills */}
        <div className="flex gap-2 mt-2 flex-wrap">
          <button
            onClick={() => setRepFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              repFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {tCommon("all")}
          </button>
          {REP_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRepFilter(r.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                repFilter === r.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {t(r.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Icon name="loader" size={32} className="text-muted-foreground" />
        </div>
      ) : (
        <div className="bg-card rounded-xl overflow-x-auto border border-border">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t("用户")}
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t("信誉分")}
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t("积分")}
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t("统计")}
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t("状态")}
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t("注册时间")}
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t("操作")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-sm text-muted-foreground"
                  >
                    {t("暂无符合条件的用户")}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const successRate =
                    user.total_borrows > 0
                      ? `${Math.round(
                          (user.successful_uses / user.total_borrows) * 100,
                        )}%`
                      : "N/A";
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0">
                            {user.nickname.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">
                              {user.nickname}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <RepBadge value={user.reputation} />
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-foreground">
                          {user.points_balance}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          <span className="font-medium text-foreground">
                            {user.total_uploads}
                          </span>
                          <span className="mx-1">/</span>
                          <span className="font-medium text-foreground">
                            {user.total_borrows}
                          </span>
                          <span className="mx-1">/</span>
                          <span
                            className={
                              user.total_borrows > 0
                                ? "text-success"
                                : "text-muted-foreground"
                            }
                          >
                            {successRate}
                          </span>
                        </span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={deriveStatus(user.reputation)} />
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                          >
                            <Icon name="chevron-right" size={16} />
                            {t("查看")}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
