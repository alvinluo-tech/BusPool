"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/ui/PageHeader";

interface Stats {
  totalUsers: number;
  totalTickets: number;
  activeTickets: number;
  pendingAppeals: number;
}

const statCards = [
  { key: "totalUsers", icon: "users" as const, valueKey: "totalUsers" as const, chartColor: "bg-chart-3" },
  { key: "totalTickets", icon: "tickets" as const, valueKey: "totalTickets" as const, chartColor: "bg-chart-1" },
  { key: "activeTickets", icon: "activity" as const, valueKey: "activeTickets" as const, chartColor: "bg-chart-4" },
  { key: "pendingAppeals", icon: "alert" as const, valueKey: "pendingAppeals" as const, chartColor: "bg-chart-5" },
];

const chartBars = [35, 55, 40, 70, 60, 85, 75, 90, 65, 80, 72, 95];

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTickets: 0,
    activeTickets: 0,
    pendingAppeals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchStats = async () => {
      const [
        { count: userCount },
        { count: ticketCount },
        { count: activeCount },
        { count: appealCount },
      ] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("tickets").select("id", { count: "exact", head: true }),
        supabase.from("tickets").select("id", { count: "exact", head: true }).eq("status", "available"),
        supabase.from("appeals").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      setStats({
        totalUsers: userCount ?? 0,
        totalTickets: ticketCount ?? 0,
        activeTickets: activeCount ?? 0,
        pendingAppeals: appealCount ?? 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const statValues = [stats.totalUsers, stats.totalTickets, stats.activeTickets, stats.pendingAppeals];

  return (
    <div>
      <PageHeader title={t("dashboard")} description="Platform overview and key metrics" />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, i) => (
              <Card key={card.key} className="!p-6 rounded-xl" padding={false}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 ${card.chartColor} rounded-xl flex items-center justify-center`}>
                    <Icon name={card.icon} size={22} className="text-white" />
                  </div>
                  <span className="text-sm text-muted-foreground">{t(card.key)}</span>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-foreground leading-none">
                  {statValues[i]}
                </p>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Trend (Area Chart placeholder) */}
            <Card className="!p-6 rounded-xl" padding={false}>
              <h3 className="text-base font-semibold text-foreground mb-1">User Growth Trend</h3>
              <p className="text-xs text-muted-foreground mb-6">Monthly active users over the past year</p>
              <div className="h-48 flex items-end gap-1.5">
                {chartBars.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-chart-3/60 to-chart-3/20 rounded-t-md"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">Jan</span>
                <span className="text-[10px] text-muted-foreground">Dec</span>
              </div>
            </Card>

            {/* Transaction Volume (Bar Chart placeholder) */}
            <Card className="!p-6 rounded-xl" padding={false}>
              <h3 className="text-base font-semibold text-foreground mb-1">Transaction Volume</h3>
              <p className="text-xs text-muted-foreground mb-6">Daily borrow transactions this month</p>
              <div className="h-48 flex items-end gap-1.5">
                {chartBars.slice(0, 14).map((h, i) => (
                  <div key={i} className="flex-1 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-chart-2/60 to-chart-2/20 rounded-t-md"
                      style={{ height: `${h * 0.7}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">Week 1</span>
                <span className="text-[10px] text-muted-foreground">Week 4</span>
              </div>
            </Card>

            {/* Efficiency Rate (Line Chart placeholder) */}
            <Card className="!p-6 rounded-xl" padding={false}>
              <h3 className="text-base font-semibold text-foreground mb-1">Success Rate</h3>
              <p className="text-xs text-muted-foreground mb-6">Ticket validation success rate over time</p>
              <div className="h-48 flex items-end gap-1.5">
                {chartBars.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end">
                    <div
                      className="w-1.5 rounded-full bg-gradient-to-t from-chart-1 to-chart-1/60"
                      style={{ height: `${h * 0.5 + 40}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">Jan</span>
                <span className="text-[10px] text-muted-foreground">Dec</span>
              </div>
            </Card>

            {/* Quick Stats Summary */}
            <Card className="!p-6 rounded-xl" padding={false}>
              <h3 className="text-base font-semibold text-foreground mb-1">Platform Summary</h3>
              <p className="text-xs text-muted-foreground mb-6">Key metrics at a glance</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Total Users</span>
                  <span className="text-lg font-bold text-foreground">{stats.totalUsers}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Total Tickets</span>
                  <span className="text-lg font-bold text-foreground">{stats.totalTickets}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Active Tickets</span>
                  <span className="text-lg font-bold text-chart-1">{stats.activeTickets}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Pending Appeals</span>
                  <span className="text-lg font-bold text-chart-5">{stats.pendingAppeals}</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
