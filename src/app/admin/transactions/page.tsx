"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const statuses = ["all", "pending", "confirmed_valid", "confirmed_invalid", "auto_settled"] as const;

const statusBadgeVariant: Record<string, "warning" | "success" | "error" | "default"> = {
  pending: "warning",
  confirmed_valid: "success",
  confirmed_invalid: "error",
  auto_settled: "default",
};

export default function AdminTransactionsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const supabase = createClient();

    const fetchTransactions = async () => {
      let query = supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data } = await query;
      setTransactions(data || []);
      setLoading(false);
    };

    fetchTransactions();
  }, [statusFilter]);

  return (
    <div>
      <PageHeader title={t("transactions")} />

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
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-card rounded-xl p-4 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-foreground">
                  {tx.points_amount} pts
                </span>
                <Badge variant={statusBadgeVariant[tx.status] || "default"} size="sm">
                  {tx.status}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>Ticket: {tx.ticket_id.slice(0, 8)}...</p>
                <p>Borrower: {tx.borrower_id.slice(0, 8)}...</p>
                <p>Created: {new Date(tx.created_at).toLocaleString()}</p>
                {tx.failure_reason && <p>Reason: {tx.failure_reason}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
