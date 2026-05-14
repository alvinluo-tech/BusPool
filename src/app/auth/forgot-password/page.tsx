"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.endsWith(".ac.uk")) {
      setError(t("acEmailRequired"));
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="bg-card rounded-3xl p-8 shadow-level2 w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {t("resetPassword")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("resetPasswordSubtitle")}
        </p>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="bg-success/10 text-success text-sm p-3 rounded-lg text-center">
            {t("resetPasswordSuccess")}
          </div>
          <Link href="/auth/login">
            <Button variant="primary" size="md" className="w-full">
              {t("backToLogin")}
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label={t("email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@durham.ac.uk"
            required
          />

          <Button type="submit" variant="primary" size="md" loading={loading} className="w-full">
            {t("resetPassword")}
          </Button>

          <Link
            href="/auth/login"
            className="block text-center text-sm text-primary hover:underline font-medium"
          >
            {t("backToLogin")}
          </Link>
        </form>
      )}
    </div>
  );
}
