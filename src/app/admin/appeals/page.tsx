"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Appeal } from "@/types";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";

interface JoinedAppeal extends Appeal {
  appellant: { nickname: string; email: string } | null;
  transaction: {
    ticket_id: string;
    borrower_id: string;
    ticket: { id: string; uploader: { nickname: string } | null } | null;
    borrower: { nickname: string } | null;
  } | null;
}

const statuses = ["all", "pending", "resolved", "rejected"] as const;

const statusConfig: Record<string, { labelKey: string; classes: string }> = {
  pending: { labelKey: "statusPending", classes: "bg-warning/10 text-warning border-warning/20" },
  resolved: { labelKey: "statusResolved", classes: "bg-success/10 text-success border-success/20" },
  rejected: { labelKey: "statusRejected", classes: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function AdminAppealsPage() {
  const t = useTranslations("admin");
  const tAppeals = useTranslations("appeals");
  const tCommon = useTranslations("common");

  const [appeals, setAppeals] = useState<JoinedAppeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [reviewOpen, setReviewOpen] = useState(false);
  const [currentAppeal, setCurrentAppeal] = useState<Appeal | null>(null);
  const [reviewDecision, setReviewDecision] = useState("resolve");
  const [reviewNote, setReviewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAppeals = async () => {
    const supabase = createClient();
    setLoading(true);
    let query = supabase
      .from("appeals")
      .select("*, appellant:users!appeals_appellant_id_fkey(nickname, email)")
      .order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data } = await query;

    const raw = (data || []) as unknown as JoinedAppeal[];

    // Fetch transaction info for each appeal
    const enriched = await Promise.all(
      raw.map(async (a) => {
        const { data: txData } = await supabase
          .from("transactions")
          .select("*, ticket:tickets!inner(id, uploader:users!tickets_uploader_id_fkey(nickname)), borrower:users!transactions_borrower_id_fkey(nickname)")
          .eq("id", a.transaction_id)
          .single();
        return { ...a, transaction: (txData as unknown as JoinedAppeal["transaction"]) || null };
      }),
    );

    setAppeals(enriched);
    setLoading(false);
  };

  useEffect(() => {
    loadAppeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleReview = (appeal: Appeal) => {
    setCurrentAppeal(appeal);
    setReviewDecision("resolve");
    setReviewNote("");
    setReviewOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!currentAppeal || reviewNote.length < 10) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_review_appeal", {
      p_appeal_id: currentAppeal.id,
      p_decision: reviewDecision,
      p_admin_note: reviewNote.trim(),
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setReviewOpen(false);
    setCurrentAppeal(null);
    setReviewNote("");
    loadAppeals();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("appeals")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("reviewAndProcess")}</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-level1 p-4">
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {s === "all" ? tCommon("all") : t(statusConfig[s]?.labelKey || s)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : appeals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">{tCommon("noResults")}</div>
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal) => {
            const cfg = statusConfig[appeal.status] || statusConfig.pending;
            const tx = appeal.transaction;
            return (
              <div key={appeal.id} className="bg-card border border-border rounded-xl shadow-level1 overflow-hidden">
                <div className="p-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-foreground">Appeal #{appeal.id.slice(0, 8)}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.classes}`}>
                        {t(cfg.labelKey)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t("appellantLabel")}</span>{" "}
                        <span className="text-foreground">{appeal.appellant?.nickname || appeal.appellant_id.slice(0, 12)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("transactionLabel")}</span>{" "}
                        <span className="text-foreground font-mono text-xs">{appeal.transaction_id.slice(0, 12)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("ticketLabel")}</span>{" "}
                        <span className="text-foreground font-mono text-xs">{tx?.ticket_id?.slice(0, 12) || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("borrowerLabel")}</span>{" "}
                        <span className="text-foreground">{tx?.borrower?.nickname || "—"}</span>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground font-medium mb-1">{t("appealReasonLabel")}</p>
                      <p className="text-sm text-foreground leading-relaxed">&ldquo;{appeal.reason}&rdquo;</p>
                    </div>

                    <p className="text-xs text-muted-foreground">{new Date(appeal.created_at).toLocaleString()}</p>

                    {appeal.admin_note && (
                      <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                        <p className="text-xs text-primary font-medium mb-0.5">{t("adminNote")}</p>
                        <p className="text-sm text-foreground">{appeal.admin_note}</p>
                      </div>
                    )}
                  </div>

                  {appeal.status === "pending" && (
                    <div className="shrink-0">
                      <Button variant="primary" size="sm" onClick={() => handleReview(appeal)}>
                        <Icon name="shield" size={16} />
                        {t("review")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} title={t("reviewAppeal")} description={t("reviewAppealDesc")} className="max-w-2xl" size="lg">
        <div className="space-y-5">
          {currentAppeal && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t("appealIdLabel")}</span>
                <span className="font-mono text-foreground">{currentAppeal.id.slice(0, 12)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t("transactionLabel")}</span>
                <span className="font-mono text-foreground">{currentAppeal.transaction_id.slice(0, 12)}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground shrink-0">{t("reason")}:</span>
                <p className="text-foreground">&ldquo;{currentAppeal.reason}&rdquo;</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("decision")}</label>
            <select
              value={reviewDecision}
              onChange={(e) => setReviewDecision(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="resolve">{t("restoreReputation")}</option>
              <option value="reject">{t("rejectAppealOption")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("adminNote")} <span className="text-xs text-muted-foreground">(min 10 characters)</span>
            </label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
              placeholder={t("adminNotePlaceholder")}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{reviewNote.length} / 10</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" size="md" className="flex-1" onClick={() => setReviewOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button variant="primary" size="md" className="flex-1" disabled={reviewNote.length < 10} loading={submitting} onClick={handleSubmitReview}>
              {reviewDecision === "resolve" ? t("resolveAppeal") : t("rejectAppeal")}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
