"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserPreferences, NotificationPreferences } from "@/types";

const defaultNotifications: NotificationPreferences = {
  ticketUsed: true,
  ticketExpiring: true,
  reputationChanges: true,
  reputationMilestones: true,
  lowReputationWarning: true,
  pointsReceived: true,
  appealUpdates: true,
  confirmationReminders: true,
  announcements: true,
};

function defaultPrefs(userId: string): UserPreferences {
  return {
    user_id: userId,
    notifications: defaultNotifications,
    analytics_enabled: true,
    quiet_hours: null,
    updated_at: new Date().toISOString(),
  };
}

export function useUserPreferences() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchPrefs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setPrefs(data as UserPreferences);
      } else {
        // Insert defaults
        const defaults = defaultPrefs(user.id);
        await supabase.from("user_preferences").upsert(defaults);
        setPrefs(defaults);
      }
      setLoading(false);
    };
    fetchPrefs();
  }, []);

  const update = useCallback(async (patch: Partial<UserPreferences>) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !prefs) return;

    const updated = { ...prefs, ...patch, updated_at: new Date().toISOString() };
    setPrefs(updated);
    await supabase.from("user_preferences").upsert(updated);
  }, [prefs]);

  const setNotification = useCallback(async (key: keyof NotificationPreferences, value: boolean) => {
    if (!prefs) return;
    const notifications = { ...prefs.notifications, [key]: value };
    await update({ notifications, user_id: prefs.user_id });
  }, [prefs, update]);

  const setAnalyticsEnabled = useCallback(async (enabled: boolean) => {
    await update({ analytics_enabled: enabled, user_id: prefs?.user_id ?? "" });
  }, [prefs, update]);

  const setQuietHours = useCallback(async (qh: UserPreferences["quiet_hours"]) => {
    await update({ quiet_hours: qh, user_id: prefs?.user_id ?? "" } as Partial<UserPreferences>);
  }, [prefs, update]);

  return { prefs, loading, update, setNotification, setAnalyticsEnabled, setQuietHours };
}
