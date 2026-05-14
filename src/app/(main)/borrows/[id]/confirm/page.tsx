"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import type { Transaction, Ticket, FailureReason } from "@/types";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface TxWithTicket extends Transaction {
  ticket: Ticket;
}

interface ReasonOption {
  key: string;
  failureReason: FailureReason;
  hasNote?: boolean;
}

export default function ConfirmResultPage() {
  const t = useTranslations("confirm");
  const tCommon = useTranslations("common");
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;

  const [transaction, setTransaction] = useState<TxWithTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"valid" | "invalid" | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [showReasons, setShowReasons] = useState(false);

  const reasonOptions: ReasonOption[] = [
    { key: "expired", failureReason: "expired" },
    { key: "already_scanned", failureReason: "already_scanned", hasNote: true },
    { key: "not_recognized", failureReason: "unknown" },
    { key: "other", failureReason: "unknown" },
  ];

  useEffect(() => {
    const supabase = createClient();
    const fetchTransaction = async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*, ticket:tickets(*)")
        .eq("id", transactionId)
        .single();
      setTransaction(data as TxWithTicket);
      setLoading(false);
    };
    fetchTransaction();
  }, [transactionId]);

  const handleConfirm = async (isValid: boolean, failureReason?: string) => {
    const supabase = createClient();
    setSubmitting(true);

    const { error } = await supabase.rpc("confirm_result", {
      p_transaction_id: transactionId,
      p_is_valid: isValid,
      p_failure_reason: failureReason || null,
    });

    if (error) {
      console.error(error);
      setSubmitting(false);
      return;
    }

    setResult(isValid ? "valid" : "invalid");
    setSubmitting(false);
  };

  const handleSelectWorked = () => {
    handleConfirm(true);
  };

  const handleSelectDidntWork = () => {
    setShowReasons(true);
  };

  const handleSubmitReport = () => {
    if (!selectedReason) return;
    const option = reasonOptions.find((r) => r.key === selectedReason);
    handleConfirm(false, option?.failureReason ?? "unknown");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        {tCommon("error")}
      </div>
    );
  }

  /* ---- Success / Result State ---- */
  if (result) {
    return (
      <div className="text-center py-16">
        <div
          className={`w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center ${
            result === "valid" ? "bg-success/10" : "bg-destructive/10"
          }`}
        >
          <Icon
            name={result === "valid" ? "check" : "x"}
            size={36}
            className={result === "valid" ? "text-success" : "text-destructive"}
            strokeWidth={2.5}
          />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          {t("submitSuccess")}
        </h2>
        <p className="text-muted-foreground mb-8">
          {result === "valid"
            ? t("pointsEarned", { points: 5 })
            : t("pointsRefunded")}
        </p>
        <Button
          variant="primary"
          size="lg"
          className="w-full max-w-xs"
          onClick={() => router.push("/borrows")}
        >
          {tCommon("back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-xl font-bold text-foreground">{t("title")}</h1>

      {/* Question Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("didItWork")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("pleaseConfirm")}</p>
      </div>

      {/* QR Code Display */}
      <div className="bg-card rounded-2xl border border-border shadow-level1 p-6">
        <div className="w-full bg-muted rounded-xl flex flex-col items-center py-6">
          {transaction.ticket?.qr_code_data ? (
            <QRCodeSVG
              value={transaction.ticket.qr_code_data}
              size={180}
              level="H"
              includeMargin
            />
          ) : (
            <span className="text-muted-foreground">{tCommon("error")}</span>
          )}
        </div>
      </div>

      {/* Quick Action Grid */}
      {!showReasons && (
        <div className="grid grid-cols-2 gap-4">
          {/* It Worked */}
          <button
            onClick={handleSelectWorked}
            disabled={submitting}
            className="bg-success/10 border-2 border-success/20 rounded-3xl aspect-square flex flex-col items-center justify-center gap-3 p-6 transition-all hover:bg-success/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center">
              <Icon name="check" size={32} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-lg font-bold text-foreground">
              {t("itWorked")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("iWasAble")}
            </span>
          </button>

          {/* Didn't Work */}
          <button
            onClick={handleSelectDidntWork}
            disabled={submitting}
            className="bg-destructive/10 border-2 border-destructive/20 rounded-3xl aspect-square flex flex-col items-center justify-center gap-3 p-6 transition-all hover:bg-destructive/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center">
              <Icon name="x" size={32} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-lg font-bold text-foreground">
              {t("didntWork")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("iCouldnt")}
            </span>
          </button>
        </div>
      )}

      {/* Failure Reasons (shown after "Didn't Work" is tapped) */}
      {showReasons && (
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-foreground mb-3">
              {t("whyNotWork")}
            </p>
            <div className="space-y-2">
              {reasonOptions.map((option) => {
                const i18nKey =
                  option.key === "expired"
                    ? "reasonExpired"
                    : option.key === "already_scanned"
                      ? "reasonAlreadyScanned"
                      : option.key === "not_recognized"
                        ? "reasonNotRecognized"
                        : "reasonOther";
                return (
                  <button
                    key={option.key}
                    onClick={() => setSelectedReason(option.key)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedReason === option.key
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {t(i18nKey as any)}
                      </span>
                      {selectedReason === option.key && (
                        <Icon
                          name="check"
                          size={18}
                          className="text-primary shrink-0"
                        />
                      )}
                    </div>
                    {option.hasNote && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {t("reasonAlreadyScannedNote")}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Serious Violation Warning */}
          {selectedReason === "already_scanned" && (
            <div className="bg-warning/10 border border-warning/20 rounded-2xl p-3">
              <div className="flex items-start gap-2">
                <Icon
                  name="alert"
                  size={18}
                  className="text-warning shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t("seriousViolation")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("seriousViolationNote")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Report Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full h-12 rounded-xl"
            disabled={!selectedReason}
            loading={submitting}
            onClick={handleSubmitReport}
          >
            {t("submitReport")}
          </Button>
        </div>
      )}
    </div>
  );
}
