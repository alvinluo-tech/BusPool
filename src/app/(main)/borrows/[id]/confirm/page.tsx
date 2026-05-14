"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TransactionWithTicket } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Icon from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ConfirmResultPage() {
  const t = useTranslations("confirm");
  const tCommon = useTranslations("common");
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;

  const [transaction, setTransaction] = useState<TransactionWithTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAlreadyScanned, setShowAlreadyScanned] = useState(false);
  const [result, setResult] = useState<"valid" | "invalid" | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const fetchTransaction = async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*, ticket:tickets(*)")
        .eq("id", transactionId)
        .single();
      setTransaction(data as TransactionWithTicket);
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

    if (error) { console.error(error); setSubmitting(false); return; }

    setResult(isValid ? "valid" : "invalid");
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!transaction) {
    return <div className="text-center py-16 text-muted-foreground">{tCommon("error")}</div>;
  }

  if (result) {
    return (
      <div className="text-center py-16">
        <div
          className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            result === "valid" ? "bg-success/10" : "bg-destructive/10"
          }`}
        >
          <Icon
            name={result === "valid" ? "check" : "x"}
            size={32}
            className={result === "valid" ? "text-success" : "text-destructive"}
            strokeWidth={2.5}
          />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">{t("submitSuccess")}</h2>
        <p className="text-muted-foreground mb-6">
          {result === "valid" ? t("pointsEarned", { points: 5 }) : t("pointsRefunded")}
        </p>
        <Button variant="outline" onClick={() => router.push("/borrows")}>
          {tCommon("back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-foreground mb-6">{t("title")}</h1>

      {/* Barcode Preview */}
      <Card className="p-6 mb-6">
        <div className="w-full aspect-[3/2] bg-muted rounded-xl flex items-center justify-center">
          {transaction.ticket?.barcode_image_url ? (
            <img
              src={transaction.ticket.barcode_image_url}
              alt="Ticket barcode"
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <span className="text-muted-foreground">{tCommon("error")}</span>
          )}
        </div>
      </Card>

      <p className="text-center text-lg font-medium text-foreground mb-6">{t("question")}</p>

      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full !bg-success hover:!bg-success/90"
          onClick={() => handleConfirm(true)}
          disabled={submitting}
        >
          <Icon name="check" size={24} strokeWidth={2.5} />
          {t("valid")}
        </Button>

        <Button
          variant="destructive"
          size="lg"
          className="w-full"
          onClick={() => setShowAlreadyScanned(true)}
          disabled={submitting}
        >
          <Icon name="x" size={24} strokeWidth={2.5} />
          {t("invalid")}
        </Button>
      </div>

      {/* Already Scanned Dialog */}
      <Dialog open={showAlreadyScanned} onClose={() => setShowAlreadyScanned(false)} size="sm">
        <h3 className="text-lg font-bold text-foreground mb-4">{t("alreadyScanned")}</h3>
        <div className="space-y-3">
          <Button
            variant="primary"
            size="md"
            className="w-full !bg-warning hover:!bg-warning/90"
            onClick={() => handleConfirm(false, "already_scanned")}
            loading={submitting}
          >
            {t("alreadyScannedYes")}
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => handleConfirm(false, "unknown")}
            loading={submitting}
          >
            {t("alreadyScannedNo")}
          </Button>
          <Button
            variant="ghost"
            size="md"
            className="w-full"
            onClick={() => setShowAlreadyScanned(false)}
          >
            {tCommon("cancel")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
