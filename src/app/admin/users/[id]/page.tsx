"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

/* ---------- mock data ---------- */

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
  {
    id: "tx_001",
    description: "Borrow ticket #TKT-001 earned points",
    amount: 50,
    date: "2026-05-14T10:30:00Z",
  },
  {
    id: "tx_002",
    description: "Upload ticket #TKT-002 cost points",
    amount: -30,
    date: "2026-05-13T14:20:00Z",
  },
  {
    id: "tx_003",
    description: "Appeal refund points",
    amount: 20,
    date: "2026-05-12T09:00:00Z",
  },
  {
    id: "tx_004",
    description: "Ticket validation failed penalty",
    amount: -10,
    date: "2026-05-11T16:45:00Z",
  },
  {
    id: "tx_005",
    description: "Referral bonus",
    amount: 100,
    date: "2026-05-10T11:15:00Z",
  },
];

/* ---------- badge helpers ---------- */

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

  const label =
    value >= 80
      ? t("优秀")
      : value >= 50
        ? t("良好")
        : value >= 30
          ? t("一般")
          : t("限制");

  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${colors}`}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("admin");
  const cfg: Record<string, { colors: string; label: string }> = {
    normal: { colors: "bg-success/10 text-success border-success/20", label: t("正常") },
    restricted: { colors: "bg-warning/10 text-warning border-warning/20", label: t("受限") },
    banned: { colors: "bg-destructive/10 text-destructive border-destructive/20", label: t("封禁") },
  };

  const c = cfg[status];
  if (!c) return null;
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium border ${c.colors}`}>
      {c.label}
    </span>
  );
}

/* ---------- dialogs ---------- */

function AdjustPointsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    const num = Number(amount);
    if (!amount || isNaN(num)) {
      setError(t("请输入有效数字"));
      return;
    }
    if (reason.trim().length < 10) {
      setError(t("原因至少 10 个字符"));
      return;
    }
    setError("");
    alert(t("积分调整成功"));
    setAmount("");
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-level2">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("调整积分")}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("积分数量")}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              placeholder={t("输入正数增加，负数扣除")}
              className="w-full h-10 px-3 text-base bg-card border border-border rounded-lg outline-none text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("原因")}
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder={t("请输入调整原因（至少 10 个字符）")}
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
          <Button variant="primary" size="md" onClick={handleSubmit}>
            {t("确认调整")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdjustReputationDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    const num = Number(value);
    if (!value || isNaN(num) || num < 0 || num > 100) {
      setError(t("请输入 0-100 之间的有效数值"));
      return;
    }
    if (reason.trim().length < 10) {
      setError(t("原因至少 10 个字符"));
      return;
    }
    setError("");
    alert(t("信誉分调整成功"));
    setValue("");
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-level2">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("调整信誉分")}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("信誉分值 (0-100)")}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              placeholder={t("输入 0-100 之间的数值")}
              min={0}
              max={100}
              className="w-full h-10 px-3 text-base bg-card border border-border rounded-lg outline-none text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("原因")}
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder={t("请输入调整原因（至少 10 个字符）")}
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
          <Button variant="primary" size="md" onClick={handleSubmit}>
            {t("确认调整")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChangeStatusDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [status, setStatus] = useState("normal");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const statusLabel = (s: string) => {
    const labels: Record<string, string> = {
      normal: t("正常"),
      restricted: t("受限"),
      banned: t("封禁"),
    };
    return labels[s] || s;
  };

  const handleSubmit = () => {
    if (reason.trim().length < 10) {
      setError(t("原因至少 10 个字符"));
      return;
    }
    setError("");
    alert(`${t("账号状态已变更为")}: ${statusLabel(status)}`);
    setStatus("normal");
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-level2">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("修改账号状态")}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("账号状态")}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 px-3 text-base bg-card border border-border rounded-lg outline-none text-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="normal">{t("正常")}</option>
              <option value="restricted">{t("受限")}</option>
              <option value="banned">{t("封禁")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("原因")}
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder={t("请输入变更原因（至少 10 个字符）")}
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
            {t("确认变更")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function AdminUserDetailPage() {
  const t = useTranslations("admin");
  const [dialog, setDialog] = useState<"points" | "reputation" | "status" | null>(null);

  const user = mockUser;
  const transactions = mockTransactions;
  const derivedStatus = user.reputation >= 50 ? "normal" : user.reputation >= 30 ? "restricted" : "banned";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <Icon name="chevron-left" size={16} />
          {t("返回用户列表")}
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">
          {t("用户详情")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("查看和管理用户信息、积分与信誉")}
        </p>
      </div>

      {/* Top Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* A. User Info Card */}
        <Card className="lg:col-span-2 p-6 rounded-xl" padding={false}>
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-medium shrink-0">
              {user.nickname.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-semibold text-foreground">
                  {user.nickname}
                </h2>
                <StatusBadge status={derivedStatus} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t("用户 ID")}</p>
                  <p className="text-sm font-mono text-foreground mt-0.5 break-all">
                    {user.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("注册时间")}</p>
                  <p className="text-sm text-foreground mt-0.5">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Icon name="star" size={20} className="text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{user.reputation}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("信誉分")}</p>
              <RepLevelBadge value={user.reputation} />
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Icon name="dollar" size={20} className="text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{user.points_balance}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("积分")}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Icon name="upload" size={20} className="text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{user.total_uploads}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("上传")}</p>
            </div>
          </div>
        </Card>

        {/* B. Admin Actions Card */}
        <Card className="p-6 rounded-xl" padding={false}>
          <h3 className="text-base font-semibold text-foreground mb-4">
            {t("管理员操作")}
          </h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              size="md"
              className="w-full justify-start"
              onClick={() => setDialog("points")}
            >
              <Icon name="dollar" size={16} />
              {t("调整积分")}
            </Button>
            <Button
              variant="outline"
              size="md"
              className="w-full justify-start"
              onClick={() => setDialog("reputation")}
            >
              <Icon name="star" size={16} />
              {t("调整信誉分")}
            </Button>
            <Button
              variant="outline"
              size="md"
              className="w-full justify-start"
              onClick={() => setDialog("status")}
            >
              <Icon name="alert" size={16} />
              {t("修改账号状态")}
            </Button>
          </div>
        </Card>
      </div>

      {/* Transaction History Card */}
      <Card className="p-6 rounded-xl" padding={false}>
        <h3 className="text-base font-semibold text-foreground mb-4">
          {t("交易记录")}
        </h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("暂无交易记录")}
          </p>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm text-foreground">{tx.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(tx.date).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`font-semibold shrink-0 ${
                    tx.amount > 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <AdjustPointsDialog
        open={dialog === "points"}
        onClose={() => setDialog(null)}
      />
      <AdjustReputationDialog
        open={dialog === "reputation"}
        onClose={() => setDialog(null)}
      />
      <ChangeStatusDialog
        open={dialog === "status"}
        onClose={() => setDialog(null)}
      />
    </div>
  );
}
