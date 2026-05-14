"use client";

import { useTranslations } from "next-intl";
import Icon from "@/components/ui/Icon";

/* ─────────── Mock data ─────────── */

const statCards = [
  {
    key: "dailyActiveUsers",
    value: 1284,
    change: "+12.5%",
    changeUp: true,
    icon: "users" as const,
    bg: "rgba(59, 130, 246, 0.1)",
    fg: "#2563eb",
    border: "rgba(59, 130, 246, 0.2)",
  },
  {
    key: "dailyUploads",
    value: 342,
    change: "+8.2%",
    changeUp: true,
    icon: "tickets" as const,
    bg: "rgba(16, 185, 129, 0.1)",
    fg: "#059669",
    border: "rgba(16, 185, 129, 0.2)",
  },
  {
    key: "dailyBorrows",
    value: 856,
    change: "+15.3%",
    changeUp: true,
    icon: "activity" as const,
    bg: "rgba(139, 92, 246, 0.1)",
    fg: "#7c3aed",
    border: "rgba(139, 92, 246, 0.2)",
  },
  {
    key: "validityRate",
    value: "94.2%",
    change: "-2.1%",
    changeUp: false,
    icon: "check" as const,
    bg: "rgba(34, 197, 94, 0.1)",
    fg: "#16a34a",
    border: "rgba(34, 197, 94, 0.2)",
  },
  {
    key: "availableTickets",
    value: 48,
    change: "--",
    changeUp: null,
    icon: "star" as const,
    bg: "rgba(245, 158, 11, 0.1)",
    fg: "#d97706",
    border: "rgba(245, 158, 11, 0.2)",
  },
  {
    key: "pendingAppeals",
    value: 7,
    change: "+3",
    changeUp: false,
    icon: "alert" as const,
    bg: "rgba(239, 68, 68, 0.1)",
    fg: "#dc2626",
    border: "rgba(239, 68, 68, 0.2)",
  },
];

const statLabels: Record<string, string> = {
  dailyActiveUsers: "Daily Active Users",
  dailyUploads: "Tickets Uploaded Today",
  dailyBorrows: "Today's Borrows",
  validityRate: "Ticket Validity Rate",
  availableTickets: "Available Tickets",
  pendingAppeals: "Pending Appeals",
};

const userGrowthData = [
  35, 55, 40, 70, 60, 85, 75, 90, 65, 80, 72, 88, 95, 78,
];

const transactionData = [
  { upload: 45, borrow: 30 },
  { upload: 52, borrow: 38 },
  { upload: 38, borrow: 25 },
  { upload: 65, borrow: 48 },
  { upload: 58, borrow: 42 },
  { upload: 72, borrow: 55 },
  { upload: 48, borrow: 35 },
];

const efficiencyData = [
  82, 85, 88, 84, 90, 87, 92, 89, 86, 91, 88, 93, 90, 92,
];

const dateLabels14 = [
  "05/02", "05/03", "05/04", "05/05", "05/06", "05/07", "05/08",
  "05/09", "05/10", "05/11", "05/12", "05/13", "05/14", "05/15",
];

const dayLabels7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ─────────── Component ─────────── */

export default function AdminDashboard() {
  const t = useTranslations("admin");

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          {t("dashboard")}
        </h1>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="bg-card rounded-xl p-5 border border-border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div
                className="p-2.5 rounded-lg"
                style={{
                  backgroundColor: card.bg,
                  borderColor: card.border,
                  color: card.fg,
                }}
              >
                <Icon name={card.icon} size={22} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {card.key === "pendingAppeals"
                ? t("pendingAppeals")
                : statLabels[card.key]}
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {card.value}
            </p>
            <p
              className="text-xs mt-1"
              style={{
                color:
                  card.changeUp === null
                    ? undefined
                    : card.changeUp
                      ? "#16a34a"
                      : "#dc2626",
              }}
            >
              {card.change}
            </p>
          </div>
        ))}
      </div>

      {/* ── Chart A: User Growth Trend ── */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-foreground">
            User Growth Trend
          </h3>
          <span className="text-sm font-medium" style={{ color: "#16a34a" }}>
            +18.2% vs last month
          </span>
        </div>
        <div className="h-[200px] flex items-end gap-1.5">
          {userGrowthData.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${h}%`,
                  backgroundColor: "#3b82f6",
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {dateLabels14.filter((_, i) => i % 3 === 0 || i === dateLabels14.length - 1).map((label) => (
            <span key={label} className="text-[10px] text-muted-foreground">
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Chart B: Transaction Volume ── */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Daily Transaction Volume
        </h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#10b981" }} />
            Uploads
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#8b5cf6" }} />
            Borrows
          </div>
        </div>
        <div className="h-[200px] flex items-end gap-2">
          {transactionData.map((day, i) => (
            <div key={i} className="flex-1 flex items-end gap-0.5 h-full">
              <div
                className="flex-1 rounded-t-md transition-all"
                style={{
                  height: `${day.upload}%`,
                  backgroundColor: "#10b981",
                }}
              />
              <div
                className="flex-1 rounded-t-md transition-all"
                style={{
                  height: `${day.borrow}%`,
                  backgroundColor: "#8b5cf6",
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {dayLabels7.map((label) => (
            <span key={label} className="text-[10px] text-muted-foreground">
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Chart C: Ticket Validity Rate ── */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-base font-semibold text-foreground mb-6">
          Ticket Validity Rate Trend
        </h3>
        <div className="relative h-[200px] flex items-end gap-1">
          {efficiencyData.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end h-full">
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${val}%`,
                  background:
                    "linear-gradient(to top, rgba(34,197,94,0.4), rgba(34,197,94,0.05))",
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {dateLabels14.filter((_, i) => i % 3 === 0 || i === dateLabels14.length - 1).map((label) => (
            <span key={label} className="text-[10px] text-muted-foreground">
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Real-time Status ── */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Real-time Status
        </h3>
        <div className="p-4 rounded-lg border mb-5 flex items-center gap-3"
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.05)",
            borderColor: "rgba(34, 197, 94, 0.2)",
          }}
        >
          <span className="h-3 w-3 rounded-full bg-success animate-pulse shrink-0" />
          <span className="text-sm font-medium text-foreground">
            Platform running normally
          </span>
          <span
            className="ml-auto text-xs font-medium px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.15)",
              color: "#16a34a",
            }}
          >
            System Healthy
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "clock" as const, label: "Avg. Response Time", value: "15 min" },
            { icon: "activity" as const, label: "Active Tickets", value: "12" },
            { icon: "dollar" as const, label: "Points Circulating", value: "2,450" },
          ].map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-lg flex items-center gap-3 bg-muted/50"
            >
              <div className="p-2 rounded-lg bg-muted">
                <Icon
                  name={item.icon}
                  size={18}
                  className="text-muted-foreground"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold text-foreground">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
