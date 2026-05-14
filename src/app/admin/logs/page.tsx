"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";

/* ─── Types ─────────────────────────────────────────────── */

interface AdminLog {
  id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_name: string;
  target_id: string;
  detail: string;
  reason: string;
  created_at: string;
}

/* ─── Mock Data ─────────────────────────────────────────── */

const mockLogs: AdminLog[] = [
  {
    id: "log-001",
    admin_name: "Admin User",
    action: "adjust_points",
    target_type: "user",
    target_name: "Alice Johnson",
    target_id: "usr_001",
    detail: "Granted 50 points",
    reason: "Compensation for invalid ticket upload on 2026-05-14",
    created_at: "2026-05-14T14:30:00Z",
  },
  {
    id: "log-002",
    admin_name: "Admin User",
    action: "adjust_reputation",
    target_type: "user",
    target_name: "Charlie Brown",
    target_id: "usr_002",
    detail: "Decreased reputation by 15",
    reason: "Repeated invalid ticket uploads",
    created_at: "2026-05-14T10:15:00Z",
  },
  {
    id: "log-003",
    admin_name: "Moderator Dave",
    action: "ban_user",
    target_type: "user",
    target_name: "Eve Mallory",
    target_id: "usr_003",
    detail: "Account suspended",
    reason: "Multiple violations of ToS — uploading fake tickets",
    created_at: "2026-05-13T16:45:00Z",
  },
  {
    id: "log-004",
    admin_name: "Admin User",
    action: "review_appeal",
    target_type: "appeal",
    target_name: "Appeal #APL-008",
    target_id: "apl_008",
    detail: "Appeal resolved in favor of uploader",
    reason: "Evidence confirmed ticket was valid; restored reputation and points",
    created_at: "2026-05-13T12:00:00Z",
  },
  {
    id: "log-005",
    admin_name: "Moderator Dave",
    action: "force_remove",
    target_type: "ticket",
    target_name: "Ticket #TKT-123",
    target_id: "tkt_123",
    detail: "Ticket forcibly removed",
    reason: "Reported as expired ticket still listed",
    created_at: "2026-05-12T09:30:00Z",
  },
  {
    id: "log-006",
    admin_name: "Admin User",
    action: "manual_confirm",
    target_type: "transaction",
    target_name: "Transaction #TX-456",
    target_id: "tx_456",
    detail: "Manually confirmed as valid",
    reason: "Borrower reported scanner issue, uploader provided proof of validity",
    created_at: "2026-05-12T08:00:00Z",
  },
  {
    id: "log-007",
    admin_name: "Admin User",
    action: "adjust_points",
    target_type: "points",
    target_name: "Diana Prince",
    target_id: "usr_004",
    detail: "Deducted 30 points",
    reason: "Penalty for false appeal submission",
    created_at: "2026-05-11T15:20:00Z",
  },
  {
    id: "log-008",
    admin_name: "Moderator Dave",
    action: "review_appeal",
    target_type: "appeal",
    target_name: "Appeal #APL-012",
    target_id: "apl_012",
    detail: "Appeal rejected",
    reason: "No evidence provided to support the claim",
    created_at: "2026-05-11T11:00:00Z",
  },
];

/* ─── Filter options ────────────────────────────────────── */

const operationTypes = [
  "all",
  "adjust_points",
  "adjust_reputation",
  "ban_user",
  "review_appeal",
  "force_remove",
  "manual_confirm",
] as const;

const targetTypes = ["all", "user", "ticket", "transaction", "appeal", "points"] as const;

const operationTypeLabels: Record<string, string> = {
  adjust_points: "Adjust Points",
  adjust_reputation: "Adjust Reputation",
  ban_user: "Ban User",
  review_appeal: "Review Appeal",
  force_remove: "Force Remove",
  manual_confirm: "Manual Confirm",
};

const targetTypeLabels: Record<string, string> = {
  user: "User",
  ticket: "Ticket",
  transaction: "Transaction",
  appeal: "Appeal",
  points: "Points",
};

const operationTypeBadge: Record<string, string> = {
  adjust_points: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  adjust_reputation: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  ban_user: "bg-destructive/10 text-destructive border-destructive/20",
  review_appeal: "bg-success/10 text-success border-success/20",
  force_remove: "bg-warning/10 text-warning border-warning/20",
  manual_confirm: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

/* ─── Component ─────────────────────────────────────────── */

export default function AdminLogsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  const [opFilter, setOpFilter] = useState<string>("all");
  const [targetFilter, setTargetFilter] = useState<string>("all");

  /* Apply filters */
  const filtered = mockLogs.filter((log) => {
    if (opFilter !== "all" && log.action !== opFilter) return false;
    if (targetFilter !== "all" && log.target_type !== targetFilter) return false;
    return true;
  });

  /* Export CSV */
  const handleExportCsv = () => {
    const headers = [
      "Time",
      "Admin",
      "Operation Type",
      "Target Type",
      "Target Name",
      "Target ID",
      "Detail",
      "Reason",
    ];
    const rows = filtered.map((log) => [
      new Date(log.created_at).toLocaleString(),
      log.admin_name,
      operationTypeLabels[log.action] || log.action,
      targetTypeLabels[log.target_type] || log.target_type,
      log.target_name,
      log.target_id,
      log.detail,
      log.reason,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("logs")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Admin operation audit trail
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          disabled={filtered.length === 0}
        >
          <Icon name="upload" size={16} className="rotate-180" />
          {t("exportCsv")}
        </Button>
      </div>

      {/* Filter Card */}
      <div className="bg-card border border-border rounded-xl shadow-level1 p-4 space-y-4">
        {/* Operation Type Filter */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Operation Type
          </p>
          <div className="flex gap-2 flex-wrap">
            {operationTypes.map((op) => (
              <button
                key={op}
                onClick={() => setOpFilter(op)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  opFilter === op
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {op === "all"
                  ? tCommon("all")
                  : operationTypeLabels[op] || op}
              </button>
            ))}
          </div>
        </div>

        {/* Target Type Filter */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Target Type
          </p>
          <div className="flex gap-2 flex-wrap">
            {targetTypes.map((tt) => (
              <button
                key={tt}
                onClick={() => setTargetFilter(tt)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  targetFilter === tt
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {tt === "all"
                  ? tCommon("all")
                  : targetTypeLabels[tt] || tt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-card border border-border rounded-xl shadow-level1 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t("noLogs")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Time
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Admin
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Operation
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Target
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Detail
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((log) => {
                  const badge = operationTypeBadge[log.action] || "";
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground">
                          {log.admin_name}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge}`}
                        >
                          {operationTypeLabels[log.action] || log.action}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">
                            {log.target_name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {log.target_id}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground">
                          {log.detail}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-foreground max-w-xs truncate" title={log.reason}>
                          {log.reason}
                        </p>
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
