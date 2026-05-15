"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Icon from "@/components/ui/Icon";

interface DashboardStats {
  total_users: number;
  total_tickets: number;
  active_tickets: number;
  pending_appeals: number;
  pending_transactions: number;
  daily_uploads: number;
  daily_borrows: number;
  validity_rate: number;
  points_circulating: number;
}

interface ChartPoint {
  date: string;
  uploads: number;
  borrows: number;
}

const statIconMap: Record<string, "users" | "tickets" | "activity" | "check" | "star" | "alert"> = {
  total_users: "users",
  total_tickets: "tickets",
  active_tickets: "star",
  pending_appeals: "alert",
  pending_transactions: "activity",
  validity_rate: "check",
  daily_uploads: "tickets",
  daily_borrows: "activity",
  points_circulating: "star",
};

const statColorMap: Record<string, { bg: string; fg: string; border: string }> = {
  total_users: { bg: "rgba(59, 130, 246, 0.1)", fg: "#2563eb", border: "rgba(59, 130, 246, 0.2)" },
  total_tickets: { bg: "rgba(16, 185, 129, 0.1)", fg: "#059669", border: "rgba(16, 185, 129, 0.2)" },
  active_tickets: { bg: "rgba(245, 158, 11, 0.1)", fg: "#d97706", border: "rgba(245, 158, 11, 0.2)" },
  pending_appeals: { bg: "rgba(239, 68, 68, 0.1)", fg: "#dc2626", border: "rgba(239, 68, 68, 0.2)" },
  pending_transactions: { bg: "rgba(139, 92, 246, 0.1)", fg: "#7c3aed", border: "rgba(139, 92, 246, 0.2)" },
  validity_rate: { bg: "rgba(34, 197, 94, 0.1)", fg: "#16a34a", border: "rgba(34, 197, 94, 0.2)" },
  daily_uploads: { bg: "rgba(16, 185, 129, 0.1)", fg: "#059669", border: "rgba(16, 185, 129, 0.2)" },
  daily_borrows: { bg: "rgba(139, 92, 246, 0.1)", fg: "#7c3aed", border: "rgba(139, 92, 246, 0.2)" },
  points_circulating: { bg: "rgba(245, 158, 11, 0.1)", fg: "#d97706", border: "rgba(245, 158, 11, 0.2)" },
};

const statLabelKeys: Record<string, string> = {
  total_users: "totalUsers",
  total_tickets: "totalTickets",
  active_tickets: "availableTickets",
  pending_appeals: "pendingAppeals",
  pending_transactions: "pendingTransactions",
  validity_rate: "ticketValidityRate",
  daily_uploads: "dailyUploads",
  daily_borrows: "dailyBorrows",
  points_circulating: "pointsInCirculation",
};

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dailyData, setDailyData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const loadStats = async () => {
      setLoading(true);

      // Fetch aggregate stats via RPC
      const { data: statsData } = await supabase.rpc("admin_get_dashboard_stats");
      if (statsData) {
        setStats(statsData as unknown as DashboardStats);
      }

      // Fetch daily chart data for last 14 days
      const since14 = new Date();
      since14.setDate(since14.getDate() - 14);
      const sinceISO = since14.toISOString();

      const [ticketsRes, txRes] = await Promise.all([
        supabase.from("tickets").select("created_at").gte("created_at", sinceISO).order("created_at"),
        supabase.from("transactions").select("created_at").gte("created_at", sinceISO).order("created_at"),
      ]);

      // Build date buckets for last 14 days
      const dateMap: Record<string, ChartPoint> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dateMap[key] = { date: key, uploads: 0, borrows: 0 };
      }

      if (ticketsRes.data) {
        for (const t of ticketsRes.data) {
          const key = t.created_at.slice(0, 10);
          if (dateMap[key]) dateMap[key].uploads++;
        }
      }
      if (txRes.data) {
        for (const tx of txRes.data) {
          const key = tx.created_at.slice(0, 10);
          if (dateMap[key]) dateMap[key].borrows++;
        }
      }

      setDailyData(Object.values(dateMap));
      setLoading(false);
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">{t("dashboard")}</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-5 border border-border animate-pulse">
              <div className="h-10 w-10 rounded-lg bg-muted" />
              <div className="h-4 w-24 bg-muted rounded mt-3" />
              <div className="h-8 w-16 bg-muted rounded mt-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">{t("dashboard")}</h1>
        <div className="bg-card rounded-xl p-12 text-center border border-border">
          <Icon name="alert" size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t("loadError")}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { key: "total_users", value: stats.total_users },
    { key: "total_tickets", value: stats.total_tickets },
    { key: "active_tickets", value: stats.active_tickets },
    { key: "validity_rate", value: `${stats.validity_rate}%` },
    { key: "daily_uploads", value: stats.daily_uploads },
    { key: "pending_appeals", value: stats.pending_appeals },
  ];

  const maxChartVal = Math.max(
    ...dailyData.map((d) => Math.max(d.uploads, d.borrows)),
    1,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">{t("dashboard")}</h1>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted-foreground">{t("live")}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const colors = statColorMap[card.key] || statColorMap.total_users;
          const icon = statIconMap[card.key] || "star";
          return (
            <div key={card.key} className="bg-card rounded-xl p-5 border border-border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.fg }}>
                  <Icon name={icon} size={22} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {t(statLabelKeys[card.key] || card.key)}
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Daily Uploads + Borrows Chart */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-base font-semibold text-foreground mb-4">{t("dailyTransactionVolume")}</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#10b981" }} />
            {t("uploadsChart")}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#8b5cf6" }} />
            {t("borrowsChart")}
          </div>
        </div>
        {dailyData.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">{t("noData")}</div>
        ) : (
          <>
            <div className="h-[200px] flex items-end gap-2">
              {dailyData.map((day) => (
                <div key={day.date} className="flex-1 flex items-end gap-0.5 h-full">
                  <div
                    className="flex-1 rounded-t-md transition-all"
                    style={{
                      height: maxChartVal > 0 ? `${(day.uploads / maxChartVal) * 100}%` : "0%",
                      backgroundColor: "#10b981",
                    }}
                  />
                  <div
                    className="flex-1 rounded-t-md transition-all"
                    style={{
                      height: maxChartVal > 0 ? `${(day.borrows / maxChartVal) * 100}%` : "0%",
                      backgroundColor: "#8b5cf6",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {dailyData.filter((_, i) => i % 3 === 0 || i === dailyData.length - 1).map((day) => (
                <span key={day.date} className="text-[10px] text-muted-foreground">
                  {new Date(day.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Real-time Status */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-base font-semibold text-foreground mb-4">{t("realtimeStatus")}</h3>
        <div className="p-4 rounded-lg border mb-5 flex items-center gap-3" style={{ backgroundColor: "rgba(34, 197, 94, 0.05)", borderColor: "rgba(34, 197, 94, 0.2)" }}>
          <span className="h-3 w-3 rounded-full bg-success animate-pulse shrink-0" />
          <span className="text-sm font-medium text-foreground">{t("platformRunningNormally")}</span>
          <span className="ml-auto text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(34, 197, 94, 0.15)", color: "#16a34a" }}>
            {t("systemHealthy")}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "clock" as const, labelKey: "pendingTransactions", value: stats.pending_transactions },
            { icon: "activity" as const, labelKey: "activeTicketsCount", value: stats.active_tickets },
            { icon: "dollar" as const, labelKey: "pointsCirculating", value: stats.points_circulating.toLocaleString() },
          ].map((item) => (
            <div key={item.labelKey} className="p-3 rounded-lg flex items-center gap-3 bg-muted/50">
              <div className="p-2 rounded-lg bg-muted">
                <Icon name={item.icon} size={18} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t(item.labelKey)}</p>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
