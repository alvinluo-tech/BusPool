"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Icon from "@/components/ui/Icon";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t("passwordMinLength"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

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
    <div className="flex flex-col items-center w-full">
      {/* Icon Container */}
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
        <Icon name="shield" size={32} className="text-primary" />
      </div>

      {/* Title & Description */}
      <h1 className="text-3xl font-bold text-foreground text-center mb-2">{t("setNewPassword")}</h1>
      <p className="text-muted-foreground text-center mb-8">{t("setNewPasswordSubtitle")}</p>

      {/* Form */}
      <form onSubmit={handleUpdate} className="w-full space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>
        )}

        <Input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="h-12"
          leftIcon={<Icon name="shield" size={20} />}
          helperText={t("passwordMinLength")}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm text-primary font-medium hover:underline"
              tabIndex={-1}
            >
              {showPassword ? t("hidePassword") : t("showPassword")}
            </button>
          }
          required
        />

        <Input
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="h-12"
          leftIcon={<Icon name="shield" size={20} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-sm text-primary font-medium hover:underline"
              tabIndex={-1}
            >
              {showConfirmPassword ? t("hidePassword") : t("showPassword")}
            </button>
          }
          required
        />

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full rounded-xl">
          {t("resetPassword")}
        </Button>
      </form>

      {/* Security Tip Card */}
      <div className="bg-muted/50 rounded-2xl p-4 w-full mt-6">
        <div className="flex items-start gap-3">
          <Icon name="info" size={20} className="text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">{t("securityTip")}</p>
        </div>
      </div>
    </div>
  );
}
