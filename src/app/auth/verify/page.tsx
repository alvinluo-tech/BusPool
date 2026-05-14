"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

export default function VerifyPage() {
  const t = useTranslations("auth");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (user?.email) {
      await supabase.auth.resend({
        type: "signup",
        email: user.email,
      });
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="bg-card rounded-3xl p-8 shadow-level2 w-full">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="mail" size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {t("verifyTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("verifySubtitle")}
        </p>
      </div>

      {sent && (
        <div className="bg-success/10 text-success text-sm p-3 rounded-lg text-center mb-4">
          {t("resendSuccess")}
        </div>
      )}

      <Button
        variant="secondary"
        size="md"
        className="w-full mb-4"
        onClick={handleResend}
        disabled={loading || sent}
        loading={loading}
      >
        {sent ? t("emailSent") : t("resendEmail")}
      </Button>

      <Link
        href="/auth/login"
        className="block text-center text-sm text-primary hover:underline font-medium"
      >
        {t("backToLogin")}
      </Link>
    </div>
  );
}
