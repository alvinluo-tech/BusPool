"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Appeal } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import Icon from "@/components/ui/Icon";

export default function AppealsPage() {
  const t = useTranslations("appeals");
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchAppeals = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("appeals")
        .select("*")
        .eq("appellant_id", user.id)
        .order("created_at", { ascending: false });
      setAppeals(data || []);
      setLoading(false);
    };
    fetchAppeals();
  }, []);

  return (
    <div>
      <PageHeader title={t("title")} />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : appeals.length === 0 ? (
        <EmptyState
          icon={<Icon name="alert" size={32} />}
          title={t("empty")}
        />
      ) : (
        <div className="space-y-3">
          {appeals.map((appeal) => (
            <Link key={appeal.id} href={`/appeals/${appeal.id}`} className="block">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {appeal.reason.slice(0, 50)}...
                  </span>
                  <Badge
                    variant={
                      appeal.status === "resolved"
                        ? "success"
                        : appeal.status === "rejected"
                        ? "error"
                        : "warning"
                    }
                    size="sm"
                  >
                    {t(`status${appeal.status.charAt(0).toUpperCase() + appeal.status.slice(1)}` as never)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(appeal.created_at).toLocaleString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
