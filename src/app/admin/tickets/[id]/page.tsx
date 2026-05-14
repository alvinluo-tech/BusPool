"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

/* ---------- mock data ---------- */

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

/* ---------- badge helpers ---------- */

function TicketStatusBadge({ status }: { status: string }) {
  const t = useTranslations("admin");
  const cfg: Record<string, { colors: string; label: string }> = {
    available: { colors: "bg-success/10 text-success", label: t("可用") },
    in_use: { colors: "bg-blue-500/10 text-blue-600", label: t("使用中") },
    completed: { colors: "bg-muted text-muted-foreground", label: t("已完成") },
    expired: { colors: "bg-warning/10 text-warning", label: t("已过期") },
    invalid: { colors: "bg-destructive/10 text-destructive", label: t("已失效") },
  };

  const c = cfg[status];
  if (!c) return <span className="text-xs text-muted-foreground">{status}</span>;

  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${c.colors}`}>
      {c.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const label = type === "dayrider" ? "Dayrider" : "DaySaver";
  return (
    <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium border border-border bg-muted/50 text-foreground">
      {label}
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
  const cfg: Record<string, { colors: string; label: string }> = {
    pending: { colors: "bg-warning/10 text-warning", label: t("待确认") },
    confirmed_valid: { colors: "bg-success/10 text-success", label: t("已验证有效") },
    confirmed_invalid: { colors: "bg-destructive/10 text-destructive", label: t("已验证无效") },
    auto_settled: { colors: "bg-muted text-muted-foreground", label: t("自动结算") },
  };

  const c = cfg[status];
  if (!c) return <span className="text-xs text-muted-foreground">{status}</span>;

  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${c.colors}`}>
      {c.label}
    </span>
  );
}

/* ---------- remove dialog ---------- */

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
      setError(t("原因至少 10 个字符"));
      return;
    }
    setError("");
    alert(t("票务已强制下架"));
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-level2">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t("强制下架票务")}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("此操作将强制下架该票务，下架后用户将无法继续借出此票。请填写下架原因。")}
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("下架原因")}
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder={t("请输入下架原因（至少 10 个字符）")}
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
            {t("确认下架")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function AdminTicketDetailPage() {
  const t = useTranslations("admin");
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const ticket = mockTicket;
  const records = mockBorrowRecords;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/tickets"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <Icon name="chevron-left" size={16} />
          {t("返回票务列表")}
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">
          {t("票务详情")}
        </h1>
      </div>

      {/* Top Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* A. Ticket Info Card */}
        <Card className="lg:col-span-2 p-6 rounded-xl space-y-6" padding={false}>
          {/* Top row: ID + status + type */}
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-semibold text-foreground">
              {t("票 #")}{ticket.id.slice(0, 8)}
            </h2>
            <TicketStatusBadge status={ticket.status} />
            <TypeBadge type={ticket.ticket_type} />
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">{t("购买时间")}</p>
              <p className="text-sm text-foreground mt-0.5">
                {new Date(ticket.purchase_time).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("过期时间")}</p>
              <p className="text-sm text-foreground mt-0.5">
                {new Date(ticket.expires_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("区域")}</p>
              <p className="text-sm text-foreground mt-0.5">{ticket.zone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("借用次数")}</p>
              <p className="text-sm text-foreground mt-0.5">{ticket.borrow_count}</p>
            </div>
          </div>

          {/* Uploader section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {t("上传者信息")}
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

          {/* Barcode photo placeholder */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {t("条码照片")}
            </h3>
            <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Icon name="camera" size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("条码照片预览")}</p>
              </div>
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
              className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setShowRemoveDialog(true)}
            >
              <Icon name="alert" size={16} />
              {t("强制下架票务")}
            </Button>
          </div>
        </Card>
      </div>

      {/* Borrow Records Card */}
      <Card className="p-6 rounded-xl" padding={false}>
        <h3 className="text-base font-semibold text-foreground mb-4">
          {t("借用记录")}
        </h3>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("暂无借用记录")}
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

      {/* Remove Dialog */}
      <RemoveTicketDialog
        open={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
      />
    </div>
  );
}
