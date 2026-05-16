"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import type { Notification } from "@/types";

export default function AnnouncementsPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [announcements, setAnnouncements] = useState<(Notification & { recipientCount: number })[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");

  const fetchAnnouncements = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("type", "announcement")
      .order("created_at", { ascending: false })
      .limit(500);

    // Deduplicate: one announcement → many notifications (one per user).
    // Group by title — notifications from the same announcement share the same title.
    const seen = new Map<string, Notification & { recipientCount: number }>();
    const unique: (Notification & { recipientCount: number })[] = [];
    for (const row of (data as Notification[]) || []) {
      if (!seen.has(row.title)) {
        const entry = { ...row, recipientCount: 1 };
        seen.set(row.title, entry);
        unique.push(entry);
      } else {
        seen.get(row.title)!.recipientCount++;
      }
    }
    setAnnouncements(unique);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handlePublish = async () => {
    if (!title.trim() || !message.trim()) return;

    setPublishing(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.rpc("publish_announcement", {
        p_title: title.trim(),
        p_message: message.trim(),
        p_link: link.trim() || null,
      });

      if (error) throw error;

      toast.success(t("publishedSuccessfully", { count: (data as { recipient_count: number })?.recipient_count ?? 0 }));
      setTitle("");
      setMessage("");
      setLink("");
      fetchAnnouncements();
    } catch (err) {
      toast.error(t("publishError"));
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t("announcements")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("announcementMessage")}</p>
      </div>

      {/* Publish Form */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">{t("publishAnnouncement")}</h2>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("announcementTitle")}
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New feature release"
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("announcementMessage")}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Write your announcement message..."
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {message.length}/1000
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("announcementLink")}
          </label>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="/help"
          />
          <p className="text-xs text-muted-foreground mt-1">{t("announcementLinkDesc")}</p>
        </div>

        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={handlePublish}
            disabled={publishing || !title.trim() || !message.trim()}
            loading={publishing}
          >
            {publishing ? t("publishing") : t("publish")}
          </Button>
        </div>
      </div>

      {/* Announcement History */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">{t("announcementHistory")}</h2>

        {announcements.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">{t("noAnnouncements")}</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.message}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(a.created_at)}
                    </span>
                    <span className="text-[10px] text-primary font-medium">
                      {t("sentTo", { count: a.recipientCount })}
                    </span>
                    {a.link && (
                      <span className="text-[10px] text-primary truncate">{a.link}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
