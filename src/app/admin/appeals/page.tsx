"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Appeal } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Icon from "@/components/ui/Icon";

const statuses = ["all", "pending", "resolved", "rejected"] as const;

const statusBadgeVariant: Record<string, "warning" | "success" | "error"> = {
  pending: "warning",
  resolved: "success",
  rejected: "error",
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  resolved: "Resolved",
  rejected: "Rejected",
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
      <PageHeader
        title={t("appeals")}
        description="Review and process user submitted appeals"
      />

      {/* Filter Pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {s === "all" ? tCommon("all") : statusLabel[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-4">
          {appeals.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No appeals found
            </div>
          ) : (
            appeals.map((appeal) => (
              <div
                key={appeal.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-level2 transition-shadow"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      Appeal #{appeal.id.slice(0, 8)}
                    </span>
                    <Badge variant={statusBadgeVariant[appeal.status] || "default"} size="sm">
                      {statusLabel[appeal.status]}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(appeal.created_at).toLocaleString()}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Meta Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Appellant</p>
                      <p className="text-foreground font-mono text-xs">{appeal.appellant_id.slice(0, 12)}...</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Transaction</p>
                      <p className="text-foreground font-mono text-xs">{appeal.transaction_id.slice(0, 12)}...</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                      <Badge variant={statusBadgeVariant[appeal.status] || "default"} size="sm">
                        {statusLabel[appeal.status]}
                      </Badge>
                    </div>
                  </div>

                  {/* Reason Quote */}
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-sm text-foreground leading-relaxed">
                      &ldquo;{appeal.reason}&rdquo;
                    </p>
                  </div>

                  {/* Admin Note (if resolved/rejected) */}
                  {appeal.admin_note && (
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                      <p className="text-xs text-primary font-medium mb-1">Admin Note</p>
                      <p className="text-sm text-foreground">{appeal.admin_note}</p>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                {appeal.status === "pending" && (
                  <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end">
                    <Link href={`/admin/appeals/${appeal.id}`}>
                      <Button variant="primary" size="sm">
                        <Icon name="chevron-right" size={16} />
                        Review
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
