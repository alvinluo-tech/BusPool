"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import type { Transaction, TransactionStatus } from "@/types";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";

/* ─── Mock Data ─────────────────────────────────────────── */

const mockTransaction: Transaction & {
  uploader: { nickname: string; email: string; reputation: number };
  borrower: { nickname: string; email: string; reputation: number };
} = {
  id: "TX-20240515-001",
  ticket_id: "TKT-abc123-def456",
  borrower_id: "usr_borrower_01",
  points_amount: 5,
  status: "pending" as TransactionStatus,
  failure_reason: null,
  confirmed_at: null,
  created_at: "2026-05-15T09:30:00Z",
  expires_at: "2026-05-15T23:59:00Z",
  uploader: {
    nickname: "Alice Johnson",
    email: "alice.johnson@durham.ac.uk",
    reputation: 88,
  },
  borrower: {
    nickname: "Bob Smith",
    email: "bob.smith@durham.ac.uk",
    reputation: 72,
  },
};

const mockTicket = {
  id: "TKT-abc123-def456",
  ticket_type: "dayrider" as const,
  purchase_time: "2026-05-15T08:15:00Z",
};

const mockRelatedAppeal = {
  id: "APL-001",
  status: "pending" as const,
  appellant: { nickname: "Bob Smith", email: "bob.smith@durham.ac.uk" },
  reason: "The ticket was valid but the bus scanner could not read the barcode on my phone screen.",
  created_at: "2026-05-15T10:00:00Z",
};

/* ─── Status helpers ────────────────────────────────────── */

const statusConfig: Record<
  string,
  { labelKey: string; classes: string }
> = {
  pending: {
    labelKey: "statusPending",
    classes: "bg-warning/10 text-warning border-warning/20",
  },
  confirmed_valid: {
    labelKey: "statusConfirmedValid",
    classes: "bg-success/10 text-success border-success/20",
  },
  confirmed_invalid: {
    labelKey: "statusConfirmedInvalid",
    classes: "bg-destructive/10 text-destructive border-destructive/20",
  },
  auto_settled: {
    labelKey: "statusAutoSettled",
    classes: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
};

/* ─── Component ─────────────────────────────────────────── */

export default function AdminTransactionDetailPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const tx = mockTransaction;
  const ticket = mockTicket;
  const relatedAppeal = mockRelatedAppeal;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDecision, setConfirmDecision] = useState<string>("confirmed_valid");
  const [confirmReason, setConfirmReason] = useState("");

  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");

  const cfg = statusConfig[tx.status] || statusConfig.pending;

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          href="/admin/transactions"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <Icon name="chevron-left" size={16} />
          {tCommon("back")}
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">
          Transaction Detail
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("transactions")} &middot; {tx.id}
        </p>
      </div>

      {/* Top Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ─── Transaction Info Card ─────────────────────── */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-level1 p-6 space-y-6">
          {/* Top Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">
                Transaction #{tx.id}
              </h2>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.classes}`}
              >
                {t(cfg.labelKey)}
              </span>
            </div>
            <span className="text-2xl font-bold text-primary">
              {tx.points_amount > 0 ? "+" : ""}
              {tx.points_amount}
            </span>
          </div>

          {/* Time Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Created</p>
              <p className="text-sm text-foreground font-medium">
                {new Date(tx.created_at).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Expires</p>
              <p className="text-sm text-foreground font-medium">
                {new Date(tx.expires_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* User Info Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Uploader Card */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Uploader
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {tx.uploader.nickname.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {tx.uploader.nickname}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {tx.uploader.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Icon name="star" size={14} className="text-warning" filled />
                <span className="text-foreground font-medium">
                  {tx.uploader.reputation}
                </span>
                <span className="text-muted-foreground">reputation</span>
              </div>
            </div>

            {/* Borrower Card */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Borrower
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {tx.borrower.nickname.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {tx.borrower.nickname}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {tx.borrower.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Icon name="star" size={14} className="text-warning" filled />
                <span className="text-foreground font-medium">
                  {tx.borrower.reputation}
                </span>
                <span className="text-muted-foreground">reputation</span>
              </div>
            </div>
          </div>

          {/* Ticket Info */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Ticket Info
            </h3>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ticket ID</span>
                <span className="font-mono text-foreground">
                  {ticket.id}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {ticket.ticket_type === "dayrider" ? "Dayrider" : "DaySaver"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Purchase Time</span>
                <span className="text-foreground">
                  {new Date(ticket.purchase_time).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Admin Actions Card ────────────────────────── */}
        <div className="bg-card border border-border rounded-xl shadow-level1 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Admin Actions
          </h3>

          <Button
            variant="outline"
            size="md"
            className="w-full justify-start"
            onClick={() => setConfirmOpen(true)}
          >
            <Icon name="check" size={16} />
            Manually Confirm Status
          </Button>

          <Button
            variant="outline"
            size="md"
            className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setRevokeOpen(true)}
          >
            <Icon name="x" size={16} />
            Revoke Transaction
          </Button>
        </div>
      </div>

      {/* ─── Related Appeal Card (conditional) ──────────── */}
      {relatedAppeal && (
        <div className="bg-card border border-border rounded-xl shadow-level1 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            Related Appeal
          </h3>

          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Appeal #{relatedAppeal.id}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                {t("statusPending")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Icon name="profile" size={14} className="text-muted-foreground" />
              <span className="text-foreground">
                {relatedAppeal.appellant.nickname}
              </span>
              <span className="text-muted-foreground">
                {relatedAppeal.appellant.email}
              </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Reason:</span>{" "}
              {relatedAppeal.reason}
            </p>

            <p className="text-xs text-muted-foreground">
              {new Date(relatedAppeal.created_at).toLocaleString()}
            </p>
          </div>

          <Link href={`/admin/appeals`}>
            <Button variant="secondary" size="sm">
              <Icon name="chevron-right" size={16} />
              View Appeal
            </Button>
          </Link>
        </div>
      )}

      {/* ─── Confirm Dialog ─────────────────────────────── */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Manually Confirm Transaction"
        description="Confirm whether this transaction was valid or invalid."
        size="md"
      >
        <div className="space-y-4">
          {/* Decision select */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Decision
            </label>
            <select
              value={confirmDecision}
              onChange={(e) => setConfirmDecision(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="confirmed_valid">Valid &mdash; Ticket worked</option>
              <option value="confirmed_invalid">
                Invalid &mdash; Ticket did not work
              </option>
            </select>
          </div>

          {/* Reason textarea */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("reason")} <span className="text-xs text-muted-foreground">(min 10 characters)</span>
            </label>
            <textarea
              value={confirmReason}
              onChange={(e) => setConfirmReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
              placeholder="Provide a reason for this confirmation..."
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {confirmReason.length} / 10
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              size="md"
              className="flex-1"
              onClick={() => setConfirmOpen(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              disabled={confirmReason.length < 10}
              onClick={() => {
                setConfirmOpen(false);
                setConfirmReason("");
              }}
            >
              {tCommon("confirm")}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ─── Revoke Dialog ──────────────────────────────── */}
      <Dialog
        open={revokeOpen}
        onClose={() => setRevokeOpen(false)}
        title="Revoke Transaction"
        description="This action will reverse the transaction and refund the points."
        size="md"
      >
        <div className="space-y-4">
          {/* Warning */}
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Icon
                name="alert"
                size={20}
                className="text-destructive shrink-0 mt-0.5"
              />
              <div className="text-sm text-foreground">
                <p className="font-medium text-destructive mb-1">Warning</p>
                <p className="text-xs text-muted-foreground">
                  Revoking a transaction is irreversible. Points will be refunded
                  to the borrower and the transaction will be marked as invalid.
                </p>
              </div>
            </div>
          </div>

          {/* Reason textarea */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("reason")} <span className="text-xs text-muted-foreground">(min 10 characters)</span>
            </label>
            <textarea
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
              placeholder="Explain why this transaction needs to be revoked..."
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {revokeReason.length} / 10
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              size="md"
              className="flex-1"
              onClick={() => setRevokeOpen(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              size="md"
              className="flex-1"
              disabled={revokeReason.length < 10}
              onClick={() => {
                setRevokeOpen(false);
                setRevokeReason("");
              }}
            >
              {tCommon("confirm")}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
