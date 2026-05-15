"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const mockUser = {
  id: "usr_001",
  nickname: "Alice Wang",
  email: "alice.wang@durham.ac.uk",
  avatar_url: null,
  points_balance: 1250,
  reputation: 85,
  total_uploads: 12,
  total_borrows: 45,
  successful_uses: 42,
  created_at: "2025-09-15T08:30:00Z",
};

const mockTransactions = [
  { id: "tx_001", description: "Borrow ticket #TKT-001 earned points", amount: 50, date: "2026-05-14T10:30:00Z" },
  { id: "tx_002", description: "Upload ticket #TKT-002 cost points", amount: -30, date: "2026-05-13T14:20:00Z" },
  { id: "tx_003", description: "Appeal refund points", amount: 20, date: "2026-05-12T09:00:00Z" },
  { id: "tx_004", description: "Ticket validation failed penalty", amount: -10, date: "2026-05-11T16:45:00Z" },
  { id: "tx_005", description: "Referral bonus", amount: 100, date: "2026-05-10T11:15:00Z" },
];

function RepLevelBadge({ value }: { value: number }) {
  const t = useTranslations("admin");
  const colors =
    value >= 80
      ? "bg-success/10 text-success"
      : value >= 50
        ? "bg-blue-500/10 text-blue-600"
        : value >= 30
          ? "bg-warning/10 text-warning"
          : "bg-destructive/10 text-destructive";

  const labelKey =
    value >= 80 ? "repExcellent" : value >= 50 ? "repGood" : value >= 30 ? "repFair" : "repRestricted";

  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${colors}`}>
      {t(labelKey)}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("admin");
  const cfg: Record<string, { colors: string; labelKey: string }> = {
    normal: { colors: "bg-success/10 text-success border-success/20", labelKey: "statusNormal" },
    restricted: { colors: "bg-warning/10 text-warning border-warning/20", labelKey: "statusRestricted" },
    banned: { colors: "bg-destructive/10 text-destructive border-destructive/20", labelKey: "statusBanned" },
  };

  const c = cfg[status];
  if (!c) return null;
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium border ${c.colors}`}>
      {t(c.labelKey)}
    </span>
  );
}

function AdjustPointsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    const num = Number(amount);
    if (!amount || isNaN(num)) { setError(t("enterValidNumber")); return; }
    if (reason.trim().length < 10) { setError(t("reasonMinChars")); return; }
    setError("");
    alert(t("pointsAdjustSuccess"));
    setAmount("");
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-level2">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("adjustPoints")}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("pointsNumber")}</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(""); }}
              placeholder={t("enterPositiveNegative")}
              className="w-full h-10 px-3 text-base bg-card border border-border rounded-lg outline-none text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("reason")}</label>
            <textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(""); }}
              placeholder={t("adjustReasonPlaceholder")}
              rows={3}
              className="w-full px-3 py-2 text-base bg-card border border-border rounded-lg outline-none text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" size="md" onClick={onClose}>{tCommon("cancel")}</Button>
          <Button variant="primary" size="md" onClick={handleSubmit}>{t("confirmAdjust")}</Button>
        </div>
      </div>
    </div>
  );
}

function AdjustReputationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    const num = Number(value);
    if (!value || isNaN(num) || num < 0 || num > 100) { setError(t("enterValidReputation")); return; }
    if (reason.trim().length < 10) { setError(t("reasonMinChars")); return; }
    setError("");
    alert(t("reputationAdjustSuccess"));
    setValue("");
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-level2">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("adjustReputation")}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("reputationValue")}</label>
            <input
              type="number"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(""); }}
              placeholder={t("enterReputationRange")}
              min={0} max={100}
              className="w-full h-10 px-3 text-base bg-card border border-border rounded-lg outline-none text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("reason")}</label>
            <textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(""); }}
              placeholder={t("adjustReasonPlaceholder")}
              rows={3}
              className="w-full px-3 py-2 text-base bg-card border border-border rounded-lg outline-none text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" size="md" onClick={onClose}>{tCommon("cancel")}</Button>
          <Button variant="primary" size="md" onClick={handleSubmit}>{t("confirmAdjust")}</Button>
        </div>
      </div>
    </div>
  );
}

function ChangeStatusDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [status, setStatus] = useState("normal");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const statusLabels: Record<string, string> = {
    normal: t("statusNormal"),
    restricted: t("statusRestricted"),
    banned: t("statusBanned"),
  };

  const handleSubmit = () => {
    if (reason.trim().length < 10) { setError(t("reasonMinChars")); return; }
    setError("");
    alert(`${t("statusChangedTo")}: ${statusLabels[status]}`);
    setStatus("normal");
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-level2">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("changeStatus")}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("accountStatus")}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 px-3 text-base bg-card border border-border rounded-lg outline-none text-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="normal">{t("statusNormal")}</option>
              <option value="restricted">{t("statusRestricted")}</option>
              <option value="banned">{t("statusBanned")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("reason")}</label>
            <textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(""); }}
              placeholder={t("changeStatusReasonPlaceholder")}
              rows={3}
              className="w-full px-3 py-2 text-base bg-card border border-border rounded-lg outline-none text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" size="md" onClick={onClose}>{tCommon("cancel")}</Button>
          <Button variant="destructive" size="md" onClick={handleSubmit}>{t("confirmChange")}</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const t = useTranslations("admin");
  const [dialog, setDialog] = useState<"points" | "reputation" | "status" | null>(null);

  const user = mockUser;
  const transactions = mockTransactions;
  const derivedStatus = user.reputation >= 50 ? "normal" : user.reputation >= 30 ? "restricted" : "banned";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <Icon name="chevron-left" size={16} />
          {t("backToUsers")}
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">{t("userDetail")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("viewManageUser")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 rounded-xl" padding={false}>
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-medium shrink-0">
              {user.nickname.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-semibold text-foreground">{user.nickname}</h2>
                <StatusBadge status={derivedStatus} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t("userId")}</p>
                  <p className="text-sm font-mono text-foreground mt-0.5 break-all">{user.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("registrationTime")}</p>
                  <p className="text-sm text-foreground mt-0.5">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Icon name="star" size={20} className="text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{user.reputation}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("reputation")}</p>
              <RepLevelBadge value={user.reputation} />
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Icon name="dollar" size={20} className="text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{user.points_balance}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("points")}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Icon name="upload" size={20} className="text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{user.total_uploads}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("uploads")}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-xl" padding={false}>
          <h3 className="text-base font-semibold text-foreground mb-4">{t("adminActions")}</h3>
          <div className="space-y-3">
            <Button variant="outline" size="md" className="w-full justify-start" onClick={() => setDialog("points")}>
              <Icon name="dollar" size={16} />
              {t("adjustPoints")}
            </Button>
            <Button variant="outline" size="md" className="w-full justify-start" onClick={() => setDialog("reputation")}>
              <Icon name="star" size={16} />
              {t("adjustReputation")}
            </Button>
            <Button variant="outline" size="md" className="w-full justify-start" onClick={() => setDialog("status")}>
              <Icon name="alert" size={16} />
              {t("changeStatus")}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6 rounded-xl" padding={false}>
        <h3 className="text-base font-semibold text-foreground mb-4">{t("transactionRecords")}</h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t("noTransactionRecords")}</p>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-foreground">{tx.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(tx.date).toLocaleString()}</p>
                </div>
                <span className={`font-semibold shrink-0 ${tx.amount > 0 ? "text-success" : "text-destructive"}`}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AdjustPointsDialog open={dialog === "points"} onClose={() => setDialog(null)} />
      <AdjustReputationDialog open={dialog === "reputation"} onClose={() => setDialog(null)} />
      <ChangeStatusDialog open={dialog === "status"} onClose={() => setDialog(null)} />
    </div>
  );
}
