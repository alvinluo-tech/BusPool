"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import Icon from "@/components/ui/Icon";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  reason: string;
  created_at: string;
}

const actionTypes = ["all", "adjust_points", "adjust_reputation", "ban_user", "remove_ticket", "review_appeal"] as const;

const actionBadgeVariant: Record<string, "default" | "success" | "error" | "warning"> = {
  adjust_points: "default",
  adjust_reputation: "default",
  ban_user: "error",
  remove_ticket: "warning",
  review_appeal: "success",
};

const actionLabel: Record<string, string> = {
  adjust_points: "Adjust Points",
  adjust_reputation: "Adjust Reputation",
  ban_user: "Ban User",
  remove_ticket: "Remove Ticket",
  review_appeal: "Review Appeal",
};

export default function AdminLogsPage() {
  const t = useTranslations("admin");
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");

  useEffect(() => {
    const supabase = createClient();
    const fetchLogs = async () => {
      let query = supabase
        .from("admin_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (actionFilter !== "all") {
        query = query.eq("action", actionFilter);
      }

      const { data } = await query;
      setLogs(data || []);
      setLoading(false);
    };
    fetchLogs();
  }, [actionFilter]);

  const handleExportCsv = () => {
    const headers = ["Time", "Action", "Target Type", "Target ID", "Reason"];
    const rows = logs.map((log) => [
      new Date(log.created_at).toLocaleString(),
      actionLabel[log.action] || log.action,
      log.target_type,
      log.target_id,
      log.reason,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title={t("logs")}
        description="Admin operation audit trail"
        action={
          logs.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Icon name="upload" size={16} className="rotate-180" />
              Export CSV
            </Button>
          )
        }
      />

      {/* Filter Pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {actionTypes.map((a) => (
          <button
            key={a}
            onClick={() => setActionFilter(a)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              actionFilter === a
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {a === "all" ? "All" : actionLabel[a] || a}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState icon={<Icon name="file-text" size={24} />} title={t("noLogs")} />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Time</TableHeaderCell>
                <TableHeaderCell>Action</TableHeaderCell>
                <TableHeaderCell className="hidden sm:table-cell">Target Type</TableHeaderCell>
                <TableHeaderCell className="hidden sm:table-cell">Target</TableHeaderCell>
                <TableHeaderCell>Details</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={actionBadgeVariant[log.action] || "default"} size="sm">
                      {actionLabel[log.action] || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-foreground capitalize">{log.target_type}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="font-mono text-xs text-muted-foreground">
                      {log.target_id.slice(0, 12)}...
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-foreground max-w-xs truncate">{log.reason}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
