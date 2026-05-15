"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Icon from "@/components/ui/Icon";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ─── Types ─── */

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

interface DailyDataPoint {
  date: string;
  users: number;
  uploads: number;
  borrows: number;
  confirmedValid: number;
  confirmedInvalid: number;
}

/* ─── Inline trend icons ─── */

function TrendUpIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7,7 17,7 17,17" />
    </svg>
  );
}

function TrendDownIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="17" y1="7" x2="7" y2="17" />
      <polyline points="17,17 7,17 7,7" />
    </svg>
  );
}

function TrendNeutralIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/* ─── Color constants ─── */

const COLORS = {
  blue: { bg: "rgba(59,130,246,0.1)", fg: "#3b82f6", border: "rgba(59,130,246,0.2)" },
  emerald: { bg: "rgba(16,185,129,0.1)", fg: "#10b981", border: "rgba(16,185,129,0.2)" },
  purple: { bg: "rgba(139,92,246,0.1)", fg: "#8b5cf6", border: "rgba(139,92,246,0.2)" },
  green: { bg: "rgba(34,197,94,0.1)", fg: "#22c55e", border: "rgba(34,197,94,0.2)" },
  amber: { bg: "rgba(245,158,11,0.1)", fg: "#f59e0b", border: "rgba(245,158,11,0.2)" },
  red: { bg: "rgba(239,68,68,0.1)", fg: "#ef4444", border: "rgba(239,68,68,0.2)" },
} as const;

/* ─── Helpers ─── */

function buildDateMap(): Record<string, DailyDataPoint> {
  const map: Record<string, DailyDataPoint> = {};
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = { date: key, users: 0, uploads: 0, borrows: 0, confirmedValid: 0, confirmedInvalid: 0 };
  }
  return map;
}

function formatDateLabel(label: unknown): string {
  if (typeof label !== "string") return "";
  const d = new Date(label);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ─── Chart tooltip styles ─── */

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.5rem",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
};

/* ─── Page ─── */

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dailyData, setDailyData] = useState<DailyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const loadData = async () => {
      setLoading(true);

      const { data: statsData } = await supabase.rpc("admin_get_dashboard_stats");

      const since14 = new Date();
      since14.setDate(since14.getDate() - 14);
      const sinceISO = since14.toISOString();

      const [ticketsRes, txRes, usersRes] = await Promise.all([
        supabase.from("tickets").select("created_at").gte("created_at", sinceISO).order("created_at"),
        supabase.from("transactions").select("created_at, status").gte("created_at", sinceISO).order("created_at"),
        supabase.from("users").select("created_at").gte("created_at", sinceISO).order("created_at"),
      ]);

      if (statsData) {
        setStats(statsData as unknown as DashboardStats);
      }

      const dateMap = buildDateMap();

      if (usersRes.data) {
        for (const u of usersRes.data) {
          const key = u.created_at.slice(0, 10);
          if (dateMap[key]) dateMap[key].users++;
        }
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
          if (!dateMap[key]) continue;
          dateMap[key].borrows++;
          if (tx.status === "confirmed_valid") dateMap[key].confirmedValid++;
          else if (tx.status === "confirmed_invalid") dateMap[key].confirmedInvalid++;
        }
      }

      setDailyData(Object.values(dateMap));
      setLoading(false);
    };

    loadData();
  }, []);

  /* ─── Derived data ─── */

  const trends = useMemo(() => {
    if (dailyData.length < 2) return null;
    const today = dailyData[dailyData.length - 1];
    const yesterday = dailyData[dailyData.length - 2];

    const calc = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const todayValidity = today.confirmedValid + today.confirmedInvalid > 0
      ? Math.round((today.confirmedValid / (today.confirmedValid + today.confirmedInvalid)) * 100)
      : (stats?.validity_rate ?? 0);
    const yesterdayValidity = yesterday.confirmedValid + yesterday.confirmedInvalid > 0
      ? Math.round((yesterday.confirmedValid / (yesterday.confirmedValid + yesterday.confirmedInvalid)) * 100)
      : (stats?.validity_rate ?? 0);

    return {
      users: { change: calc(today.users, yesterday.users), trend: today.users >= yesterday.users ? "up" as const : "down" as const },
      uploads: { change: calc(today.uploads, yesterday.uploads), trend: today.uploads >= yesterday.uploads ? "up" as const : "down" as const },
      borrows: { change: calc(today.borrows, yesterday.borrows), trend: today.borrows >= yesterday.borrows ? "up" as const : "down" as const },
      validity: { change: calc(todayValidity, yesterdayValidity), trend: todayValidity >= yesterdayValidity ? "up" as const : "down" as const },
    };
  }, [dailyData, stats]);

  /* ─── Chart data ─── */

  // User growth: cumulative
  const userGrowthData = useMemo(() => {
    let running = 0;
    // eslint-disable-next-line react-hooks/immutability
    return dailyData.map((d) => ((running += d.users), { ...d, cumulativeUsers: running }));
  }, [dailyData]);

  // Validity rate per day
  const validityData = useMemo(() => {
    return dailyData.map((d) => {
      const total = d.confirmedValid + d.confirmedInvalid;
      return {
        ...d,
        rate: total > 0 ? Math.round((d.confirmedValid / total) * 100) : null,
      };
    });
  }, [dailyData]);

  /* ─── Loading state ─── */

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted rounded mb-2 animate-pulse" />
          <div className="h-4 w-72 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-5 border border-border animate-pulse">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="h-4 w-12 bg-muted rounded" />
              </div>
              <div className="h-4 w-20 bg-muted rounded mt-3" />
              <div className="h-8 w-16 bg-muted rounded mt-1" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-card rounded-xl p-6 border border-border animate-pulse h-[360px]" />
          <div className="bg-card rounded-xl p-6 border border-border animate-pulse h-[360px]" />
        </div>
        <div className="bg-card rounded-xl p-6 border border-border animate-pulse h-[320px]" />
      </div>
    );
  }

  /* ─── Error / empty state ─── */

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

  /* ─── Stat cards config ─── */

  const statCards = [
    {
      key: "dailyActiveUsers",
      value: dailyData.length > 0 ? dailyData[dailyData.length - 1].users : 0,
      icon: "users" as const,
      color: COLORS.blue,
      trend: trends?.users,
    },
    {
      key: "dailyUploads",
      value: stats.daily_uploads,
      icon: "upload" as const,
      color: COLORS.emerald,
      trend: trends?.uploads,
    },
    {
      key: "dailyBorrows",
      value: stats.daily_borrows,
      icon: "activity" as const,
      color: COLORS.purple,
      trend: trends?.borrows,
    },
    {
      key: "ticketValidityRate",
      value: `${stats.validity_rate}%`,
      icon: "check-circle" as const,
      color: COLORS.green,
      trend: trends?.validity,
    },
    {
      key: "activeTickets",
      value: stats.active_tickets,
      icon: "star" as const,
      color: COLORS.amber,
    },
    {
      key: "pendingAppeals",
      value: stats.pending_appeals,
      icon: "alert" as const,
      color: COLORS.red,
    },
  ];

  /* ─── Render ─── */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("dashboard")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("dashboardSubtitle")}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted-foreground">{t("live")}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="bg-card rounded-xl p-5 border border-border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div
                className="p-2.5 rounded-lg"
                style={{ backgroundColor: card.color.bg, color: card.color.fg }}
              >
                <Icon name={card.icon} size={22} />
              </div>
              {card.trend && (
                <div
                  className={`flex items-center gap-0.5 text-xs font-medium rounded-full px-2 py-0.5 ${
                    card.trend.trend === "up"
                      ? "text-success bg-success/10"
                      : card.trend.trend === "down"
                        ? "text-destructive bg-destructive/10"
                        : "text-muted-foreground bg-muted"
                  }`}
                >
                  {card.trend.trend === "up" ? (
                    <TrendUpIcon />
                  ) : card.trend.trend === "down" ? (
                    <TrendDownIcon />
                  ) : (
                    <TrendNeutralIcon />
                  )}
                  <span>{card.trend.change}%</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-3">{t(card.key as never)}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row: User Growth + Daily Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Trend — Area Chart */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-semibold text-foreground">{t("userGrowthTrend")}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t("growthVsLastMonth")}</p>
            </div>
          </div>
          {userGrowthData.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">{t("noData")}</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.blue.fg} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.blue.fg} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatDateLabel}
                  interval={2}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={formatDateLabel as any} // eslint-disable-line @typescript-eslint/no-explicit-any
                  formatter={((value: number) => [value, t("totalUsers")]) as any} // eslint-disable-line @typescript-eslint/no-explicit-any
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeUsers"
                  stroke={COLORS.blue.fg}
                  strokeWidth={2}
                  fill="url(#colorUsers)"
                  dot={{ fill: COLORS.blue.fg, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Daily Transaction Volume — Bar Chart */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-base font-semibold text-foreground mb-2">{t("dailyTransactionVolume")}</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.emerald.fg }} />
              {t("uploadsChart")}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.purple.fg }} />
              {t("borrowsChart")}
            </div>
          </div>
          {dailyData.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">{t("noData")}</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatDateLabel}
                  interval={2}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={formatDateLabel as any} // eslint-disable-line @typescript-eslint/no-explicit-any
                />
                <Legend
                  wrapperStyle={{ paddingTop: "16px" }}
                  iconType="circle"
                />
                <Bar
                  dataKey="uploads"
                  name={t("uploadsChart")}
                  fill={COLORS.emerald.fg}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="borrows"
                  name={t("borrowsChart")}
                  fill={COLORS.purple.fg}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Ticket Validity Rate Trend — Full-width Area Chart */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-base font-semibold text-foreground mb-2">{t("ticketValidityRateTrend")}</h3>
        {validityData.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">{t("noData")}</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={validityData}>
              <defs>
                <linearGradient id="colorValidity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.green.fg} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.green.fg} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatDateLabel}
                interval={2}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
                width={45}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={formatDateLabel as any} // eslint-disable-line @typescript-eslint/no-explicit-any
                formatter={((value: number | null) =>
                  value !== null ? [`${value}%`, t("ticketValidityRate")] : ["—", t("ticketValidityRate")]) as any // eslint-disable-line @typescript-eslint/no-explicit-any
                }
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={COLORS.green.fg}
                strokeWidth={2}
                fill="url(#colorValidity)"
                connectNulls
                dot={{ fill: COLORS.green.fg, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Real-time Status */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-base font-semibold text-foreground mb-1">{t("realtimeStatus")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("platformRunningNormally")}</p>
        <div className="p-4 rounded-lg border mb-5 flex items-center gap-3" style={{ backgroundColor: "rgba(34, 197, 94, 0.05)", borderColor: "rgba(34, 197, 94, 0.2)" }}>
          <span className="h-3 w-3 rounded-full bg-success animate-pulse shadow-lg shadow-success/50 shrink-0" />
          <span className="text-sm font-medium text-foreground">{t("platformRunningNormally")}</span>
          <span
            className="ml-auto text-xs font-medium px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(34, 197, 94, 0.15)", color: "#16a34a" }}
          >
            {t("systemHealthy")}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "clock" as const, labelKey: "pendingTransactions", value: stats.pending_transactions },
            { icon: "activity" as const, labelKey: "activeTicketsCount", value: stats.active_tickets },
            { icon: "dollar" as const, labelKey: "pointsCirculating", value: stats.points_circulating.toLocaleString() },
          ].map((item) => (
            <div key={item.labelKey} className="p-4 rounded-lg flex items-center gap-3 bg-muted/50 hover:bg-muted transition-colors">
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
