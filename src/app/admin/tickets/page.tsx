"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Ticket } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const statuses = ["all", "available", "in_use", "completed", "expired", "invalid"] as const;

const statusBadgeVariant: Record<string, "success" | "warning" | "default" | "error"> = {
  available: "success",
  in_use: "warning",
  completed: "default",
  expired: "default",
  invalid: "error",
};

export default function AdminTicketsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const supabase = createClient();

    const fetchTickets = async () => {
      let query = supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data } = await query;
      setTickets(data || []);
      setLoading(false);
    };

    fetchTickets();
  }, [statusFilter]);

  return (
    <div>
      <PageHeader title={t("tickets")} />

      <div className="flex gap-2 mb-4 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s === "all" ? tCommon("all") : t(`status_${s}` as never)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-card rounded-xl p-4 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  {ticket.ticket_type}
                </span>
                <Badge variant={statusBadgeVariant[ticket.status] || "default"} size="sm">
                  {ticket.status}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>ID: {ticket.id.slice(0, 8)}...</p>
                <p>Created: {new Date(ticket.created_at).toLocaleString()}</p>
                <p>Expires: {new Date(ticket.expires_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
