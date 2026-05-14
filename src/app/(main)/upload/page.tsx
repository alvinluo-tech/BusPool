"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { TicketType } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

export default function UploadPage() {
  const t = useTranslations("upload");
  const router = useRouter();
  const [ticketType, setTicketType] = useState<TicketType>("dayrider");
  const [purchaseTime, setPurchaseTime] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reputation, setReputation] = useState(85);
  const [todayUploads, setTodayUploads] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("reputation")
        .eq("id", user.id)
        .single();
      if (profile) setReputation(profile.reputation);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("uploader_id", user.id)
        .gte("created_at", today.toISOString());
      setTodayUploads(count ?? 0);
    };
    fetchUserData();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!photo) { setError(t("photoRequired")); return; }
    if (!confirmed) { setError(t("confirmUsed")); return; }

    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const { data: profile } = await supabase
      .from("users")
      .select("reputation, total_uploads")
      .eq("id", user.id)
      .single();

    if (profile && profile.reputation < 30) {
      setError(t("reputationTooLow"));
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("uploader_id", user.id)
      .gte("created_at", today.toISOString());

    if (count && count >= 3) {
      setError(t("dailyLimit"));
      setLoading(false);
      return;
    }

    const fileExt = photo.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("barcodes")
      .upload(filePath, photo);

    if (uploadError) { setError(uploadError.message); setLoading(false); return; }

    const { data: { publicUrl } } = supabase.storage
      .from("barcodes")
      .getPublicUrl(filePath);

    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999);

    const { error: insertError } = await supabase.from("tickets").insert({
      uploader_id: user.id,
      barcode_image_url: publicUrl,
      barcode_thumbnail_url: publicUrl,
      ticket_type: ticketType,
      purchase_time: purchaseTime ? new Date(purchaseTime).toISOString() : new Date().toISOString(),
      status: "available",
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) { setError(insertError.message); setLoading(false); return; }

    await supabase
      .from("users")
      .update({ total_uploads: (profile?.total_uploads ?? 0) + 1 })
      .eq("id", user.id);

    router.push("/");
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">{t("title")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("selectPhoto")}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Barcode Photo */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            {t("selectPhoto")}
          </label>
          {photoPreview ? (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Barcode preview"
                className="w-full aspect-[4/3] object-contain bg-muted rounded-3xl border border-border"
              />
              <button
                type="button"
                onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <div className="w-full aspect-[4/3] border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-primary transition-colors">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="camera" size={28} className="text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">{t("takePhoto")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("chooseFromGallery")}</p>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Ticket Type */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">{t("ticketType")}</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTicketType("dayrider")}
              className={`flex-1 p-4 rounded-2xl border-2 text-left transition-colors relative ${
                ticketType === "dayrider"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <p className="font-semibold text-foreground">Dayrider</p>
              <p className="text-xs text-muted-foreground mt-0.5">£1.60 · All day</p>
              {ticketType === "dayrider" && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="check" size={14} className="text-primary-foreground" strokeWidth={3} />
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => setTicketType("daysaver")}
              className={`flex-1 p-4 rounded-2xl border-2 text-left transition-colors relative ${
                ticketType === "daysaver"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <p className="font-semibold text-foreground">DaySaver</p>
              <p className="text-xs text-muted-foreground mt-0.5">Multi-zone</p>
              {ticketType === "daysaver" && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="check" size={14} className="text-primary-foreground" strokeWidth={3} />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Purchase Time */}
        <Input
          label={t("purchaseTime")}
          type="datetime-local"
          value={purchaseTime}
          onChange={(e) => setPurchaseTime(e.target.value)}
        />

        {/* Confirm Checkbox */}
        <Card className="p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-border text-primary focus:ring-primary accent-primary"
            />
            <p className="text-sm font-semibold text-foreground">{t("confirmUsed")}</p>
          </label>
        </Card>

        {/* Info Box */}
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="info" size={20} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Good to know</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 ml-7">
            <li>· {t("dailyLimit")}</li>
            <li>· {t("reputationTooLow")}</li>
          </ul>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <Card variant="stats" className="flex-1">
            <p className="text-xs text-muted-foreground">{t("yourReputation")}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{reputation}</p>
          </Card>
          <Card variant="stats" className="flex-1">
            <p className="text-xs text-muted-foreground">{t("todayUploads")}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{todayUploads} / 3</p>
          </Card>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          <Icon name="check" size={20} />
          {t("submit")}
        </Button>
      </form>
    </div>
  );
}
