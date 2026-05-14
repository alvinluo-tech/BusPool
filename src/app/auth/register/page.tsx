"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.endsWith(".ac.uk")) { setError(t("acEmailRequired")); return; }
    if (password !== confirmPassword) { setError(t("passwordMismatch")); return; }
    if (!agreeTerms) { setError(t("termsRequired")); return; }

    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname },
        emailRedirectTo: `${window.location.origin}/auth/verify`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/auth/verify");
  };

  return (
    <div className="bg-card rounded-3xl p-8 shadow-level2 w-full">
      <h1 className="text-2xl font-bold text-foreground mb-1">{t("registerTitle")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("registerSubtitle")}</p>

      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>
        )}

        <Input
          label={t("nickname")}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Alex Chen"
          required
        />

        <Input
          label={t("email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@durham.ac.uk"
          required
        />

        <Input
          label={t("password")}
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

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
          />
          <span className="text-sm text-muted-foreground">
            {t("agreeTerms")}{" "}
            <Link href="/agreement" className="text-primary hover:underline">
              Terms of Service
            </Link>
          </span>
        </label>

        <Button type="submit" variant="primary" size="md" loading={loading} className="w-full">
          {t("register")}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        {t("hasAccount")}{" "}
        <Link href="/auth/login" className="text-primary font-medium hover:underline">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
