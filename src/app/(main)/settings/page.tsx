"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";

/* ─── Inline moon/svg icons not available in the Icon component ─── */

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

/* ─── Toggle Switch ─── */

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

/* ─── Reusable section components ─── */

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-6 mb-2">
      {children}
    </p>
  );
}

interface MenuItemProps {
  title: string;
  description: string;
  rightIcon?: IconName | "toggle" | "chevron";
  toggleChecked?: boolean;
  onToggle?: () => void;
  isDestructive?: boolean;
  isLast?: boolean;
}

function MenuItem({
  title,
  description,
  rightIcon,
  toggleChecked,
  onToggle,
  isDestructive = false,
  isLast = false,
}: MenuItemProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 ${
        !isLast ? "border-b border-border" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            isDestructive ? "text-destructive" : "text-foreground"
          }`}
        >
          {title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>

      {rightIcon === "toggle" && toggleChecked !== undefined && (
        <Toggle
          checked={toggleChecked}
          onChange={onToggle ?? (() => {})}
        />
      )}

      {(rightIcon === "chevron" || rightIcon === undefined) && (
        <Icon
          name="chevron-right"
          size={18}
          className="text-muted-foreground shrink-0"
        />
      )}
    </div>
  );
}

/* ─── Page ─── */

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { theme, setTheme, resolvedTheme } = useTheme();
  const locale = useLocale();
  const [analyticsOn, setAnalyticsOn] = useState(true);
  const [twoFactorOn, setTwoFactorOn] = useState(false);

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const currentLanguage =
    locale === "zh" ? "中文" : "English (UK)";

  const themeOptions = [
    {
      value: "light" as const,
      label: t("light"),
      icon: null,
      renderIcon: (className: string) => <SunIcon className={className} />,
    },
    {
      value: "dark" as const,
      label: t("dark"),
      icon: null,
      renderIcon: (className: string) => <MoonIcon className={className} />,
    },
    {
      value: "system" as const,
      label: t("system"),
      icon: "settings" as IconName,
      renderIcon: null,
    },
  ] as const;

  return (
    <div className="pb-8">
      {/* Header */}
      <h1 className="text-xl font-bold text-foreground">{t("title")}</h1>

      {/* ===== APPEARANCE ===== */}
      <SectionHeader>{t("appearance")}</SectionHeader>
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-sm font-semibold text-foreground">{t("theme")}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("themeDescription")}
        </p>

        <div className="grid grid-cols-3 gap-2 mt-3">
          {themeOptions.map((opt) => {
            const isSelected = currentTheme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`rounded-xl border-2 p-3 text-center transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted"
                }`}
              >
                {opt.renderIcon ? (
                  opt.renderIcon(`mx-auto ${isSelected ? "text-primary" : "text-muted-foreground"}`)
                ) : (
                  <Icon
                    name={opt.icon!}
                    size={24}
                    className={`mx-auto ${
                      isSelected ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                )}
                <p
                  className={`text-xs mt-1 font-medium ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {opt.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== LANGUAGE & REGION ===== */}
      <SectionHeader>{t("languageRegion")}</SectionHeader>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {t("language")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentLanguage}
            </p>
          </div>
          <Icon
            name="chevron-right"
            size={18}
            className="text-muted-foreground shrink-0"
          />
        </div>
      </div>

      {/* ===== PRIVACY & SECURITY ===== */}
      <SectionHeader>{t("privacySecurity")}</SectionHeader>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <MenuItem
          title={t("changePassword")}
          description={t("changePasswordDesc")}
          rightIcon="chevron"
        />
        <MenuItem
          title={t("twoFactor")}
          description={t("twoFactorDesc")}
          rightIcon="toggle"
          toggleChecked={twoFactorOn}
          onToggle={() => setTwoFactorOn(!twoFactorOn)}
        />
        <MenuItem
          title={t("activeSessions")}
          description={t("activeSessionsDesc")}
          rightIcon="chevron"
          isLast
        />
      </div>

      {/* ===== DATA & STORAGE ===== */}
      <SectionHeader>{t("dataStorage")}</SectionHeader>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <MenuItem
          title={t("downloadData")}
          description={t("downloadDataDesc")}
          rightIcon="chevron"
        />
        <MenuItem
          title={t("clearCache")}
          description={t("clearCacheDesc")}
          rightIcon="chevron"
        />
        <MenuItem
          title={t("analytics")}
          description={t("analyticsDesc")}
          rightIcon="toggle"
          toggleChecked={analyticsOn}
          onToggle={() => setAnalyticsOn(!analyticsOn)}
          isLast
        />
      </div>

      {/* ===== DANGER ZONE ===== */}
      <SectionHeader>
        <span className="text-destructive">{t("dangerZone")}</span>
      </SectionHeader>
      <div className="bg-card border border-destructive/20 rounded-2xl overflow-hidden">
        <MenuItem
          title={t("deactivateAccount")}
          description={t("deactivateAccountDesc")}
          rightIcon="chevron"
          isDestructive
        />
        <MenuItem
          title={t("deleteAccount")}
          description={t("deleteAccountDesc")}
          rightIcon="chevron"
          isDestructive
          isLast
        />
      </div>

      {/* ===== VERSION ===== */}
      <div className="bg-muted/50 rounded-2xl p-3 text-center mt-6">
        <p className="text-xs text-muted-foreground">{t("version")}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("versionDesc")}
        </p>
      </div>
    </div>
  );
}
