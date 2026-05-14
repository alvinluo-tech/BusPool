"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import TicketSquarePage from "./(main)/page";
import MainLayout from "./(main)/layout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function HomePage() {
  const t = useTranslations("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <MainLayout>
        <TicketSquarePage />
      </MainLayout>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex flex-col items-center">
      <div className="w-full max-w-md mx-auto flex flex-col items-center px-6 py-12">
        {/* Logo */}
        <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 mb-8">
          <Icon name="bus" size={56} className="text-primary-foreground" />
        </div>

        {/* Title & Tagline */}
        <h1 className="text-5xl font-bold text-foreground mb-3">BusPool</h1>
        <p className="text-xl text-muted-foreground text-center mb-2">{t("tagline")}</p>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-10">
          <Icon name="users" size={16} />
          {t("subtitle")}
        </p>

        {/* Feature Cards */}
        <div className="w-full space-y-4 mb-8">
          <Card className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon name="tickets" size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{t("feature1Title")}</h3>
                <p className="text-sm text-muted-foreground">{t("feature1Desc")}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon name="star" size={20} className="text-primary" filled />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{t("feature2Title")}</h3>
                <p className="text-sm text-muted-foreground">{t("feature2Desc")}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon name="shield" size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{t("feature3Title")}</h3>
                <p className="text-sm text-muted-foreground">{t("feature3Desc")}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Get Started Button */}
        <Link href="/auth/login" className="w-full">
          <Button variant="primary" size="lg" className="w-full rounded-xl">
            {t("getStarted")}
            <Icon name="arrow-right" size={20} />
          </Button>
        </Link>

        {/* Try Demo First Button */}
        <Link href="/auth/login?demo=true" className="w-full mt-3">
          <Button variant="secondary" size="lg" className="w-full rounded-xl">
            {t("demoButton")}
          </Button>
        </Link>

        {/* Trust Indicators */}
        <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-xl w-full mt-10">
          <div className="flex flex-col items-center py-4">
            <span className="text-xl font-bold text-foreground">500+</span>
            <span className="text-xs text-muted-foreground">{t("trustUsers")}</span>
          </div>
          <div className="flex flex-col items-center py-4">
            <span className="text-xl font-bold text-foreground">2000+</span>
            <span className="text-xs text-muted-foreground">{t("trustTickets")}</span>
          </div>
          <div className="flex flex-col items-center py-4">
            <span className="text-xl font-bold text-foreground">&pound;800+</span>
            <span className="text-xs text-muted-foreground">{t("trustSaved")}</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-8">
          {t("agreeTerms")}
        </p>
      </div>
    </main>
  );
}
