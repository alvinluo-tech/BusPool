"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import Icon from "@/components/ui/Icon";

type StatusFilter = "all" | "available" | "in_use" | "completed" | "expired" | "invalid";
type TypeFilter = "all" | "dayrider" | "daysaver";

interface TicketRow {
  id: string;
  ticket_type: string;
  status: string;
  zone: string | null;
  created_at: string;
  expires_at: string;
  uploader: { nickname: string; reputation: number } | null;
  uploader_id: string;
  purchase_time: string;
  barcode_image_url: string;
  barcode_thumbnail_url: string | null;
  qr_code_data: string | null;
}

const STATUS_OPTIONS: { value: StatusFilter; labelKey: string }[] = [
  { value: "all", labelKey: "all" },
  { value: "available", labelKey: "statusAvailable" },
  { value: "in_use", labelKey: "statusInUse" },
  { value: "completed", labelKey: "statusCompleted" },
  { value: "expired", labelKey: "statusExpired" },
  { value: "invalid", labelKey: "statusInvalid" },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "dayrider", label: "Dayrider" },
  { value: "daysaver", label: "DaySaver" },
];

function TicketStatusBadge({ status }: { status: string }) {
  const t = useTranslations("admin");
  const cfg: Record<string, { colors: string; label: string }> = {
    available: { colors: "bg-success/10 text-success", label: t("可用") },
    in_use: { colors: "bg-blue-500/10 text-blue-600", label: t("使用中") },
    completed: { colors: "bg-muted text-muted-foreground", label: t("已完成") },
    expired: { colors: "bg-warning/10 text-warning", label: t("已过期") },
    invalid: { colors: "bg-destructive/10 text-destructive", label: t("已失效") },
  };

  const c = cfg[status];
  if (!c) return <span className="text-xs text-muted-foreground">{status}</span>;

  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${c.colors}`}>
      {c.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const label = type === "dayrider" ? "Dayrider" : "DaySaver";
  return (
    <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium border border-border bg-muted/50 text-foreground">
      {label}
    </span>
  );
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

export default function AdminTicketsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("tickets")
      .select("*, uploader:users!tickets_uploader_id_fkey(nickname, reputation)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTickets((data || []) as unknown as TicketRow[]);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(
    () =>
      tickets.filter((t) => {
        const q = search.toLowerCase();
        if (q && !t.id.toLowerCase().includes(q)) return false;
        if (statusFilter !== "all" && t.status !== statusFilter) return false;
        if (typeFilter !== "all" && t.ticket_type !== typeFilter) return false;
        return true;
      }),
    [tickets, search, statusFilter, typeFilter],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {t("票务管理")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("查看和管理所有票务")}
        </p>
      </div>

      {/* Filter Card */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("搜索票 ID...")}
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
              {s.value === "all" ? tCommon("all") : t(s.labelKey)}
            </button>
          ))}
        </div>

        {/* Type pills */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {TYPE_OPTIONS.map((ty) => (
            <button
              key={ty.value}
              onClick={() => setTypeFilter(ty.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                typeFilter === ty.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {ty.value === "all" ? tCommon("all") : ty.label}
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
                  {t("票 ID")}
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t("上传者")}
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t("类型")}
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t("状态")}
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t("借用次数")}
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t("上传时间")}
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t("过期时间")}
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
                    colSpan={8}
                    className="text-center py-12 text-sm text-muted-foreground"
                  >
                    {t("暂无符合条件的票务")}
                  </td>
                </tr>
              ) : (
                filtered.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm text-muted-foreground">
                        {ticket.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="p-4">
                      {ticket.uploader ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {ticket.uploader.nickname}
                          </span>
                          <RepBadge value={ticket.uploader.reputation} />
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {t("未知")}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <TypeBadge type={ticket.ticket_type} />
                    </td>
                    <td className="p-4">
                      <TicketStatusBadge status={ticket.status} />
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        0
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(ticket.expires_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <Link
                          href={`/admin/tickets/${ticket.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <Icon name="chevron-right" size={16} />
                          {t("查看")}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
