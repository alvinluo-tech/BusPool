"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/types";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { timeAgo } from "@/lib/utils";

interface TransactionWithRelations extends Transaction {
  ticket?: { ticket_type: string; zone: string | null; uploader?: { nickname: string } | null };
}

function getTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

export default function BorrowsPage() {
  const t = useTranslations("borrows");
  const [active, setActive] = useState<TransactionWithRelations[]>([]);
  const [history, setHistory] = useState<TransactionWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchBorrows = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: activeData } = await supabase
        .from("transactions")
        .select("*, ticket:tickets(ticket_type, zone, uploader:users!tickets_uploader_id_fkey(nickname))")
        .eq("borrower_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      const { data: historyData } = await supabase
        .from("transactions")
        .select("*, ticket:tickets(ticket_type, zone, uploader:users!tickets_uploader_id_fkey(nickname))")
        .eq("borrower_id", user.id)
        .neq("status", "pending")
        .order("created_at", { ascending: false });

      setActive((activeData as unknown as TransactionWithRelations[]) || []);
      setHistory((historyData as unknown as TransactionWithRelations[]) || []);
      setLoading(false);
    };
    fetchBorrows();
  }, []);

  const activeTicket = active[0];

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={activeTicket ? t("active") : t("emptyActive")}
      />

      {/* Active Ticket */}
      {activeTicket && (
        <div className="mb-8">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t("active")}
          </p>
          <Card variant="ticket">
            {/* Blue Header */}
            <div className="bg-primary px-5 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-primary-foreground/70 text-xs font-medium">BusPool</p>
                  <p className="text-primary-foreground font-bold text-lg">
                    {activeTicket.ticket?.ticket_type === "dayrider" ? "Dayrider" : "DaySaver"}
                  </p>
                  <p className="text-primary-foreground/80 text-sm">
                    {activeTicket.ticket?.zone || "Durham City"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-primary-foreground/70 text-xs">Borrowed from</p>
                  <p className="text-primary-foreground font-semibold text-sm">
                    {activeTicket.ticket?.uploader?.nickname || "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Barcode Placeholder */}
              <div className="bg-muted rounded-xl p-6 mb-4">
                <div className="flex items-end justify-center gap-[2px] h-20">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-foreground"
                      style={{
                        width: Math.random() > 0.5 ? "2px" : "3px",
                        height: `${40 + Math.random() * 40}px`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Show this barcode to the driver
                </p>
              </div>

              {/* Time Remaining */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Icon name="clock" size={16} className="text-muted-foreground" />
                <span className="text-sm font-semibold text-warning">
                  {getTimeRemaining(activeTicket.expires_at)}
                </span>
              </div>

              {/* Confirm Button */}
              <Link href={`/borrows/${activeTicket.id}/confirm`} className="block">
                <Button variant="primary" size="md" className="w-full">
                  <Icon name="check" size={20} />
                  {t("confirmResult")}
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Please confirm the result after using
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t("history")}
          </p>
          <div className="space-y-3">
            {history.map((tx) => {
              const isSuccess = tx.status === "confirmed_valid";
              const isFailed = tx.status === "confirmed_invalid" || tx.status === "auto_settled";

              return (
                <Card key={tx.id} className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Status Icon */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isSuccess ? "bg-success/10" : "bg-destructive/10"
                      }`}
                    >
                      {isSuccess ? (
                        <Icon name="check" size={16} className="text-success" strokeWidth={2.5} />
                      ) : (
                        <Icon name="x" size={16} className="text-destructive" strokeWidth={2.5} />
                      )}
                    </div>

                    {/* Avatar */}
                    <Avatar
                      size="md"
                      name={tx.ticket?.uploader?.nickname ?? ""}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">
                        {tx.ticket?.uploader?.nickname || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.ticket?.ticket_type === "dayrider" ? "Dayrider" : "DaySaver"} · {timeAgo(tx.created_at)}
                      </p>
                      <Badge
                        variant={isSuccess ? "success" : "error"}
                        size="sm"
                        className="mt-0.5"
                      >
                        {isSuccess ? "Successful" : "Failed"}
                        {isFailed && tx.status === "auto_settled" && " · Ticket expired"}
                      </Badge>
                    </div>

                    {/* Points */}
                    <div className="text-right shrink-0">
                      <p className={`font-bold text-sm ${isSuccess ? "text-foreground" : "text-destructive"}`}>
                        {isSuccess ? "-" : "+"}
                        {tx.points_amount}
                      </p>
                      <p className="text-[10px] text-muted-foreground">points</p>
                    </div>

                    <Icon name="chevron-right" size={16} className="text-muted-foreground shrink-0" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!activeTicket && history.length === 0 && (
        <EmptyState
          icon={<Icon name="tickets" size={32} />}
          title={t("emptyActive")}
        />
      )}
    </div>
  );
}
