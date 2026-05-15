"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface UserResult {
  id: string;
  email: string;
  nickname: string;
  points_balance: number;
}

interface RecentOperation {
  nickname: string;
  email: string;
  amount: number;
  reason: string;
  admin: string;
  time: string;
}

const initialMockLogs: RecentOperation[] = [
  { nickname: "Alice Johnson", email: "alice.johnson@durham.ac.uk", amount: 50, reason: "Compensation for invalid ticket upload on 2026-05-14", admin: "admin@buspool.app", time: "2026-05-14T14:30:00Z" },
  { nickname: "Charlie Brown", email: "charlie.brown@durham.ac.uk", amount: -20, reason: "Penalty for uploading already-scanned ticket", admin: "admin@buspool.app", time: "2026-05-14T10:15:00Z" },
  { nickname: "Diana Prince", email: "diana.p@durham.ac.uk", amount: 100, reason: "Welcome bonus adjustment for new user promotion", admin: "admin@buspool.app", time: "2026-05-13T09:00:00Z" },
];

export default function AdminPointsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  const [email, setEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<UserResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [recentOps, setRecentOps] = useState<RecentOperation[]>(initialMockLogs);

  const handleSearch = async () => {
    setResult(null);
    setFoundUser(null);
    setSearchError(null);
    if (!email.trim()) return;

    setSearching(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .select("id, email, nickname, points_balance")
      .eq("email", email.trim())
      .single();

    if (data) {
      setFoundUser(data);
    } else {
      setSearchError(t("userNotFound"));
    }
    setSearching(false);
  };

  const canSubmit = foundUser !== null && Math.abs(amount) <= 1000 && reason.length >= 10;
  const newBalance = foundUser ? foundUser.points_balance + amount : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!foundUser) return;
    if (Math.abs(amount) > 1000) { setResult({ type: "error", message: t("maxPointsError") }); return; }
    if (reason.length < 10) { setResult({ type: "error", message: t("reasonMinError") }); return; }
    if (newBalance < 0) { setResult({ type: "error", message: t("insufficientBalance") }); return; }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ points_balance: newBalance })
      .eq("id", foundUser.id);

    if (error) {
      setResult({ type: "error", message: error.message });
    } else {
      const msgKey = amount > 0 ? "pointsGranted" : "pointsDeducted";
      setResult({
        type: "success",
        message: t(msgKey, { amount: Math.abs(amount), balance: newBalance }),
      });

      setRecentOps((prev) => [
        { nickname: foundUser.nickname, email: foundUser.email, amount, reason, admin: "admin@buspool.app", time: new Date().toISOString() },
        ...prev,
      ]);

      setAmount(0);
      setReason("");
      setFoundUser((prev) => (prev ? { ...prev, points_balance: newBalance } : null));
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("points")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("grantOrDeduct")}</p>
      </div>

      <div className="p-4 rounded-xl" style={{ border: "1px solid rgba(250, 204, 21, 0.2)", background: "rgba(250, 204, 21, 0.05)" }}>
        <div className="flex items-start gap-3">
          <Icon name="alert" size={20} className="text-warning shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-medium text-warning">{t("importantNotes")}</p>
            <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
              <li>{t("maxPointsNote")}</li>
              <li>{t("irreversibleNote")}</li>
              <li>{t("reasonRequiredNote")}</li>
              <li>{t("positiveNegativeNote")}</li>
            </ul>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">{t("searchUser")}</h3>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={t("pointsPlaceholder")}
              className="w-full h-10 pl-10 pr-4 bg-bg border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <Button type="button" variant="secondary" size="md" loading={searching} onClick={handleSearch}>
            {tCommon("search")}
          </Button>
        </div>

        {searchError && <p className="mt-2 text-xs text-destructive">{searchError}</p>}

        {foundUser && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{foundUser.nickname}</p>
              <p className="text-xs text-muted-foreground">{foundUser.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t("currentBalance")}</p>
              <p className="text-xl font-bold text-foreground">{foundUser.points_balance}</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">{t("pointsOperation")}</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("pointsAmount")}</label>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="sm" className="w-10 h-10 !p-0 shrink-0" onClick={() => setAmount(Math.max(-1000, amount - 5))}>
                <Icon name="chevron-left" size={16} />
              </Button>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={-1000} max={1000}
                className="flex-1 h-10 px-3 text-center font-bold text-lg bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <Button type="button" variant="outline" size="sm" className="w-10 h-10 !p-0 shrink-0" onClick={() => setAmount(Math.min(1000, amount + 5))}>
                <Icon name="chevron-right" size={16} />
              </Button>
            </div>

            <div className="flex gap-2 mt-2">
              {[-50, -10, -5, 5, 10, 50].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(Math.min(1000, Math.max(-1000, v)))}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    amount === v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {v > 0 ? "+" : ""}{v}
                </button>
              ))}
            </div>

            {foundUser && (
              <p className="text-xs text-muted-foreground mt-1.5 text-right">
                {t("balanceAfter")}{" "}
                <span className={newBalance < 0 ? "text-destructive font-medium" : "text-foreground font-medium"}>{newBalance}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("reason")} <span className="text-xs text-muted-foreground">(min 10 characters)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
              placeholder={t("adjustReasonPlaceholder")}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{reason.length} / 10</p>
          </div>

          {result && (
            <div className={`p-3 rounded-lg text-sm ${result.type === "error" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
              {result.message}
            </div>
          )}

          <Button type="submit" variant="primary" size="md" loading={submitting} className="w-full rounded-xl" disabled={!canSubmit}>
            {submitting ? t("processing") : t("submit")}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">{t("recentOperations")}</h3>
        {recentOps.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">{t("noRecentOps")}</p>
        ) : (
          <div className="space-y-3">
            {recentOps.map((op, i) => (
              <div key={i} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${op.amount > 0 ? "text-success" : "text-destructive"}`}>
                      {op.amount > 0 ? "+" : ""}{op.amount}
                    </span>
                    <span className="text-sm text-foreground truncate">{op.nickname}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline truncate">{op.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">{op.reason}</span>
                    <span className="text-xs text-muted-foreground shrink-0">by {op.admin}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-3">{new Date(op.time).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
