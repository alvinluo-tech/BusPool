"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/ui/PageHeader";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";

interface UserResult {
  id: string;
  email: string;
  nickname: string;
  points_balance: number;
}

interface RecentLog {
  email: string;
  amount: number;
  reason: string;
  time: string;
}

export default function AdminPointsPage() {
  const t = useTranslations("admin");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<UserResult | null>(null);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);

  const handleSearch = async () => {
    setResult(null);
    setFoundUser(null);
    if (!email) return;

    setSearching(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .select("id, email, nickname, points_balance")
      .eq("email", email)
      .single();

    if (data) {
      setFoundUser(data);
    } else {
      setResult({ type: "error", message: "User not found with this email" });
    }
    setSearching(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!foundUser) {
      setResult({ type: "error", message: "Please search and select a user first" });
      return;
    }

    if (Math.abs(amount) > 1000) {
      setResult({ type: "error", message: "Maximum 1000 points per operation" });
      return;
    }

    if (reason.length < 10) {
      setResult({ type: "error", message: "Reason must be at least 10 characters" });
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const newBalance = foundUser.points_balance + amount;

    if (newBalance < 0) {
      setResult({ type: "error", message: "Insufficient balance" });
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ points_balance: newBalance })
      .eq("id", foundUser.id);

    if (error) {
      setResult({ type: "error", message: error.message });
    } else {
      setResult({
        type: "success",
        message: `${amount > 0 ? "Granted" : "Deducted"} ${Math.abs(amount)} points. New balance: ${newBalance}`,
      });

      // Add to recent logs
      setRecentLogs((prev) => [
        { email: foundUser.email, amount, reason, time: new Date().toLocaleString() },
        ...prev,
      ]);

      setAmount(0);
      setReason("");
      setFoundUser((prev) => prev ? { ...prev, points_balance: newBalance } : null);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={t("points")}
        description="Manually grant or deduct points for users"
      />

      {/* Warning Banner */}
      <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Icon name="alert" size={20} className="text-warning shrink-0 mt-0.5" />
          <div className="text-sm text-foreground space-y-1">
            <p className="font-medium text-warning">Important Notes</p>
            <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
              <li>Maximum 1000 points per single operation</li>
              <li>All operations are irreversible</li>
              <li>A detailed reason (min 10 characters) is required</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Step 1: Search User */}
      <Card className="!p-5 mb-4 rounded-xl" padding={false}>
        <h3 className="text-sm font-semibold text-foreground mb-3">1. Search User</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@durham.ac.uk"
              leftIcon={<Icon name="search" size={16} />}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="md"
            loading={searching}
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>

        {/* User Result */}
        {foundUser && (
          <div className="mt-4 bg-muted/50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{foundUser.nickname}</p>
              <p className="text-xs text-muted-foreground">{foundUser.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Current Balance</p>
              <p className="text-xl font-bold text-foreground">{foundUser.points_balance}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Step 2: Points Operation */}
      <Card className="!p-5 mb-4 rounded-xl" padding={false}>
        <h3 className="text-sm font-semibold text-foreground mb-3">2. Points Operation</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("pointsAmount")}
            </label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-10 h-10 !p-0"
                onClick={() => setAmount(Math.max(-1000, amount - 10))}
              >
                <Icon name="chevron-left" size={16} />
              </Button>
              <Input
                type="number"
                value={String(amount)}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={-1000}
                max={1000}
                className="text-center font-bold text-lg"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-10 h-10 !p-0"
                onClick={() => setAmount(Math.min(1000, amount + 10))}
              >
                <Icon name="chevron-right" size={16} />
              </Button>
            </div>
            {foundUser && (
              <p className="text-xs text-muted-foreground mt-1.5 text-right">
                Balance after: {foundUser.points_balance + amount}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("reason")} <span className="text-xs text-muted-foreground">(min 10 characters)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
              placeholder="Describe the reason for this point adjustment..."
              required
            />
          </div>

          {/* Result Message */}
          {result && (
            <div className={`p-3 rounded-lg text-sm ${
              result.type === "error"
                ? "bg-destructive/10 text-destructive"
                : "bg-success/10 text-success"
            }`}>
              {result.message}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="w-full rounded-xl"
            disabled={!foundUser}
          >
            {t("submit")}
          </Button>
        </form>
      </Card>

      {/* Recent Operations */}
      {recentLogs.length > 0 && (
        <Card className="!p-5 rounded-xl" padding={false}>
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Operations</h3>
          <div className="space-y-3">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${
                      log.amount > 0 ? "text-chart-1" : "text-chart-5"
                    }`}>
                      {log.amount > 0 ? "+" : ""}{log.amount}
                    </span>
                    <span className="text-sm text-foreground truncate">{log.email}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.reason}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-3">{log.time}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
