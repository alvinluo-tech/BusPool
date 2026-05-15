"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isFullUrl, getPrivatePhotoUrl } from "@/lib/admin/db";
import { QRCodeSVG } from "qrcode.react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { Ticket, Transaction } from "@/types";

interface TicketData extends Ticket {
  uploader: { nickname: string; email: string; reputation: number; avatar_url: string | null } | null;
}

interface BorrowRecord extends Transaction {
  borrower: { nickname: string; email: string } | null;
}

function TicketStatusBadge({ status }: { status: string }) {
  const t = useTranslations("admin");
  const cfg: Record<string, { colors: string; labelKey: string }> = {
    available: { colors: "bg-success/10 text-success", labelKey: "statusAvailable" },
    in_use: { colors: "bg-blue-500/10 text-blue-600", labelKey: "statusInUse" },
    completed: { colors: "bg-muted text-muted-foreground", labelKey: "statusCompleted" },
    expired: { colors: "bg-warning/10 text-warning", labelKey: "statusExpired" },
    invalid: { colors: "bg-destructive/10 text-destructive", labelKey: "statusInvalid" },
  };
  const c = cfg[status];
  if (!c) return <span className="text-xs text-muted-foreground">{status}</span>;
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${c.colors}`}>
      {t(c.labelKey)}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const t = useTranslations("ticket");
  return (
    <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium border border-border bg-muted/50 text-foreground">
      {t(type === "dayrider" ? "dayrider" : "daysaver")}
    </span>
  );
}

function RepBadge({ value }: { value: number }) {
  const colors =
    value >= 80
      ? "bg-success/10 text-success"
      : value >= 50
        ? "bg-blue-500/10 text-blue-600"
        : value >= 30
          ? "bg-warning/10 text-warning"
          : "bg-destructive/10 text-destructive";
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${colors}`}>
      {value}
    </span>
  );
}

function BorrowStatusBadge({ status }: { status: string }) {
  const t = useTranslations("admin");
  const cfg: Record<string, { colors: string; labelKey: string }> = {
    pending: { colors: "bg-warning/10 text-warning", labelKey: "statusPending" },
    confirmed_valid: { colors: "bg-success/10 text-success", labelKey: "statusConfirmedValid" },
    confirmed_invalid: { colors: "bg-destructive/10 text-destructive", labelKey: "statusConfirmedInvalid" },
    auto_settled: { colors: "bg-muted text-muted-foreground", labelKey: "statusAutoSettled" },
  };
  const c = cfg[status];
  if (!c) return <span className="text-xs text-muted-foreground">{status}</span>;
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${c.colors}`}>
      {t(c.labelKey)}
    </span>
  );
}

function RemoveTicketDialog({ open, onClose, ticketId, onRemoved }: {
  open: boolean;
  onClose: () => void;
  ticketId: string;
  onRemoved: () => void;
}) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (reason.trim().length < 10) { setError(t("reasonMinChars")); return; }
    setError("");
    setSubmitting(true);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("admin_force_remove_ticket", {
      p_ticket_id: ticketId,
      p_reason: reason.trim(),
    });
    if (rpcError) {
      setError(rpcError.message);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setReason("");
    onClose();
    onRemoved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-level2 max-h-[85vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-foreground mb-2">{t("forceRemoveTicket")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("forceRemoveDesc")}</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("removalReason")}</label>
            <textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(""); }}
              placeholder={t("removalReasonPlaceholder")}
              rows={3}
              className="w-full px-3 py-2 text-base bg-card border border-border rounded-lg outline-none text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" size="md" onClick={onClose} disabled={submitting}>
            {tCommon("cancel")}
          </Button>
          <Button variant="destructive" size="md" onClick={handleSubmit} loading={submitting}>
            {t("confirmRemove")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTicketDetailPage() {
  const t = useTranslations("admin");
  const { id } = useParams<{ id: string }>();

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [photoEnlarged, setPhotoEnlarged] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const fetchData = () => {
    const supabase = createClient();
    setLoading(true);
    setError(null);

    Promise.all([
      supabase
        .from("tickets")
        .select("*, uploader:users!tickets_uploader_id_fkey(nickname, email, reputation, avatar_url)")
        .eq("id", id)
        .single(),
      supabase
        .from("transactions")
        .select("*, borrower:users!transactions_borrower_id_fkey(nickname, email)")
        .eq("ticket_id", id)
        .order("created_at", { ascending: false }),
    ]).then(async ([ticketRes, borrowsRes]) => {
      if (ticketRes.error) {
        setError(ticketRes.error.message);
      } else {
        const ticketData = ticketRes.data as unknown as TicketData;
        setTicket(ticketData);

        // Load photo: full URL (old data) vs private bucket path (new data)
        if (ticketData.barcode_image_url) {
          if (isFullUrl(ticketData.barcode_image_url)) {
            setPhotoUrl(ticketData.barcode_image_url);
          } else {
            const url = await getPrivatePhotoUrl("ticket-originals", ticketData.barcode_image_url);
            setPhotoUrl(url);
          }
        }
      }
      if (borrowsRes.data) {
        setBorrows(borrowsRes.data as unknown as BorrowRecord[]);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-6">
        <Link href="/admin/tickets" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
          <Icon name="chevron-left" size={16} />
          {t("backToTickets")}
        </Link>
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Icon name="alert" size={32} className="text-destructive mx-auto mb-3" />
          <p className="text-sm text-destructive">{error || t("loadError")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/tickets" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
          <Icon name="chevron-left" size={16} />
          {t("backToTickets")}
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">{t("ticketDetail")}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 rounded-xl space-y-6" padding={false}>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-semibold text-foreground">
              {t("ticketHash")}{ticket.id.slice(0, 8)}
            </h2>
            <TicketStatusBadge status={ticket.status} />
            <TypeBadge type={ticket.ticket_type} />
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">{t("purchaseTime")}</p>
              <p className="text-sm text-foreground mt-0.5">
                {new Date(ticket.purchase_time).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("expiryTime")}</p>
              <p className="text-sm text-foreground mt-0.5">
                {new Date(ticket.expires_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("zone")}</p>
              <p className="text-sm text-foreground mt-0.5">{ticket.zone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("borrowCount")}</p>
              <p className="text-sm text-foreground mt-0.5">{borrows.length}</p>
            </div>
          </div>

          {/* QR Code */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">{t("qrCode")}</h3>
            {ticket.qr_code_data ? (
              <div className="p-4 bg-white rounded-lg inline-block">
                <QRCodeSVG value={ticket.qr_code_data} size={200} />
              </div>
            ) : (
              <div className="p-6 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
                {t("noQRCodeAvailable")}
              </div>
            )}
          </div>

          {/* Original Photo */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">{t("originalPhoto")}</h3>
            {photoUrl ? (
              <div className="relative">
                <img
                  src={photoUrl}
                  alt={t("barcodePreview")}
                  className="max-h-64 rounded-lg border border-border cursor-pointer object-contain bg-muted/30"
                  onClick={() => setPhotoEnlarged(true)}
                />
                <p className="text-xs text-muted-foreground mt-1">{t("clickToEnlarge")}</p>
              </div>
            ) : (
              <div className="p-6 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
                {t("noPhotoAvailable")}
              </div>
            )}
          </div>

          {/* Uploader Info */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">{t("uploaderInfo")}</h3>
            {ticket.uploader ? (
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0 text-lg">
                  {ticket.uploader.nickname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{ticket.uploader.nickname}</p>
                  <p className="text-xs text-muted-foreground">{ticket.uploader.email}</p>
                </div>
                <div className="ml-auto">
                  <RepBadge value={ticket.uploader.reputation} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("unknown")}</p>
            )}
          </div>
        </Card>

        <Card className="p-6 rounded-xl" padding={false}>
          <h3 className="text-base font-semibold text-foreground mb-4">{t("adminActions")}</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              size="md"
              className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setShowRemoveDialog(true)}
            >
              <Icon name="alert" size={16} />
              {t("forceRemoveTicket")}
            </Button>
          </div>
        </Card>
      </div>

      {/* Borrow Records */}
      <Card className="p-6 rounded-xl" padding={false}>
        <h3 className="text-base font-semibold text-foreground mb-4">{t("borrowRecords")}</h3>
        {borrows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t("noBorrowRecords")}</p>
        ) : (
          <div className="space-y-1">
            {borrows.map((record) => (
              <div key={record.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium shrink-0">
                    {record.borrower?.nickname?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {record.borrower?.nickname || t("unknown")}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {record.borrower?.email || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.created_at).toLocaleString()}
                    </p>
                    <p className={`text-sm font-semibold ${record.points_amount > 0 ? "text-success" : "text-destructive"}`}>
                      {record.points_amount > 0 ? "+" : ""}{record.points_amount}
                    </p>
                  </div>
                  <BorrowStatusBadge status={record.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Photo Lightbox */}
      {photoEnlarged && photoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPhotoEnlarged(false)}
        >
          <img
            src={photoUrl}
            alt={t("barcodePreview")}
            className="max-w-full max-h-full rounded-xl object-contain"
          />
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            onClick={() => setPhotoEnlarged(false)}
          >
            <Icon name="x" size={20} className="text-white" />
          </button>
        </div>
      )}

      <RemoveTicketDialog
        open={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
        ticketId={ticket.id}
        onRemoved={fetchData}
      />
    </div>
  );
}
