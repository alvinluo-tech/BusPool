"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";

export default function NewAppealPage() {
  const t = useTranslations("appeals");
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reason.trim()) {
      setError("Please provide a reason");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    let evidenceUrl = null;

    if (evidence) {
      const fileExt = evidence.name.split(".").pop();
      const filePath = `appeals/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("evidence")
        .upload(filePath, evidence);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("evidence")
          .getPublicUrl(filePath);
        evidenceUrl = publicUrl;
      }
    }

    const { error: insertError } = await supabase.from("appeals").insert({
      appellant_id: user.id,
      transaction_id: "00000000-0000-0000-0000-000000000000",
      reason,
      evidence_url: evidenceUrl,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/appeals");
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-foreground mb-6">
        {t("newAppeal")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <Card className="p-5">
          <label className="block text-sm font-medium text-foreground mb-3">
            {t("reason")}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-muted border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            placeholder="Describe your situation..."
            required
          />
        </Card>

        <Card className="p-5">
          <label className="block text-sm font-medium text-foreground mb-3">
            {t("evidence")}
          </label>
          <label className="block cursor-pointer">
            <div className="w-full border-2 border-dashed border-border rounded-sm p-4 text-center hover:border-primary transition-colors">
              {evidence ? (
                <span className="text-sm text-foreground">{evidence.name}</span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  <Icon name="upload" size={16} className="inline mr-1" />
                  Upload evidence photo (optional)
                </span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEvidence(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        </Card>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {t("submit")}
        </Button>
      </form>
    </div>
  );
}
