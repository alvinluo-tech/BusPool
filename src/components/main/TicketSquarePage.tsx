"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TicketWithUploader } from "@/types";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import { timeAgo } from "@/lib/utils";

export default function TicketSquarePage() {
  const t = useTranslations("home");
  const [tickets, setTickets] = useState<TicketWithUploader[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    const fetchTickets = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("points_balance")
          .eq("id", user.id)
          .single();
        setUserPoints(profile?.points_balance ?? 0);
      }

      const { data } = await supabase
        .from("tickets")
        .select("*, uploader:users!tickets_uploader_id_fkey(nickname, avatar_url, reputation, successful_uses, total_uploads)")
        .eq("status", "available")
        .order("created_at", { ascending: false });

      setTickets((data as TicketWithUploader[]) || []);
      setLoading(false);
    };

    fetchTickets();

    const channel = supabase
      .channel("tickets")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tickets" }, (payload) => {
        setTickets((prev) => [payload.new as TicketWithUploader, ...prev]);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "tickets" }, (payload) => {
        setTickets((prev) => prev.filter((t) => t.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      {/* Header */}
      <PageHeader
        title={t("title")}
        description={t("availableCount", { count: tickets.length, plural: tickets.length !== 1 ? "s" : "" })}
        action={
          <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-sm font-semibold text-primary">{userPoints} {t("points")}</span>
          </div>
        }
      />

      {/* Ticket List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={<Icon name="tickets" size={32} />}
          title={t("emptyState")}
        />
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const successRate = ticket.uploader?.total_uploads
              ? Math.round(((ticket.uploader?.successful_uses ?? 0) / ticket.uploader.total_uploads) * 100)
              : 0;

            return (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block">
                <Card variant="ticket">
                  {/* Blue Header */}
                  <div className="bg-primary px-4 py-2.5 flex items-center justify-between">
                    <span className="text-primary-foreground font-semibold text-sm">
                      {ticket.ticket_type === "dayrider" ? "Dayrider" : "DaySaver"} · Durham City
                    </span>
                    <span className="text-primary-foreground/80 text-xs">
                      {timeAgo(ticket.created_at)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar
                        size="lg"
                        src={ticket.uploader?.avatar_url}
                        name={ticket.uploader?.nickname ?? ""}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">
                          {ticket.uploader?.nickname}
                        </p>
                        <StarRating rating={ticket.uploader?.reputation ?? 0} />
                      </div>
                      <Icon name="chevron-right" size={20} className="text-muted-foreground" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div>
                        <p className="text-[11px] text-muted-foreground">{t("successRate")}</p>
                        <p className="text-sm font-bold text-foreground">{successRate}%</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">{t("totalShares")}</p>
                        <p className="text-sm font-bold text-foreground">{ticket.uploader?.total_uploads ?? 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-muted-foreground">{t("cost")}</p>
                        <p className="text-sm font-bold text-primary">5 {t("points")}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
