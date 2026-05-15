"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AdminLog } from "@/types";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";

interface LogWithAdmin extends AdminLog {
  admin: { nickname: string; email: string } | null;
}

const operationTypes = ["all", "adjust_points", "adjust_reputation", "ban_user", "review_appeal", "force_remove", "manual_confirm", "revoke_transaction"] as const;
const targetTypes = ["all", "user", "ticket", "transaction", "appeal"] as const;

const operationLabelKeys: Record<string, string> = {
  adjust_points: "opAdjustPoints",
  adjust_reputation: "opAdjustReputation",
  ban_user: "opBanUser",
  review_appeal: "opReviewAppeal",
  force_remove: "opForceRemove",
  manual_confirm: "opManualConfirm",
  revoke_transaction: "opRevokeTransaction",
};

const targetLabelKeys: Record<string, string> = {
  user: "tgUser",
  ticket: "tgTicket",
  transaction: "tgTransaction",
  appeal: "tgAppeal",
};

const operationBadge: Record<string, string> = {
  adjust_points: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  adjust_reputation: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  ban_user: "bg-destructive/10 text-destructive border-destructive/20",
  review_appeal: "bg-success/10 text-success border-success/20",
  force_remove: "bg-warning/10 text-warning border-warning/20",
  manual_confirm: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  revoke_transaction: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

export default function AdminLogsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  const [logs, setLogs] = useState<LogWithAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [opFilter, setOpFilter] = useState<string>("all");
  const [targetFilter, setTargetFilter] = useState<string>("all");

  useEffect(() => {
    const supabase = createClient();
    setLoading(true);
    supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        const rawLogs = (data || []) as unknown as LogWithAdmin[];
        setLogs(rawLogs);
        setLoading(false);
      });
  }, []);

  const filtered = logs.filter((log) => {
    if (opFilter !== "all" && log.action !== opFilter) return false;
    if (targetFilter !== "all" && log.target_type !== targetFilter) return false;
    return true;
  });

  const formatDetail = (log: LogWithAdmin): string => {
    if (!log.details) return "—";
    const d = log.details as Record<string, unknown>;
    if (log.action === "adjust_points") return `${d.amount || 0} pts → balance: ${d.new_balance || "?"}`;
    if (log.action === "adjust_reputation") return `${d.old_value || "?"} → ${d.new_value || "?"}`;
    if (log.action === "force_remove") return t("ticketInvalidated");
    if (log.action === "manual_confirm" || log.action === "revoke_transaction") return t("statusChanged");
    if (log.action === "review_appeal") return d.decision === "resolved" ? t("appealResolved") : t("appealRejected");
    return "—";
  };

  const handleExportCsv = () => {
    const headers = ["Time", "Admin", "Action", "Target Type", "Target ID", "Detail", "Reason"];
    const rows = filtered.map((log) => [
      new Date(log.created_at).toLocaleString(),
      log.admin?.nickname || log.admin_id.slice(0, 8),
      t(operationLabelKeys[log.action] || log.action),
      t(targetLabelKeys[log.target_type] || log.target_type),
      log.target_id,
      formatDetail(log),
      log.reason,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("logs")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("adminOperationAudit")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={filtered.length === 0}>
          <Icon name="upload" size={16} className="rotate-180" />
          {t("exportCsv")}
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-level1 p-4 space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("operationType")}</p>
          <div className="flex gap-2 flex-wrap">
            {operationTypes.map((op) => (
              <button
                key={op}
                onClick={() => setOpFilter(op)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  opFilter === op ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {op === "all" ? tCommon("all") : t(operationLabelKeys[op] || op)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("targetType")}</p>
          <div className="flex gap-2 flex-wrap">
            {targetTypes.map((tt) => (
              <button
                key={tt}
                onClick={() => setTargetFilter(tt)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  targetFilter === tt ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {tt === "all" ? tCommon("all") : t(targetLabelKeys[tt] || tt)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">{t("noLogs")}</div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-level1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{t("time")}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{t("admin")}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{t("operation")}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{t("target")}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{t("detail")}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{t("reason")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((log) => {
                  const badge = operationBadge[log.action] || "";
                  return (
                    <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</span>
                      </td>
                      <td className="p-4"><span className="text-sm text-foreground">{log.admin?.nickname || log.admin_id.slice(0, 8)}</span></td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge}`}>
                          {t(operationLabelKeys[log.action] || log.action)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">{t(targetLabelKeys[log.target_type] || log.target_type)}</span>
                          <span className="text-xs text-muted-foreground font-mono">{log.target_id.slice(0, 12)}</span>
                        </div>
                      </td>
                      <td className="p-4"><span className="text-sm text-foreground">{formatDetail(log)}</span></td>
                      <td className="p-4">
                        <p className="text-sm text-foreground max-w-xs truncate" title={log.reason}>{log.reason}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
