"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { groupByDate, formatTime } from "@/lib/utils";
import type { PointRecord } from "@/types";

const typeConfig: Record<string, { icon: IconName; color: string; bgClass: string; labelKey: string }> = {
  welcome_bonus: { icon: "gift", color: "text-emerald-500", bgClass: "bg-emerald-500/10", labelKey: "welcomeBonusDesc" },
  admin_adjustment: { icon: "shield", color: "text-blue-500", bgClass: "bg-blue-500/10", labelKey: "adminAdjustmentDesc" },
  upload_reward: { icon: "star", color: "text-amber-500", bgClass: "bg-amber-500/10", labelKey: "uploadRewardDesc" },
  borrow_cost: { icon: "arrow-down", color: "text-orange-500", bgClass: "bg-orange-500/10", labelKey: "borrowCostDesc" },
  refund: { icon: "rotate-ccw", color: "text-purple-500", bgClass: "bg-purple-500/10", labelKey: "refundDesc" },
  appeal_reward: { icon: "check-circle", color: "text-teal-500", bgClass: "bg-teal-500/10", labelKey: "appealRewardDesc" },
};

export default function WalletPage() {
  const t = useTranslations("wallet");
  const tCommon = useTranslations("common");
  const [balance, setBalance] = useState(0);
  const [records, setRecords] = useState<PointRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  useEffect(() => {
    const supabase = createClient();
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("points_balance")
        .eq("id", user.id)
        .single();
      setBalance(profile?.points_balance ?? 0);

      const { data: pointRecords } = await supabase
        .from("point_records")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setRecords((pointRecords || []) as PointRecord[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalIncome = records
    .filter((r) => r.amount > 0)
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpense = records
    .filter((r) => r.amount < 0)
    .reduce((sum, r) => sum + Math.abs(r.amount), 0);

  const filtered = records.filter((r) => {
    if (filter === "income") return r.amount > 0;
    if (filter === "expense") return r.amount < 0;
    return true;
  });

  const groups = groupByDate(filtered);

  function getDescription(record: PointRecord): string {
    if (record.description) return record.description;
    const cfg = typeConfig[record.type];
    return cfg ? t(cfg.labelKey) : record.type;
  }

  return (
    <div>
      {/* Balance Header */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">{t("balance")}</p>
        <p className="text-[48px] font-bold text-foreground leading-tight mt-1">{balance}</p>
      </div>

      {/* Income / Expense Cards */}
      <div className="flex gap-3 mb-6">
        <Card variant="stats" className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
              <Icon name="arrow-up-right" size={16} className="text-success" />
            </div>
            <span className="text-xs text-muted-foreground">{t("income")}</span>
          </div>
          <p className="text-[32px] font-bold text-foreground">+{totalIncome}</p>
        </Card>
        <Card variant="stats" className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center">
              <Icon name="arrow-down-left" size={16} className="text-destructive" />
            </div>
            <span className="text-xs text-muted-foreground">{t("expense")}</span>
          </div>
          <p className="text-[32px] font-bold text-destructive">-{totalExpense}</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "income", "expense"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? tCommon("all") : f === "income" ? t("income") : t("expense")}
          </button>
        ))}
      </div>

      {/* Point Records */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Icon name="wallet" size={32} />}
          title={t("empty")}
        />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.items.map((record) => {
                  const isIncome = record.amount > 0;
                  const cfg = typeConfig[record.type] || { icon: "info" as IconName, color: "text-muted-foreground", bgClass: "bg-muted", labelKey: "" };
                  const description = getDescription(record);

                  return (
                    <Card key={record.id} className="p-4 flex items-center gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cfg.bgClass}`}>
                        <Icon name={cfg.icon} size={18} className={cfg.color} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {description}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatTime(record.created_at)}</p>
                      </div>

                      {/* Points */}
                      <span className={`font-bold text-sm ${isIncome ? "text-success" : "text-destructive"}`}>
                        {isIncome ? "+" : ""}{record.amount}
                      </span>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
