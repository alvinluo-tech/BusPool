"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { TicketType } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Icon from "@/components/ui/Icon";

export default function UploadPage() {
  const t = useTranslations("upload");
  const router = useRouter();
  const [ticketType, setTicketType] = useState<TicketType>("dayrider");
  const [purchaseTime, setPurchaseTime] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reputation, setReputation] = useState(85);
  const [todayUploads, setTodayUploads] = useState(0);

  // Step 1: Scan barcode
  const [scanning, setScanning] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Step 2: Ticket photo evidence
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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

    return () => { stopCamera(); };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startScan = async () => {
    setCameraError("");
    setError("");
    setQrData(null);
    setScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const reader = new BrowserMultiFormatReader();

      const result = await reader.decodeOnceFromVideoDevice(undefined, videoRef.current!);
      setQrData(result.getText());
      setScanning(false);
      stopCamera();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera error";
      // Don't treat user cancellation as error
      if (msg.includes("NotFound") || msg.includes("NotReadable")) {
        setCameraError(t("cameraUnavailable"));
      } else if (msg.includes("Permission")) {
        setCameraError(t("cameraPermission"));
      } else {
        // Only show error if not found (scanning just didn't detect yet)
        setScanning(false);
        stopCamera();
        setCameraError(t("scanFailed"));
      }
    }
  };

  const cancelScan = () => {
    stopCamera();
    setScanning(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!qrData) { setError(t("scanRequired")); return; }
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

    // Upload ticket photo as evidence to admin-only bucket
    const { error: uploadError } = await supabase.storage
      .from("ticket-originals")
      .upload(filePath, photo);

    if (uploadError) { setError(uploadError.message); setLoading(false); return; }

    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999);

    const { error: insertError } = await supabase.from("tickets").insert({
      uploader_id: user.id,
      barcode_image_url: filePath,
      barcode_thumbnail_url: null,
      qr_code_data: qrData,
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

  const step1Done = !!qrData;
  const step2Done = !!photo;

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

        {/* Step 1: Scan Barcode */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step1Done ? "bg-success text-white" : "bg-primary text-primary-foreground"
            }`}>
              {step1Done ? <Icon name="check" size={12} strokeWidth={3} /> : "1"}
            </div>
            <label className="text-sm font-semibold text-foreground">{t("scanBarcode")}</label>
            {step1Done && <span className="text-xs text-success font-medium ml-auto">Done</span>}
          </div>

          <Card className="p-4">
            {scanning ? (
              <div className="space-y-3">
                {/* Camera Viewfinder */}
                <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  {/* Scan frame guide */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-primary/60 rounded-lg" />
                  </div>
                  <p className="absolute bottom-3 left-0 right-0 text-center text-white/80 text-xs">
                    {t("positionBarcode")}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="sm" className="w-full" onClick={cancelScan}>
                  {t("cancelScan")}
                </Button>
              </div>
            ) : step1Done ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center shrink-0">
                  <Icon name="check" size={20} className="text-success" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{t("barcodeScanned")}</p>
                  <p className="text-xs text-muted-foreground truncate font-mono">{qrData}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => { setQrData(null); }}>
                  {t("rescan")}
                </Button>
              </div>
            ) : (
              <div>
                {cameraError && (
                  <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-lg mb-3">{cameraError}</div>
                )}
                <Button type="button" variant="outline" size="md" className="w-full" onClick={startScan}>
                  <Icon name="camera" size={18} />
                  {t("startScan")}
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Step 2: Upload Ticket Photo */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step2Done ? "bg-success text-white" : "bg-primary text-primary-foreground"
            }`}>
              {step2Done ? <Icon name="check" size={12} strokeWidth={3} /> : "2"}
            </div>
            <label className="text-sm font-semibold text-foreground">{t("uploadEvidence")}</label>
            {step2Done && <span className="text-xs text-success font-medium ml-auto">Done</span>}
          </div>

          <Card className="p-4">
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Ticket evidence"
                  className="w-full aspect-[4/3] object-contain bg-muted rounded-xl border border-border"
                />
                <button
                  type="button"
                  onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                >
                  <Icon name="x" size={14} />
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="w-full aspect-[4/3] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <Icon name="upload" size={18} className="text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">{t("takePhoto")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("photoAsEvidence")}</p>
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
          </Card>
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
          disabled={!step1Done || !step2Done}
          className="w-full"
        >
          <Icon name="check" size={20} />
          {t("submit")}
        </Button>
      </form>
    </div>
  );
}
