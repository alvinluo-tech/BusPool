"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import type { NotificationPreferences } from "@/types";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import type { IconName } from "@/components/ui/Icon";

interface NotificationItem {
  key: keyof NotificationPreferences;
  titleKey: string;
  descKey: string;
  defaultOn: boolean;
}

interface NotificationSection {
  icon: IconName;
  labelKey: string;
  items: NotificationItem[];
}

const sections: NotificationSection[] = [
  {
    icon: "bell",
    labelKey: "ticketNotifications",
    items: [
      { key: "newTickets", titleKey: "newTicketsAvailable", descKey: "newTicketsAvailableDesc", defaultOn: true },
      { key: "ticketExpiring", titleKey: "ticketExpiringSoon", descKey: "ticketExpiringSoonDesc", defaultOn: true },
      { key: "ticketUsed", titleKey: "yourTicketUsed", descKey: "yourTicketUsedDesc", defaultOn: true },
    ],
  },
  {
    icon: "activity",
    labelKey: "reputationNotifications",
    items: [
      { key: "reputationChanges", titleKey: "reputationChanges", descKey: "reputationChangesDesc", defaultOn: true },
      { key: "reputationMilestones", titleKey: "reputationMilestones", descKey: "reputationMilestonesDesc", defaultOn: true },
      { key: "lowReputationWarning", titleKey: "lowReputationWarning", descKey: "lowReputationWarningDesc", defaultOn: true },
    ],
  },
  {
    icon: "bell",
    labelKey: "activityNotifications",
    items: [
      { key: "pointsReceived", titleKey: "pointsReceived", descKey: "pointsReceivedDesc", defaultOn: true },
      { key: "appealUpdates", titleKey: "appealUpdates", descKey: "appealUpdatesDesc", defaultOn: true },
      { key: "confirmationReminders", titleKey: "confirmationReminders", descKey: "confirmationRemindersDesc", defaultOn: true },
    ],
  },
  {
    icon: "settings",
    labelKey: "systemNotifications",
    items: [
      { key: "announcements", titleKey: "announcements", descKey: "announcementsDesc", defaultOn: true },
      { key: "tipsSuggestions", titleKey: "tipsSuggestions", descKey: "tipsSuggestionsDesc", defaultOn: false },
    ],
  },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={onChange}
      className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-200 ${checked ? "bg-primary" : "bg-muted"}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-level2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><Icon name="x" size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const { prefs, setNotification, setQuietHours } = useUserPreferences();

  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const [quietOpen, setQuietOpen] = useState(false);
  const [qhStart, setQhStart] = useState(prefs?.quiet_hours?.start ?? "22:00");
  const [qhEnd, setQhEnd] = useState(prefs?.quiet_hours?.end ?? "07:00");
  const [qhEnabled, setQhEnabled] = useState(prefs?.quiet_hours?.enabled ?? false);

  const handleSetQuietHours = async () => {
    await setQuietHours({ start: qhStart, end: qhEnd, enabled: qhEnabled });
    setQuietOpen(false);
  };

  const getValue = (key: keyof NotificationPreferences): boolean => {
    if (mounted && prefs?.notifications && key in prefs.notifications) {
      return prefs.notifications[key];
    }
    const item = sections.flatMap((s) => s.items).find((i) => i.key === key);
    return item?.defaultOn ?? true;
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">{t("notificationTitle")}</h1>

      {/* Description Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
        <h2 className="font-semibold text-sm text-foreground">{t("notificationDescription")}</h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t("notificationDescriptionText")}</p>
      </div>

      {/* Notification Sections */}
      {sections.map((section) => (
        <div key={section.labelKey}>
          <div className="flex items-center gap-2 mb-2 mt-1">
            <Icon name={section.icon} size={14} className="text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t(section.labelKey as never)}</span>
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {section.items.map((item, index) => (
              <div key={item.key}
                className={`flex items-start gap-3 px-4 py-3.5 ${index < section.items.length - 1 ? "border-b border-border" : ""}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{t(item.titleKey as never)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(item.descKey as never)}</p>
                </div>
                <Toggle checked={getValue(item.key)} onChange={() => setNotification(item.key, !getValue(item.key))} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Quiet Hours */}
      <div className="bg-muted/50 rounded-2xl p-4">
        <h3 className="font-semibold text-sm text-foreground">{t("quietHours")}</h3>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t("quietHoursDesc")}</p>
        {mounted && prefs?.quiet_hours?.enabled && prefs.quiet_hours.start && (
          <p className="text-xs text-primary font-medium mt-2">
            {prefs.quiet_hours.start} – {prefs.quiet_hours.end}
          </p>
        )}
        <Button variant="outline" size="sm" className="mt-3 rounded-xl" onClick={() => {
          setQhEnabled(prefs?.quiet_hours?.enabled ?? false);
          setQhStart(prefs?.quiet_hours?.start ?? "22:00");
          setQhEnd(prefs?.quiet_hours?.end ?? "07:00");
          setQuietOpen(true);
        }}>
          {t("setQuietHours")}
        </Button>
      </div>

      {/* Important Note */}
      <div className="bg-warning/10 border border-warning/20 rounded-2xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="alert" size={16} className="text-warning shrink-0" />
          <span className="text-xs font-semibold text-warning">{t("importantNote")}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{t("importantNoteDesc")}</p>
      </div>

      {/* Quiet Hours Modal */}
      <Modal open={quietOpen} onClose={() => setQuietOpen(false)} title={t("quietHours")}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{t("quietHours")}</span>
            <Toggle checked={qhEnabled} onChange={() => setQhEnabled(!qhEnabled)} />
          </div>
          {qhEnabled && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Start</label>
                <input type="time" value={qhStart} onChange={(e) => setQhStart(e.target.value)}
                  className="w-full h-10 px-3 bg-bg border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">End</label>
                <input type="time" value={qhEnd} onChange={(e) => setQhEnd(e.target.value)}
                  className="w-full h-10 px-3 bg-bg border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="md" onClick={() => setQuietOpen(false)}>{tCommon("cancel")}</Button>
            <Button variant="primary" size="md" onClick={handleSetQuietHours}>{tCommon("save")}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
