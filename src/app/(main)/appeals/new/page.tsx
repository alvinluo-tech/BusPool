"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const MAX_DESC_LENGTH = 500;
const MIN_DESC_LENGTH = 10;

interface ReasonOption {
  key: string;
}

export default function NewAppealPage() {
  const t = useTranslations("appeals");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedReason, setSelectedReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reasonOptions: ReasonOption[] = [
    { key: "validButMarked" },
    { key: "technicalIssue" },
    { key: "misidentified" },
    { key: "validTimeframe" },
    { key: "other" },
  ];

  const isComplete = !!(selectedReason && description.trim().length >= MIN_DESC_LENGTH);

  const getReasonI18nKey = (
    key: string
  ):
    | "reasonValidButMarked"
    | "reasonTechnicalIssue"
    | "reasonMisidentified"
    | "reasonValidTimeframe"
    | "reasonOther" => {
    const map: Record<
      string,
      | "reasonValidButMarked"
      | "reasonTechnicalIssue"
      | "reasonMisidentified"
      | "reasonValidTimeframe"
      | "reasonOther"
    > = {
      validButMarked: "reasonValidButMarked",
      technicalIssue: "reasonTechnicalIssue",
      misidentified: "reasonMisidentified",
      validTimeframe: "reasonValidTimeframe",
      other: "reasonOther",
    };
    return map[key] || "reasonOther";
  };

  const getReasonLabel = (key: string): string => {
    return t(getReasonI18nKey(key));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEvidence(file);
    const reader = new FileReader();
    reader.onload = () => setEvidencePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeEvidence = () => {
    setEvidence(null);
    setEvidencePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedReason || !description.trim()) {
      setError("Please provide a reason and description");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    let evidenceUrl: string | null = null;

    if (evidence) {
      const fileExt = evidence.name.split(".").pop();
      const filePath = `appeals/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("evidence")
        .upload(filePath, evidence);

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("evidence")
          .getPublicUrl(filePath);
        evidenceUrl = urlData.publicUrl;
      }
    }

    const reasonText = `${getReasonLabel(selectedReason)}: ${description.trim()}`;

    const { error: insertError } = await supabase.from("appeals").insert({
      appellant_id: user.id,
      transaction_id: "00000000-0000-0000-0000-000000000000",
      reason: reasonText,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer"
        >
          <Icon name="chevron-left" size={20} className="text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t("newAppeal")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Info Card */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Icon
              name="info"
              size={20}
              className="text-primary shrink-0 mt-0.5"
            />
            <div>
              <p className="font-semibold text-foreground text-sm">
                {t("appealProcess")}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t("appealProcessDesc")}
              </p>
            </div>
          </div>
        </div>

        {/* Reason for Appeal */}
        <div>
          <p className="font-semibold text-sm text-foreground mb-3">
            {t("reasonForAppeal")}
          </p>
          <div className="space-y-2">
            {reasonOptions.map((option) => (
              <button
                type="button"
                key={option.key}
                onClick={() => setSelectedReason(option.key)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedReason === option.key
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-border/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {getReasonLabel(option.key)}
                  </span>
                  {selectedReason === option.key && (
                    <Icon name="check" size={18} className="text-primary shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <div className="flex items-center gap-1 mb-3">
            <p className="font-semibold text-sm text-foreground">
              {t("detailedDescription")}
            </p>
            <span className="text-xs text-destructive">{t("required")}</span>
          </div>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC_LENGTH))}
              rows={5}
              className="w-full px-4 py-3 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none min-h-32 text-sm"
              placeholder={t("descriptionPlaceholder")}
            />
            <p className="text-xs text-muted-foreground text-right mt-1.5">
              {t("charCount", {
                current: description.length,
                max: MAX_DESC_LENGTH,
              })}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("descriptionHint")}
          </p>
        </div>

        {/* Supporting Evidence */}
        <div>
          <p className="font-semibold text-sm text-foreground mb-3">
            {t("supportingEvidence")}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {/* Upload area / Preview */}
            <label className="cursor-pointer">
              {evidencePreview ? (
                <div className="aspect-square rounded-xl overflow-hidden relative group">
                  <img
                    src={evidencePreview}
                    alt="Evidence"
                    className="w-full h-full object-cover"
                  />
                  <div
                    onClick={removeEvidence}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon name="x" size={24} className="text-white" />
                  </div>
                </div>
              ) : (
                <div className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors bg-card">
                  <Icon
                    name="camera"
                    size={24}
                    className="text-muted-foreground"
                  />
                  <span className="text-xs text-muted-foreground text-center px-2 leading-tight">
                    {t("uploadArea")}
                  </span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {/* Placeholder cells */}
            <div className="aspect-square rounded-xl border-2 border-dashed border-border/30" />
            <div className="aspect-square rounded-xl border-2 border-dashed border-border/30" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t("evidenceHint")}
          </p>
        </div>

        {/* Warning Card */}
        <div className="bg-warning/10 border border-warning/20 rounded-2xl p-3">
          <div className="flex items-start gap-2">
            <Icon
              name="alert"
              size={18}
              className="text-warning shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t("important")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("falseAppealWarning")}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full h-12 rounded-xl"
          disabled={!isComplete}
          loading={loading}
        >
          {t("submit")}
        </Button>
      </form>
    </div>
  );
}
