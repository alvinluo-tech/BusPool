"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TicketWithUploader } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function TicketDetailPage() {
  const t = useTranslations("ticket");
  const tCommon = useTranslations("common");
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<TicketWithUploader | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const fetchTicket = async () => {
      const { data } = await supabase
        .from("tickets")
        .select("*, uploader:users!tickets_uploader_id_fkey(nickname, avatar_url, reputation, successful_uses, total_uploads)")
        .eq("id", ticketId)
        .single();
      setTicket(data as TicketWithUploader);
      setLoading(false);
    };
    fetchTicket();
  }, [ticketId]);

  const handleBorrow = async () => {
    const supabase = createClient();
    setBorrowing(true);
    setError("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/auth/login"); return; }

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
      prev ? { ...prev, status: "in_use", barcode_image_url: data.barcode_image_url } : prev
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
      <div className="text-center py-16 text-muted-foreground">{tCommon("error")}</div>
    );
  }

  const isActive = ticket.status === "in_use";

  return (
    <div className="space-y-4">
      {/* Barcode */}
      <Card variant="ticket" className="p-6 text-center">
        <div
          className={`w-full aspect-[3/2] bg-muted rounded-xl flex items-center justify-center mb-3 overflow-hidden ${
            !isActive ? "blur-md" : ""
          }`}
        >
          {ticket.barcode_image_url ? (
            <img
              src={ticket.barcode_image_url}
              alt="Ticket barcode"
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <Icon name="tickets" size={64} className="text-muted-foreground" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {isActive ? t("barcodeRevealed") : t("barcodePreview")}
        </p>
      </Card>

      {/* Ticket Info */}
      <Card className="p-5">
        <h2 className="font-semibold text-foreground mb-3">{t("detail")}</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("type")}</span>
            <span className="text-foreground font-medium">
              {ticket.ticket_type === "dayrider" ? t("dayrider") : t("daysaver")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("purchaseTime")}</span>
            <span className="text-foreground">
              {new Date(ticket.purchase_time).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("expiresAt")}</span>
            <span className="text-foreground">
              {new Date(ticket.expires_at).toLocaleTimeString()}
            </span>
          </div>
          {ticket.zone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("zone")}</span>
              <span className="text-foreground">{ticket.zone}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Uploader Info */}
      <Card className="p-5">
        <h2 className="font-semibold text-foreground mb-3">{t("uploaderInfo")}</h2>
        <div className="flex items-center gap-3">
          <Avatar
            size="lg"
            src={ticket.uploader?.avatar_url}
            name={ticket.uploader?.nickname ?? ""}
          />
          <div>
            <p className="font-medium text-foreground">{ticket.uploader?.nickname}</p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{t("reputation")}: {ticket.uploader?.reputation}</span>
              <span>{t("totalUploads")}: {ticket.uploader?.total_uploads}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Borrow Button */}
      {!isActive && (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => setShowConfirm(true)}
        >
          {t("borrowButton")}
        </Button>
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
    </div>
  );
}
