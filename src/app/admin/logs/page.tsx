"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  reason: string;
  created_at: string;
}

const actionBadgeVariant: Record<string, "default" | "success" | "error" | "warning"> = {
  adjust_points: "default",
  adjust_reputation: "default",
  ban_user: "error",
  remove_ticket: "warning",
  review_appeal: "success",
};

export default function AdminLogsPage() {
  const t = useTranslations("admin");
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchLogs = async () => {
      const { data } = await supabase
        .from("admin_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      setLogs(data || []);
      setLoading(false);
    };

    fetchLogs();
  }, []);

  return (
    <div>
      <PageHeader title={t("logs")} />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon="file-text"
          title={t("noLogs")}
        />
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-card rounded-xl p-4 border border-border"
            >
              <div className="flex items-center justify-between mb-1">
                <Badge variant={actionBadgeVariant[log.action] || "default"} size="sm">
                  {log.action}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-foreground">{log.reason}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Target: {log.target_type} / {log.target_id.slice(0, 8)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
