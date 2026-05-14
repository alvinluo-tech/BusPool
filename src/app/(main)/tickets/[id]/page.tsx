"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { TicketWithUploader } from "@/types";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function TicketDetailPage() {
  const t = useTranslations("ticket");
  const tCommon = useTranslations("common");
  const tHome = useTranslations("home");
  const tProfile = useTranslations("profile");
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<TicketWithUploader | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const fetchData = async () => {
      const { data } = await supabase
        .from("tickets")
        .select(
          "*, uploader:users!tickets_uploader_id_fkey(nickname, avatar_url, reputation, successful_uses, total_uploads)"
        )
        .eq("id", ticketId)
        .single();
      setTicket(data as TicketWithUploader);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("points_balance")
          .eq("id", user.id)
          .single();
        if (profile) setUserPoints(profile.points_balance);
      }

      setLoading(false);
    };
    fetchData();
  }, [ticketId]);

  const handleBorrow = async () => {
    const supabase = createClient();
    setBorrowing(true);
    setError("");

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      router.push("/auth/login");
      return;
    }

    const { data, error: rpcError } = await supabase.rpc("borrow_ticket", {
      p_ticket_id: ticketId,
    });

    if (rpcError) {
      setError(rpcError.message);
      setBorrowing(false);
      setShowConfirm(false);
      return;
    }

    setTicket((prev) =>
      prev
        ? { ...prev, status: "in_use", barcode_image_url: data.barcode_image_url }
        : prev
    );
    setShowConfirm(false);
    setBorrowing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        {tCommon("error")}
      </div>
    );
  }

  const isActive = ticket.status === "in_use";
  const isAvailable = ticket.status === "available";

  const getTimeRemaining = (
    expiresAt: string
  ): { display: string; isUrgent: boolean } | null => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    if (diffMs <= 0) return null;
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const display = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    return { display, isUrgent: totalMinutes < 60 };
  };

  const getReputationLevel = (score: number): string => {
    if (score >= 80) return "excellent";
    if (score >= 50) return "good";
    if (score >= 30) return "fair";
    return "restricted";
  };

  const getReputationLevelLabel = (score: number): string => {
    const level = getReputationLevel(score);
    const key = `reputation${level.charAt(0).toUpperCase()}${level.slice(
      1
    )}` as "reputationExcellent" | "reputationGood" | "reputationFair" | "reputationRestricted";
    return tProfile(key);
  };

  const calcSuccessRate = (successful: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((successful / total) * 100);
  };

  const timeRemaining = getTimeRemaining(ticket.expires_at);

  return (
    <>
      <div className={`space-y-4 ${isAvailable ? "pb-16" : ""}`}>
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <Icon name="chevron-left" size={20} className="text-foreground" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">{t("detail")}</h1>
        </div>

        {/* Wallet Card with Stack Effect */}
        <div className="relative">
          {/* Stack card behind */}
          <div className="absolute -bottom-2 left-2 right-2 h-full rounded-3xl bg-primary/30 -z-10" />

          {/* Main wallet card */}
          <div className="rounded-3xl shadow-lg overflow-hidden bg-primary text-white p-5 relative">
            {/* Top section */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-white/80">
                {tCommon("appName")}
              </span>
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                {ticket.ticket_type === "dayrider"
                  ? t("ticketCardDayrider")
                  : t("daysaver")}
              </span>
            </div>

            {/* Zone */}
            <p className="text-sm text-white/70 mb-4">
              {ticket.zone || t("ticketCardDurham")}
            </p>

            {/* Barcode preview area */}
            <div className="bg-white/10 rounded-2xl h-32 flex items-center justify-center mb-4 overflow-hidden">
              {isActive && ticket.barcode_image_url ? (
                <img
                  src={ticket.barcode_image_url}
                  alt="Ticket barcode"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon name="tickets" size={32} className="text-white/60" />
                  </div>
                  {isAvailable && (
                    <p className="text-xs text-white/60">
                      {t("unlockBarcode")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Grid: Purchased | Valid until */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-white/60">{t("purchased")}</p>
                <p className="text-sm font-semibold">
                  {ticket.purchase_time
                    ? new Date(ticket.purchase_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : t("purchaseTimeUnknown")}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/60">{t("validUntil")}</p>
                <p className="text-sm font-semibold">
                  {new Date(ticket.expires_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Time remaining warning bar */}
            {timeRemaining && (
              <div
                className={`rounded-xl p-3 flex items-center gap-2 ${
                  timeRemaining.isUrgent
                    ? "bg-warning/20"
                    : "bg-white/15"
                }`}
              >
                <Icon
                  name="clock"
                  size={16}
                  className="text-white shrink-0"
                />
                <span className="text-xs font-medium text-white">
                  {t("remaining", { time: timeRemaining.display })} &mdash;{" "}
                  {t("beforeExpires")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Uploader Card */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-level1">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">
            {t("sharedBy")}
          </h3>

          <div className="flex items-center gap-3 mb-4">
            <Avatar
              size="lg"
              src={ticket.uploader?.avatar_url}
              name={ticket.uploader?.nickname ?? ""}
            />
            <div>
              <p className="font-semibold text-foreground">
                {ticket.uploader?.nickname}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Icon
                  name="star"
                  size={14}
                  className="text-warning"
                  filled
                />
                <span className="text-sm font-medium text-foreground">
                  {ticket.uploader?.reputation}
                </span>
                <span className="text-xs text-muted-foreground">
                  {ticket.uploader
                    ? getReputationLevelLabel(ticket.uploader.reputation)
                    : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">
                {ticket.uploader
                  ? calcSuccessRate(
                      ticket.uploader.successful_uses,
                      ticket.uploader.total_uploads
                    )
                  : 0}
                %
              </p>
              <p className="text-xs text-muted-foreground">
                {t("successRate")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">
                {ticket.uploader?.total_uploads ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("totalUploads")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">--</p>
              <p className="text-xs text-muted-foreground">
                {t("borrowedCount")}
              </p>
            </div>
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="bg-muted/50 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Icon
              name="shield"
              size={20}
              className="text-primary shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">
                {t("communityGuidelines")}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("communityGuidelinesText")}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
            {error}
          </div>
        )}
      </div>

      {/* Bottom CTA Bar */}
      {isAvailable && (
        <div className="fixed bottom-20 left-0 right-0 bg-card border-t border-border z-40 shadow-level2">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("youPay")}:{" "}
                  <span className="font-semibold text-foreground">
                    5 {tHome("points")}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("yourBalance")}:{" "}
                  <span className="font-medium text-foreground">
                    {userPoints}
                  </span>
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                className="h-12 rounded-xl px-8"
                onClick={() => setShowConfirm(true)}
              >
                {t("borrowButton")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <Dialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        size="sm"
      >
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground mb-2">
            {t("confirmBorrow")}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t("borrowCost")}: {t("costPoints")}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={() => setShowConfirm(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              loading={borrowing}
              onClick={handleBorrow}
            >
              {t("confirmBorrow")}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
