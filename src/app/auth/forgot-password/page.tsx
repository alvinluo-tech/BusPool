"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Icon from "@/components/ui/Icon";

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
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center w-full">
        {/* Check Icon */}
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
          <Icon name="check" size={40} className="text-success" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">{t("checkEmail")}</h1>
        <p className="text-muted-foreground text-center mb-1">{t("emailSentTo")}</p>
        <p className="text-primary font-semibold text-center mb-6">{email}</p>

        {/* Info Card */}
        <div className="bg-muted/50 rounded-2xl p-4 w-full mb-6">
          <div className="flex items-start gap-3">
            <Icon name="info" size={20} className="text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                {t("didntReceive")} {t("checkSpam")}
              </p>
            </div>
          </div>
        </div>

        {/* Back to Sign In */}
        <Link href="/auth/login" className="w-full">
          <Button variant="primary" size="lg" className="w-full rounded-xl">
            {t("backToLogin")}
          </Button>
        </Link>

        {/* Try Different Email */}
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full rounded-xl mt-3"
          onClick={() => setSuccess(false)}
        >
          {t("tryDifferentEmail")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Icon Container */}
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
        <Icon name="mail" size={32} className="text-primary" />
      </div>

      {/* Title & Description */}
      <h1 className="text-3xl font-bold text-foreground text-center mb-2">{t("forgotPasswordTitle")}</h1>
      <p className="text-muted-foreground text-center mb-8">{t("forgotPasswordSubtitle")}</p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@durham.ac.uk"
          className="h-12"
          leftIcon={<Icon name="mail" size={20} />}
          helperText={t("acEmailRequired")}
          required
        />

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full rounded-xl">
          {t("sendResetLink")}
        </Button>

        <Link
          href="/auth/login"
          className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
        >
          {t("rememberPassword")}{" "}
          <span className="text-primary font-medium hover:underline">{t("signIn")}</span>
        </Link>
      </form>
    </div>
  );
}
