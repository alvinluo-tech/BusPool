"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Icon from "@/components/ui/Icon";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("buspool_remembered_email");
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
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
    <div className="flex flex-col items-center w-full">
      {/* Logo */}
      <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mb-6">
        <Icon name="bus" size={32} className="text-primary-foreground" />
      </div>

      {/* Title & Subtitle */}
      <h1 className="text-3xl font-bold text-foreground text-center mb-2">{t("loginTitle")}</h1>
      <p className="text-muted-foreground text-center mb-8">{t("loginSubtitle")}</p>

      {/* Form */}
      <form onSubmit={handleLogin} className="w-full space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>
        )}

        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@durham.ac.uk"
          className="h-12"
          leftIcon={<Icon name="mail" size={20} />}
          required
        />

        <Input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("enterPassword")}
          className="h-12"
          leftIcon={<Icon name="shield" size={20} />}
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

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full rounded-xl">
          {t("signInButton")}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 w-full my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-muted-foreground">{t("or")}</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Sign Up Link */}
      <p className="text-sm text-muted-foreground text-center mb-4">
        {t("noAccount")}{" "}
        <Link href="/auth/register" className="text-primary font-medium hover:underline">
          {t("register")}
        </Link>
      </p>

      {/* Demo Credentials Button */}
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full rounded-xl"
        onClick={() => {
          setEmail("demo@durham.ac.uk");
          setPassword("demo123456");
        }}
      >
        {t("demoCredentials")}
      </Button>
    </div>
  );
}
