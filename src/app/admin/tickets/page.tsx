"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Ticket } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Icon from "@/components/ui/Icon";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";

const statuses = ["all", "available", "in_use", "completed", "expired", "invalid"] as const;

const statusBadgeVariant: Record<string, "success" | "warning" | "default" | "error"> = {
  available: "success",
  in_use: "warning",
  completed: "default",
  expired: "default",
  invalid: "error",
};

const statusLabel: Record<string, string> = {
  available: "Available",
  in_use: "In Use",
  completed: "Completed",
  expired: "Expired",
  invalid: "Invalid",
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
      <PageHeader
        title={t("tickets")}
        description="View and manage all uploaded tickets"
      />

      {/* Filter Pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
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
            {s === "all" ? tCommon("all") : statusLabel[s] || s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="hidden sm:table-cell">Zone</TableHeaderCell>
                <TableHeaderCell className="hidden md:table-cell">Created</TableHeaderCell>
                <TableHeaderCell className="hidden md:table-cell">Expires</TableHeaderCell>
                <TableHeaderCell className="text-right">Action</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No tickets found
                  </td>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {ticket.id.slice(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize font-medium text-foreground">
                        {ticket.ticket_type === "dayrider" ? "Dayrider" : "DaySaver"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant[ticket.status] || "default"} size="sm">
                        {statusLabel[ticket.status] || ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">{ticket.zone || "Durham City"}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {new Date(ticket.expires_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Icon name="chevron-right" size={18} />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
