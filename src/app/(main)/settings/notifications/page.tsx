"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import type { IconName } from "@/components/ui/Icon";

interface NotificationItem {
  key: string;
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

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-200 ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function NotificationsPage() {
  const t = useTranslations("settings");
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((section) => {
      section.items.forEach((item) => {
        initial[item.key] = item.defaultOn;
      });
    });
    return initial;
  });

  const toggleSwitch = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <h1 className="text-xl font-bold text-foreground">
        {t("notificationTitle")}
      </h1>

      {/* Description Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
        <h2 className="font-semibold text-sm text-foreground">
          {t("notificationDescription")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {t("notificationDescriptionText")}
        </p>
      </div>

      {/* Notification Sections */}
      {sections.map((section) => (
        <div key={section.labelKey}>
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-2 mt-1">
            <Icon
              name={section.icon}
              size={14}
              className="text-muted-foreground"
            />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t(section.labelKey as any)}
            </span>
          </div>

          {/* Notification Items */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {section.items.map((item, index) => (
              <div
                key={item.key}
                className={`flex items-start gap-3 px-4 py-3.5 ${
                  index < section.items.length - 1
                    ? "border-b border-border"
                    : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {t(item.titleKey as any)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {t(item.descKey as any)}
                  </p>
                </div>
                <Toggle
                  checked={toggles[item.key]}
                  onChange={() => toggleSwitch(item.key)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Quiet Hours */}
      <div className="bg-muted/50 rounded-2xl p-4">
        <h3 className="font-semibold text-sm text-foreground">
          {t("quietHours")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {t("quietHoursDesc")}
        </p>
        <Button variant="outline" size="sm" className="mt-3 rounded-xl">
          {t("setQuietHours")}
        </Button>
      </div>

      {/* Important Note */}
      <div className="bg-warning/10 border border-warning/20 rounded-2xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="alert" size={16} className="text-warning shrink-0" />
          <span className="text-xs font-semibold text-warning">
            {t("importantNote")}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("importantNoteDesc")}
        </p>
      </div>
    </div>
  );
}
