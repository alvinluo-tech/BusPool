"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/types";
import Icon from "@/components/ui/Icon";

const statuses = ["all", "pending", "confirmed_valid", "confirmed_invalid", "auto_settled"] as const;

const statusConfig: Record<string, { labelKey: string; classes: string }> = {
  pending: {
    labelKey: "statusPending",
    classes: "bg-warning/10 text-warning border-warning/20",
  },
  confirmed_valid: {
    labelKey: "statusConfirmedValid",
    classes: "bg-success/10 text-success border-success/20",
  },
  confirmed_invalid: {
    labelKey: "statusConfirmedInvalid",
    classes: "bg-destructive/10 text-destructive border-destructive/20",
  },
  auto_settled: {
    labelKey: "statusAutoSettled",
    classes: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
};

export default function AdminTransactionsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const fetchTransactions = async () => {
      setLoading(true);
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

  const filtered = searchQuery
    ? transactions.filter(
        (tx) =>
          tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.ticket_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.borrower_id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transactions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("transactions")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage all point transactions
        </p>
      </div>

      {/* Filter Card */}
      <div className="bg-card border border-border rounded-xl shadow-level1">
        <div className="p-4 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Icon
              name="search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full h-10 pl-10 pr-4 bg-bg border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex gap-2 flex-wrap">
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
                {s === "all" ? tCommon("all") : t(statusConfig[s].labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-card border border-border rounded-xl shadow-level1 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {tCommon("noResults")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Transaction ID
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Ticket ID
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Uploader
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Borrower
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {t("pointsAmount")}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Created
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((tx) => {
                  const cfg = statusConfig[tx.status] || statusConfig.pending;
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm text-foreground">
                          {tx.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm text-muted-foreground">
                          {tx.ticket_id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm text-muted-foreground">
                          &mdash;
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm text-muted-foreground">
                          {tx.borrower_id.slice(0, 12)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-primary">
                          {tx.points_amount > 0 ? "+" : ""}
                          {tx.points_amount}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.classes}`}
                        >
                          {t(cfg.labelKey)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/admin/transactions/${tx.id}`}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Icon name="chevron-right" size={18} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
