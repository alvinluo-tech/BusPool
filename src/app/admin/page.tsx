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

const statConfig = [
  { key: "totalUsers", icon: "users" as const, color: "bg-chart-3" },
  { key: "totalTickets", icon: "tickets" as const, color: "bg-chart-1" },
  { key: "activeTickets", icon: "tickets" as const, color: "bg-chart-4" },
  { key: "pendingAppeals", icon: "alert" as const, color: "bg-chart-5" },
];

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

  const statValues = [
    stats.totalUsers,
    stats.totalTickets,
    stats.activeTickets,
    stats.pendingAppeals,
  ];

  return (
    <div>
      <PageHeader title={t("dashboard")} />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statConfig.map((config, i) => (
            <Card key={config.key} variant="stats">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${config.color} rounded-full flex items-center justify-center`}>
                  <Icon name={config.icon} size={20} className="text-white" />
                </div>
                <span className="text-sm text-muted-foreground">{t(config.key)}</span>
              </div>
              <p className="text-[48px] font-bold text-foreground leading-none">
                {statValues[i]}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
