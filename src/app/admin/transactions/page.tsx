"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Icon from "@/components/ui/Icon";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";

const statuses = ["all", "pending", "confirmed_valid", "confirmed_invalid", "auto_settled"] as const;

const statusBadgeVariant: Record<string, "warning" | "success" | "error" | "default"> = {
  pending: "warning",
  confirmed_valid: "success",
  confirmed_invalid: "error",
  auto_settled: "default",
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  confirmed_valid: "Valid",
  confirmed_invalid: "Invalid",
  auto_settled: "Auto Settled",
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
      <PageHeader
        title={t("transactions")}
        description="View and manage all point transactions"
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
            {s === "all" ? tCommon("all") : statusLabel[s] || s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Ticket</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell className="hidden sm:table-cell">Status</TableHeaderCell>
                <TableHeaderCell className="hidden md:table-cell">Date</TableHeaderCell>
                <TableHeaderCell className="hidden md:table-cell">Reason</TableHeaderCell>
                <TableHeaderCell className="text-right">Action</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No transactions found
                  </td>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {tx.id.slice(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {tx.ticket_id.slice(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${
                        tx.points_amount > 0 ? "text-chart-1" : "text-chart-5"
                      }`}>
                        {tx.points_amount > 0 ? "+" : ""}{tx.points_amount}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={statusBadgeVariant[tx.status] || "default"} size="sm">
                        {statusLabel[tx.status] || tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {tx.failure_reason ? (
                        <span className="text-xs text-muted-foreground capitalize">{tx.failure_reason}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/transactions/${tx.id}`}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Icon name="chevron-right" size={18} />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
