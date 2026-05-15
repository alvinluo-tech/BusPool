"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/types";
import Icon from "@/components/ui/Icon";

interface JoinedTx extends Transaction {
  ticket: { uploader: { nickname: string } | null } | null;
  borrower: { nickname: string } | null;
}

const statuses = ["all", "pending", "confirmed_valid", "confirmed_invalid", "auto_settled"] as const;

const statusConfig: Record<string, { labelKey: string; classes: string }> = {
  pending: { labelKey: "statusPending", classes: "bg-warning/10 text-warning border-warning/20" },
  confirmed_valid: { labelKey: "statusConfirmedValid", classes: "bg-success/10 text-success border-success/20" },
  confirmed_invalid: { labelKey: "statusConfirmedInvalid", classes: "bg-destructive/10 text-destructive border-destructive/20" },
  auto_settled: { labelKey: "statusAutoSettled", classes: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
};

export default function AdminTransactionsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [transactions, setTransactions] = useState<JoinedTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const fetchTransactions = async () => {
      setLoading(true);
      let query = supabase
        .from("transactions")
        .select("*, ticket:tickets!inner(uploader:users!tickets_uploader_id_fkey(nickname)), borrower:users!transactions_borrower_id_fkey(nickname)")
        .order("created_at", { ascending: false });
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      const { data } = await query;
      setTransactions((data || []) as unknown as JoinedTx[]);
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
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("transactions")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("viewManageTransactions")}</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-level1">
        <div className="p-4 space-y-4">
          <div className="relative">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full h-10 pl-10 pr-4 bg-bg border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {s === "all" ? tCommon("all") : t(statusConfig[s].labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-level1 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">{tCommon("noResults")}</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{t("transactionId")}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{t("ticketId")}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{t("uploader")}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{t("borrower")}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{t("pointsAmount")}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{t("status")}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{t("created")}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{t("action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((tx) => {
                    const cfg = statusConfig[tx.status] || statusConfig.pending;
                    return (
                      <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                        <td className="p-4"><span className="font-mono text-sm text-foreground">{tx.id.slice(0, 8)}</span></td>
                        <td className="p-4"><span className="font-mono text-sm text-muted-foreground">{tx.ticket_id.slice(0, 8)}</span></td>
                        <td className="p-4"><span className="text-sm text-muted-foreground">{tx.ticket?.uploader?.nickname || t("unknown")}</span></td>
                        <td className="p-4"><span className="text-sm text-muted-foreground">{tx.borrower?.nickname || tx.borrower_id.slice(0, 12)}</span></td>
                        <td className="p-4"><span className="font-semibold text-primary">{tx.points_amount > 0 ? "+" : ""}{tx.points_amount}</span></td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.classes}`}>
                            {t(cfg.labelKey)}
                          </span>
                        </td>
                        <td className="p-4"><span className="text-sm text-muted-foreground whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString()}</span></td>
                        <td className="p-4">
                          <Link href={`/admin/transactions/${tx.id}`} className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <Icon name="chevron-right" size={18} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3 p-4">
              {filtered.map((tx) => {
                const cfg = statusConfig[tx.status] || statusConfig.pending;
                return (
                  <Link key={tx.id} href={`/admin/transactions/${tx.id}`} className="block bg-muted/30 border border-border rounded-xl p-4 active:bg-muted/60 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-foreground">#{tx.id.slice(0, 8)}</span>
                        <span className="text-xs text-muted-foreground">→ #{tx.ticket_id.slice(0, 8)}</span>
                      </div>
                      <span className="font-semibold text-base">{tx.points_amount > 0 ? "+" : ""}{tx.points_amount}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm mb-1">
                      <span className="text-muted-foreground">{tx.ticket?.uploader?.nickname || t("unknown")}</span>
                      <span className="text-muted-foreground text-xs">→</span>
                      <span className="text-muted-foreground">{tx.borrower?.nickname || tx.borrower_id.slice(0, 12)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.classes}`}>
                          {t(cfg.labelKey)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
