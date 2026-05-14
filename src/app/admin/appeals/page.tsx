"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Appeal } from "@/types";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";

const statuses = ["all", "pending", "resolved", "rejected"] as const;

const statusConfig: Record<string, { labelKey: string; classes: string }> = {
  pending: { labelKey: "statusPending", classes: "bg-warning/10 text-warning border-warning/20" },
  resolved: { labelKey: "statusResolved", classes: "bg-success/10 text-success border-success/20" },
  rejected: { labelKey: "statusRejected", classes: "bg-destructive/10 text-destructive border-destructive/20" },
};

/* Resolve the appeal status label from the best available i18n key */
function resolveLabel(s: string, tAdmin: (k: string) => string, tAppeals: (k: string) => string): string {
  if (s === "pending") return tAppeals("statusPending");
  if (s === "resolved") return tAppeals("statusResolved");
  if (s === "rejected") return tAppeals("statusRejected");
  return tAdmin(s) || s;
}

export default function AdminAppealsPage() {
  const t = useTranslations("admin");
  const tAppeals = useTranslations("appeals");
  const tCommon = useTranslations("common");

  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  /* Review dialog state */
  const [reviewOpen, setReviewOpen] = useState(false);
  const [currentAppeal, setCurrentAppeal] = useState<Appeal | null>(null);
  const [reviewDecision, setReviewDecision] = useState<string>("resolve");
  const [reviewNote, setReviewNote] = useState("");

  /* Fetch */
  useEffect(() => {
    const supabase = createClient();
    const fetchAppeals = async () => {
      setLoading(true);
      let query = supabase
        .from("appeals")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data } = await query;
      setAppeals(data || []);
      setLoading(false);
    };
    fetchAppeals();
  }, [statusFilter]);

  /* Open review dialog */
  const handleReview = (appeal: Appeal) => {
    setCurrentAppeal(appeal);
    setReviewDecision("resolve");
    setReviewNote("");
    setReviewOpen(true);
  };

  /* Submit review — locally updates the appeal status */
  const handleSubmitReview = () => {
    if (!currentAppeal || reviewNote.length < 10) return;

    setAppeals((prev) =>
      prev.map((a) =>
        a.id === currentAppeal.id
          ? {
              ...a,
              status: reviewDecision === "resolve" ? ("resolved" as const) : ("rejected" as const),
              admin_note: reviewNote,
            }
          : a
      )
    );

    setReviewOpen(false);
    setCurrentAppeal(null);
    setReviewNote("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("appeals")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and process user submitted appeals
        </p>
      </div>

      {/* Filter Card */}
      <div className="bg-card border border-border rounded-xl shadow-level1 p-4">
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {s === "all" ? tCommon("all") : resolveLabel(s, t, tAppeals)}
            </button>
          ))}
        </div>
      </div>

      {/* Appeals List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : appeals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {tCommon("noResults")}
        </div>
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal) => {
            const cfg = statusConfig[appeal.status] || statusConfig.pending;
            return (
              <div
                key={appeal.id}
                className="bg-card border border-border rounded-xl shadow-level1 overflow-hidden"
              >
                <div className="p-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left Content */}
                  <div className="flex-1 space-y-3 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-foreground">
                        Appeal #{appeal.id.slice(0, 8)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.classes}`}
                      >
                        {resolveLabel(appeal.status, t, tAppeals)}
                      </span>
                    </div>

                    {/* Detail grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                      <div>
                        <span className="text-muted-foreground">Appellant:</span>{" "}
                        <span className="text-foreground font-mono text-xs">
                          {appeal.appellant_id.slice(0, 12)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Transaction:</span>{" "}
                        <span className="text-foreground font-mono text-xs">
                          {appeal.transaction_id.slice(0, 12)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ticket:</span>{" "}
                        <span className="text-foreground font-mono text-xs">
                          &mdash;
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Borrower:</span>{" "}
                        <span className="text-foreground font-mono text-xs">
                          &mdash;
                        </span>
                      </div>
                    </div>

                    {/* Reason quote */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground font-medium mb-1">
                        Appeal Reason:
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        &ldquo;{appeal.reason}&rdquo;
                      </p>
                    </div>

                    {/* Time */}
                    <p className="text-xs text-muted-foreground">
                      {new Date(appeal.created_at).toLocaleString()}
                    </p>

                    {/* Admin note (if already resolved/rejected) */}
                    {appeal.admin_note && (
                      <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                        <p className="text-xs text-primary font-medium mb-0.5">
                          Admin Note
                        </p>
                        <p className="text-sm text-foreground">
                          {appeal.admin_note}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Actions (only for pending) */}
                  {appeal.status === "pending" && (
                    <div className="shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleReview(appeal)}
                      >
                        <Icon name="shield" size={16} />
                        Review
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Review Dialog ──────────────────────────────── */}
      <Dialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Review Appeal"
        description="Review the appeal and make a decision."
        className="max-w-2xl"
        size="lg"
      >
        <div className="space-y-5">
          {/* Appeal Details Recap */}
          {currentAppeal && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Appeal ID:</span>
                <span className="font-mono text-foreground">
                  {currentAppeal.id.slice(0, 12)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Transaction:</span>
                <span className="font-mono text-foreground">
                  {currentAppeal.transaction_id.slice(0, 12)}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground shrink-0">Reason:</span>
                <p className="text-foreground">
                  &ldquo;{currentAppeal.reason}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Decision Select */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Decision
            </label>
            <select
              value={reviewDecision}
              onChange={(e) => setReviewDecision(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="resolve">
                Restore uploader reputation and points
              </option>
              <option value="reject">
                Uphold original decision (reject appeal)
              </option>
            </select>
          </div>

          {/* Admin Note */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Admin Note <span className="text-xs text-muted-foreground">(min 10 characters)</span>
            </label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
              placeholder="Provide an admin note for this decision..."
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {reviewNote.length} / 10
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              size="md"
              className="flex-1"
              onClick={() => setReviewOpen(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              disabled={reviewNote.length < 10}
              onClick={handleSubmitReview}
            >
              {reviewDecision === "resolve"
                ? "Resolve Appeal"
                : "Reject Appeal"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
