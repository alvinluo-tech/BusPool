"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Appeal } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const statusBadgeVariant: Record<string, "warning" | "success" | "error"> = {
  pending: "warning",
  resolved: "success",
  rejected: "error",
};

export default function AppealDetailPage() {
  const t = useTranslations("appeals");
  const params = useParams();
  const router = useRouter();
  const appealId = params.id as string;

  const [appeal, setAppeal] = useState<Appeal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchAppeal = async () => {
      const { data } = await supabase
        .from("appeals")
        .select("*")
        .eq("id", appealId)
        .single();

      setAppeal(data);
      setLoading(false);
    };

    fetchAppeal();
  }, [appealId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!appeal) {
    return <div className="text-center py-12 text-muted-foreground">Appeal not found</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">
        {t("detail")}
      </h1>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">
            {new Date(appeal.created_at).toLocaleString()}
          </span>
          <Badge variant={statusBadgeVariant[appeal.status] || "default"} size="sm">
            {appeal.status}
          </Badge>
        </div>
        <p className="text-foreground mb-4">{appeal.reason}</p>

        {appeal.evidence_url && (
          <div className="mb-4">
            <img
              src={appeal.evidence_url}
              alt="Evidence"
              className="w-full rounded-lg object-contain max-h-64 bg-muted"
            />
          </div>
        )}

        {appeal.admin_note && (
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-1">
              Admin Response:
            </p>
            <p className="text-sm text-muted-foreground">
              {appeal.admin_note}
            </p>
          </div>
        )}
      </Card>

      <Button
        variant="outline"
        size="md"
        className="w-full"
        onClick={() => router.back()}
      >
        Back
      </Button>
    </div>
  );
}
