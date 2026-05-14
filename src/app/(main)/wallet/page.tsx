"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { groupByDate, formatTime } from "@/lib/utils";

interface TransactionRow {
  id: string;
  points_amount: number;
  status: string;
  created_at: string;
  borrower_id: string;
  ticket?: { ticket_type: string; uploader?: { nickname: string } | null } | null;
  borrower?: { nickname: string } | null;
}

function getDescription(tx: TransactionRow, userId: string): string {
  const isBorrower = tx.borrower_id === userId;
  const otherName = isBorrower
    ? tx.ticket?.uploader?.nickname || "Unknown"
    : tx.borrower?.nickname || "Unknown";
  if (isBorrower) return `Borrowed from ${otherName}`;
  return `Shared with ${otherName}`;
}

function getTxStyle(tx: TransactionRow, userId: string): {
  isExpense: boolean;
  isPending: boolean;
  showAsTransfer: boolean;
  sign: string;
  colorClass: string;
  bgClass: string;
  iconName: IconName;
  iconColor: string;
} {
  const isExpense = tx.borrower_id === userId;
  const isPending = tx.status === "pending";
  const isConfirmed = tx.status === "confirmed_valid";
  // Only confirmed_valid means actual money moved
  const showAsTransfer = isConfirmed;
  const sign = isExpense ? "-" : "+";
  const colorClass = showAsTransfer
    ? (isExpense ? "text-destructive" : "text-success")
    : "text-muted-foreground";
  const bgClass = isPending
    ? "bg-warning/10"
    : showAsTransfer
      ? (isExpense ? "bg-destructive/10" : "bg-success/10")
      : "bg-muted";
  const iconName = isPending
    ? "clock"
    : isExpense ? "arrow-down-left" : "arrow-up-right";
  const iconColor = isPending
    ? "text-warning"
    : showAsTransfer
      ? (isExpense ? "text-destructive" : "text-success")
      : "text-muted-foreground";

  return { isExpense, isPending, showAsTransfer, sign, colorClass, bgClass, iconName, iconColor };
}

export default function WalletPage() {
  const t = useTranslations("wallet");
  const tCommon = useTranslations("common");
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState("");
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  useEffect(() => {
    const supabase = createClient();
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("users")
        .select("points_balance")
        .eq("id", user.id)
        .single();
      setBalance(profile?.points_balance ?? 0);

      // Get transactions where user is borrower
      const { data: expenseTxs } = await supabase
        .from("transactions")
        .select("id, points_amount, status, created_at, borrower_id, ticket:tickets(ticket_type, uploader:users!tickets_uploader_id_fkey(nickname)), borrower:users!transactions_borrower_id_fkey(nickname)")
        .eq("borrower_id", user.id)
        .order("created_at", { ascending: false });

      // Get transactions where user's ticket was borrowed (income)
      const { data: incomeTxs } = await supabase
        .from("transactions")
        .select("id, points_amount, status, created_at, borrower_id, ticket:tickets!inner(ticket_type), borrower:users!transactions_borrower_id_fkey(nickname)")
        .eq("tickets.uploader_id", user.id)
        .order("created_at", { ascending: false });

      const allTxs = [...(expenseTxs || []), ...(incomeTxs || [])];
      // Deduplicate (in case user borrowed their own ticket)
      const seen = new Set<string>();
      const merged = allTxs.filter((tx) => {
        if (seen.has(tx.id)) return false;
        seen.add(tx.id);
        return true;
      });

      setTransactions(merged as unknown as TransactionRow[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Only confirmed_valid transactions involve actual money movement
  const totalIncome = transactions
    .filter((tx) => tx.borrower_id !== userId && tx.status === "confirmed_valid")
    .reduce((sum, tx) => sum + tx.points_amount, 0);

  const totalExpense = transactions
    .filter((tx) => tx.borrower_id === userId && tx.status === "confirmed_valid")
    .reduce((sum, tx) => sum + tx.points_amount, 0);

  const filtered = transactions.filter((tx) => {
    const isExpense = tx.borrower_id === userId;
    if (filter === "income") return !isExpense;
    if (filter === "expense") return isExpense;
    return true;
  });

  const groups = groupByDate(filtered);

  return (
    <div>
      {/* Balance Header */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">{t("balance")}</p>
        <p className="text-[48px] font-bold text-foreground leading-tight mt-1">{balance}</p>
      </div>

      {/* Income / Expense Cards */}
      <div className="flex gap-3 mb-6">
        <Card variant="stats" className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
              <Icon name="arrow-up-right" size={16} className="text-success" />
            </div>
            <span className="text-xs text-muted-foreground">{t("income")}</span>
          </div>
          <p className="text-[32px] font-bold text-foreground">+{totalIncome}</p>
        </Card>
        <Card variant="stats" className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center">
              <Icon name="arrow-down-left" size={16} className="text-destructive" />
            </div>
            <span className="text-xs text-muted-foreground">{t("expense")}</span>
          </div>
          <p className="text-[32px] font-bold text-destructive">-{totalExpense}</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "income", "expense"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? tCommon("all") : f === "income" ? t("income") : t("expense")}
          </button>
        ))}
      </div>

      {/* Transaction History */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Icon name="wallet" size={32} />}
          title={t("empty")}
        />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.items.map((tx) => {
                  const description = getDescription(tx, userId);
                  const { isPending, showAsTransfer, sign, colorClass, bgClass, iconName, iconColor } = getTxStyle(tx, userId);

                  return (
                    <Card key={tx.id} className="p-4 flex items-center gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}>
                        <Icon name={iconName} size={18} className={iconColor} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {description}
                          </p>
                          {isPending && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-warning/10 text-warning shrink-0">
                              Pending
                            </span>
                          )}
                          {!showAsTransfer && !isPending && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                              Failed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{formatTime(tx.created_at)}</p>
                      </div>

                      {/* Points */}
                      {isPending ? (
                        <span className="text-sm text-muted-foreground">···</span>
                      ) : (
                        <span className={`font-bold text-sm ${colorClass}`}>
                          {sign}{tx.points_amount}
                        </span>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
