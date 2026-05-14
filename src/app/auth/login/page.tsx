"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("buspool_remembered_email");
    if (saved) { setEmail(saved); setRememberMe(true); }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!data.session) {
        setError("No session returned. Please check your email for verification.");
        setLoading(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem("buspool_remembered_email", email);
      } else {
        localStorage.removeItem("buspool_remembered_email");
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown login error";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-3xl p-8 shadow-level2 w-full">
      <h1 className="text-2xl font-bold text-foreground mb-1">{t("loginTitle")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("loginSubtitle")}</p>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>
        )}

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

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
            />
            <span className="text-sm text-muted-foreground">{t("rememberMe")}</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <Button type="submit" variant="primary" size="md" loading={loading} className="w-full">
          {t("login")}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        {t("noAccount")}{" "}
        <Link href="/auth/register" className="text-primary font-medium hover:underline">
          {t("register")}
        </Link>
      </p>
    </div>
  );
}
