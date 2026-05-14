"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Appeal } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const statuses = ["all", "pending", "resolved", "rejected"] as const;

const statusBadgeVariant: Record<string, "warning" | "success" | "error"> = {
  pending: "warning",
  resolved: "success",
  rejected: "error",
};

export default function AdminAppealsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const supabase = createClient();

    const fetchAppeals = async () => {
      let query = supabase
        .from("appeals")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data } = await query;
      setAppeals(data || []);
      setLoading(false);
    };

    fetchAppeals();
  }, [statusFilter]);

  return (
    <div>
      <PageHeader title={t("appeals")} />

      <div className="flex gap-2 mb-4 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s === "all" ? tCommon("all") : t(`status_${s}` as never)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-2">
          {appeals.map((appeal) => (
            <Link
              key={appeal.id}
              href={`/admin/appeals/${appeal.id}`}
              className="block bg-card rounded-xl p-4 border border-border hover:shadow-level2 transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground truncate">
                  {appeal.reason.slice(0, 40)}...
                </span>
                <Badge variant={statusBadgeVariant[appeal.status] || "default"} size="sm">
                  {appeal.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(appeal.created_at).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
