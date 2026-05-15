"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const mockTicket = {
  id: "tkt_001",
  ticket_type: "dayrider",
  status: "available",
  purchase_time: "2026-05-14T08:00:00Z",
  expires_at: "2026-05-14T23:59:59Z",
  zone: "Durham City",
  borrow_count: 3,
  uploader: {
    nickname: "Alice Wang",
    email: "alice.wang@durham.ac.uk",
    reputation: 85,
  },
};

const mockBorrowRecords = [
  {
    id: "br_001",
    borrower: { name: "Bob Chen", email: "bob.chen@durham.ac.uk" },
    time: "2026-05-14T09:15:00Z",
    points: 20,
    status: "confirmed_valid",
  },
  {
    id: "br_002",
    borrower: { name: "Charlie Li", email: "charlie.li@durham.ac.uk" },
    time: "2026-05-14T11:30:00Z",
    points: 20,
    status: "confirmed_valid",
  },
  {
    id: "br_003",
    borrower: { name: "Diana Zhang", email: "diana.zhang@durham.ac.uk" },
    time: "2026-05-14T14:00:00Z",
    points: 20,
    status: "pending",
  },
];

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

function RemoveTicketDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    if (reason.trim().length < 10) {
      setError(t("reasonMinChars"));
      return;
    }
    setError("");
    alert(t("ticketRemoved"));
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-level2">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t("forceRemoveTicket")}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("forceRemoveDesc")}
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("removalReason")}
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder={t("removalReasonPlaceholder")}
              rows={3}
              className="w-full px-3 py-2 text-base bg-card border border-border rounded-lg outline-none text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" size="md" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button variant="destructive" size="md" onClick={handleSubmit}>
            {t("confirmRemove")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTicketDetailPage() {
  const t = useTranslations("admin");
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const ticket = mockTicket;
  const records = mockBorrowRecords;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/tickets"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <Icon name="chevron-left" size={16} />
          {t("backToTickets")}
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">
          {t("ticketDetail")}
        </h1>
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
              <p className="text-sm text-foreground mt-0.5">{ticket.zone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("borrowCount")}</p>
              <p className="text-sm text-foreground mt-0.5">{ticket.borrow_count}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {t("uploaderInfo")}
            </h3>
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0 text-lg">
                {ticket.uploader.nickname.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {ticket.uploader.nickname}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ticket.uploader.email}
                </p>
              </div>
              <div className="ml-auto">
                <RepBadge value={ticket.uploader.reputation} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {t("barcodePhoto")}
            </h3>
            <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Icon name="camera" size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("barcodePreview")}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-xl" padding={false}>
          <h3 className="text-base font-semibold text-foreground mb-4">
            {t("adminActions")}
          </h3>
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

      <Card className="p-6 rounded-xl" padding={false}>
        <h3 className="text-base font-semibold text-foreground mb-4">
          {t("borrowRecords")}
        </h3>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("noBorrowRecords")}
          </p>
        ) : (
          <div className="space-y-1">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium shrink-0">
                    {record.borrower.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {record.borrower.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {record.borrower.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.time).toLocaleString()}
                    </p>
                    <p className="text-sm font-semibold text-success">
                      +{record.points}
                    </p>
                  </div>
                  <BorrowStatusBadge status={record.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <RemoveTicketDialog
        open={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
      />
    </div>
  );
}
