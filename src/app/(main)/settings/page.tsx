"use client";

import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import type { IconName } from "@/components/ui/Icon";

/* ─── Inline sun/moon icons ─── */

function SunIcon({ className }: { className?: string }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

/* ─── Toggle Switch ─── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation() // 阻止冒泡到外层MenuItem的button
        onChange()
      }}
      className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-200 cursor-pointer ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-1"}`} />
    </div>
  )
}

/* ─── Section & MenuItem ─── */

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-6 mb-2">{children}</p>;
}

interface MenuItemProps {
  title: string;
  description: string;
  rightIcon?: IconName | "toggle" | "chevron";
  toggleChecked?: boolean;
  onToggle?: () => void;
  isDestructive?: boolean;
  isLast?: boolean;
  onClick?: () => void;
}

function MenuItem({ title, description, rightIcon, toggleChecked, onToggle, isDestructive = false, isLast = false, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={rightIcon === "toggle" ? onToggle : onClick}
      className={`flex items-center gap-3 px-4 py-3.5 w-full text-left ${!isLast ? "border-b border-border" : ""}`}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isDestructive ? "text-destructive" : "text-foreground"}`}>{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {rightIcon === "toggle" && toggleChecked !== undefined && <Toggle checked={toggleChecked} onChange={onToggle ?? (() => {})} />}
      {(rightIcon === "chevron" || rightIcon === undefined) && <Icon name="chevron-right" size={18} className="text-muted-foreground shrink-0" />}
    </button>
  );
}

/* ─── Modal ─── */

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

/* ─── Page ─── */

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const { theme, setTheme, resolvedTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const { prefs, setAnalyticsEnabled } = useUserPreferences();

  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const currentTheme = theme === "system" ? resolvedTheme : theme;

  // Modal states
  const [langOpen, setLangOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Deactivate state
  const [deactError, setDeactError] = useState("");
  const [deactLoading, setDeactLoading] = useState(false);

  // Session info
  const [sessionInfo, setSessionInfo] = useState<{ email: string; createdAt: string; expiresAt: string } | null>(null);

  const handleChangeLanguage = (newLocale: string) => {
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=2592000;SameSite=Lax`;
    setLangOpen(false);
    router.refresh();
  };

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");
    if (newPassword.length < 6) { setPwError("Password must be at least 6 characters"); return; }
    setPwLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPwError(error.message);
    } else {
      setPwSuccess("Password updated successfully");
      setTimeout(() => { setPasswordOpen(false); setPwSuccess(""); setNewPassword(""); }, 1500);
    }
    setPwLoading(false);
  };

  const handleShowSession = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setSessionInfo({
        email: data.session.user.email ?? "",
        createdAt: new Date(data.session.user.created_at).toLocaleString(),
        expiresAt: new Date((data.session.expires_at ?? 0) * 1000).toLocaleString(),
      });
    }
    setSessionOpen(true);
  };

  const handleDownloadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profile, pointRecords, tickets, transactions] = await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).single(),
      supabase.from("point_records").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("tickets").select("*").eq("uploader_id", user.id),
      supabase.from("transactions").select("*").eq("borrower_id", user.id),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: profile.data,
      pointRecords: pointRecords.data,
      tickets: tickets.data,
      transactions: transactions.data,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `buspool-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearCache = () => {
    const doClear = () => {
      localStorage.clear();
      sessionStorage.clear();
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      toast.success(t("cacheCleared"), { id: "cache-clear" });
    };

    toast(t("clearCacheConfirmTitle"), {
      id: "cache-clear",
      description: t("clearCacheConfirmDesc"),
      duration: 8000,
      action: {
        label: tCommon("confirm"),
        onClick: () => doClear(),
      },
      cancel: {
        label: tCommon("cancel"),
        onClick: () => {},
      },
    });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") { setDeleteError('Type "DELETE" to confirm'); return; }
    setDeleteLoading(true);
    setDeleteError("");
    const supabase = createClient();
    // Call a server-side function or directly delete
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      setDeleteError(error.message);
      setDeleteLoading(false);
      return;
    }
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleDeactivate = async () => {
    setDeactLoading(true);
    setDeactError("");
    const supabase = createClient();
    const { error } = await supabase.rpc("deactivate_own_account");
    if (error) {
      setDeactError(error.message);
    } else {
      setDeactivateOpen(false);
      // Show success feedback
    }
    setDeactLoading(false);
  };

  const themeOptions = [
    { value: "light" as const, label: t("light"), renderIcon: (cn: string) => <SunIcon className={cn} /> },
    { value: "dark" as const, label: t("dark"), renderIcon: (cn: string) => <MoonIcon className={cn} /> },
    { value: "system" as const, label: t("system"), renderIcon: (cn: string) => <Icon name="settings" size={24} className={cn} /> },
  ] as const;

  const currentLanguageLabel = locale === "zh" ? "中文" : "English (UK)";

  return (
    <div className="pb-8">
      <h1 className="text-xl font-bold text-foreground">{t("title")}</h1>

      {/* ===== APPEARANCE ===== */}
      <SectionHeader>{t("appearance")}</SectionHeader>
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-sm font-semibold text-foreground">{t("theme")}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{t("themeDescription")}</p>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {themeOptions.map((opt) => {
            const sel = mounted && theme === opt.value;
            return (
              <button key={opt.value} onClick={() => setTheme(opt.value)}
                className={`rounded-xl border-2 p-3 text-center transition-colors ${sel ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}>
                {opt.renderIcon(sel ? "text-primary mx-auto" : "text-muted-foreground mx-auto")}
                <p className={`text-xs mt-1 font-medium ${sel ? "text-primary" : "text-foreground"}`}>{opt.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== LANGUAGE & REGION ===== */}
      <SectionHeader>{t("languageRegion")}</SectionHeader>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <MenuItem title={t("language")} description={currentLanguageLabel} isLast onClick={() => setLangOpen(true)} />
      </div>

      {/* ===== PRIVACY & SECURITY ===== */}
      <SectionHeader>{t("privacySecurity")}</SectionHeader>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <MenuItem title={t("changePassword")} description={t("changePasswordDesc")} onClick={() => setPasswordOpen(true)} />
        <MenuItem title={t("twoFactor")} description={t("twoFactorDesc")} rightIcon="toggle" toggleChecked={false} />
        <MenuItem title={t("activeSessions")} description={t("activeSessionsDesc")} onClick={handleShowSession} isLast />
      </div>

      {/* ===== DATA & STORAGE ===== */}
      <SectionHeader>{t("dataStorage")}</SectionHeader>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <MenuItem title={t("downloadData")} description={t("downloadDataDesc")} onClick={handleDownloadData} />
        <MenuItem title={t("clearCache")} description={t("clearCacheDesc")} onClick={handleClearCache} />
        <MenuItem
          title={t("analytics")} description={t("analyticsDesc")}
          rightIcon="toggle"
          toggleChecked={mounted ? (prefs?.analytics_enabled ?? true) : true}
          onToggle={() => setAnalyticsEnabled(!(prefs?.analytics_enabled ?? true))}
          isLast
        />
      </div>

      {/* ===== DANGER ZONE ===== */}
      <SectionHeader><span className="text-destructive">{t("dangerZone")}</span></SectionHeader>
      <div className="bg-card border border-destructive/20 rounded-2xl overflow-hidden">
        <MenuItem title={t("deactivateAccount")} description={t("deactivateAccountDesc")} isDestructive onClick={() => setDeactivateOpen(true)} />
        <MenuItem title={t("deleteAccount")} description={t("deleteAccountDesc")} isDestructive isLast onClick={() => setDeleteOpen(true)} />
      </div>

      {/* ===== VERSION ===== */}
      <div className="bg-muted/50 rounded-2xl p-3 text-center mt-6">
        <p className="text-xs text-muted-foreground">{t("version")}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{t("versionDesc")}</p>
      </div>

      {/* ===== MODALS ===== */}

      {/* Language Picker */}
      <Modal open={langOpen} onClose={() => setLangOpen(false)} title={t("language")}>
        <div className="space-y-2">
          {[{ value: "en", label: "English (UK)" }, { value: "zh", label: "中文" }].map((l) => (
            <button key={l.value} onClick={() => handleChangeLanguage(l.value)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border-2 transition-colors ${locale === l.value ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:bg-muted"}`}>
              {l.label}
            </button>
          ))}
        </div>
      </Modal>

      {/* Change Password */}
      <Modal open={passwordOpen} onClose={() => setPasswordOpen(false)} title={t("changePassword")}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("newPassword")}</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-10 px-3 bg-bg border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          {pwError && <p className="text-xs text-destructive">{pwError}</p>}
          {pwSuccess && <p className="text-xs text-success">{pwSuccess}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="md" onClick={() => setPasswordOpen(false)}>{tCommon("cancel")}</Button>
            <Button variant="primary" size="md" onClick={handleChangePassword} loading={pwLoading}>{tCommon("save")}</Button>
          </div>
        </div>
      </Modal>

      {/* Active Sessions */}
      <Modal open={sessionOpen} onClose={() => setSessionOpen(false)} title={t("activeSessions")}>
        {sessionInfo ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Email:</span> {sessionInfo.email}</p>
            <p><span className="font-medium text-foreground">Created:</span> {sessionInfo.createdAt}</p>
            <p><span className="font-medium text-foreground">Expires:</span> {sessionInfo.expiresAt}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
        )}
        <div className="flex justify-end mt-4">
          <Button variant="outline" size="md" onClick={() => setSessionOpen(false)}>{tCommon("cancel")}</Button>
        </div>
      </Modal>

      {/* Deactivate Account */}
      <Modal open={deactivateOpen} onClose={() => setDeactivateOpen(false)} title={t("deactivateAccount")}>
        <p className="text-sm text-muted-foreground mb-4">{t("deactivateAccountDesc")}</p>
        {deactError && <p className="text-xs text-destructive mb-2">{deactError}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="md" onClick={() => setDeactivateOpen(false)}>{tCommon("cancel")}</Button>
          <Button variant="destructive" size="md" onClick={handleDeactivate} loading={deactLoading}>{tCommon("confirm")}</Button>
        </div>
      </Modal>

      {/* Delete Account */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title={t("deleteAccount")}>
        <p className="text-sm text-muted-foreground mb-4">{t("deleteAccountDesc")}</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Type &quot;DELETE&quot; to confirm</label>
            <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full h-10 px-3 bg-bg border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:border-destructive" />
          </div>
          {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="md" onClick={() => setDeleteOpen(false)}>{tCommon("cancel")}</Button>
            <Button variant="destructive" size="md" onClick={handleDeleteAccount} loading={deleteLoading}>{tCommon("confirm")}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
