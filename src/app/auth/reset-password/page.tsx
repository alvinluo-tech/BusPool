"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) { setError(t("passwordMinLength")); return; }
    if (password !== confirmPassword) { setError(t("passwordMismatch")); return; }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/auth/login?message=passwordUpdated");
  };

  return (
    <div className="bg-card rounded-3xl p-8 shadow-level2 w-full">
      <h1 className="text-2xl font-bold text-foreground mb-1">{t("updatePassword")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("newPassword")}</p>

      <form onSubmit={handleUpdate} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>
        )}

        <Input
          label={t("newPassword")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <Input
          label={t("confirmPassword")}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <Button type="submit" variant="primary" size="md" loading={loading} className="w-full">
          {loading ? "..." : t("updatePassword")}
        </Button>
      </form>
    </div>
  );
}
