"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/ui/PageHeader";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function AdminPointsPage() {
  const t = useTranslations("admin");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (Math.abs(amount) > 1000) {
      setResult({ type: "error", message: "Max 1000 points per operation" });
      return;
    }

    if (reason.length < 10) {
      setResult({ type: "error", message: "Reason must be at least 10 characters" });
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { data: user } = await supabase
      .from("users")
      .select("id, points_balance")
      .eq("email", email)
      .single();

    if (!user) {
      setResult({ type: "error", message: "User not found" });
      setLoading(false);
      return;
    }

    const newBalance = user.points_balance + amount;
    if (newBalance < 0) {
      setResult({ type: "error", message: "Insufficient balance" });
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ points_balance: newBalance })
      .eq("id", user.id);

    if (error) {
      setResult({ type: "error", message: error.message });
    } else {
      setResult({
        type: "success",
        message: `${amount > 0 ? "Granted" : "Deducted"} ${Math.abs(amount)} points. New balance: ${newBalance}`,
      });
      setEmail("");
      setAmount(0);
      setReason("");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md">
      <PageHeader title={t("points")} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="p-5 space-y-4">
          <Input
            label="User Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@durham.ac.uk"
            required
          />

          <Input
            label={t("pointsAmount")}
            type="number"
            value={String(amount)}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={-1000}
            max={1000}
            required
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("reason")}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-muted border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              required
            />
          </div>
        </Card>

        {result && (
          <div className={`p-3 rounded-lg text-sm ${
            result.type === "error"
              ? "bg-destructive/10 text-destructive"
              : "bg-success/10 text-success"
          }`}>
            {result.message}
          </div>
        )}

        <Button type="submit" variant="primary" size="md" loading={loading} className="w-full">
          {t("submit")}
        </Button>
      </form>
    </div>
  );
}
