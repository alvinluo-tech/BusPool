"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface LevelConfig {
  key: string;
  bg: string;
  border: string;
  icon: string;
  iconColor: string;
  note?: string;
}

interface EarnLoseItem {
  icon: string;
  key: string;
  color: string;
  score: string;
}

export default function ReputationPage() {
  const t = useTranslations("reputation");

  const levels: LevelConfig[] = [
    {
      key: "excellent",
      bg: "bg-success/10",
      border: "border-success/20",
      icon: "star",
      iconColor: "text-success",
    },
    {
      key: "good",
      bg: "bg-primary/10",
      border: "border-primary/20",
      icon: "shield",
      iconColor: "text-primary",
    },
    {
      key: "fair",
      bg: "bg-warning/10",
      border: "border-warning/20",
      icon: "alert",
      iconColor: "text-warning",
    },
    {
      key: "restricted",
      bg: "bg-destructive/10",
      border: "border-destructive/20",
      icon: "x",
      iconColor: "text-destructive",
      note: "levelRestrictedNote",
    },
  ];

  const earnLoseItems: EarnLoseItem[] = [
    { icon: "upload", key: "earnUploadValid", color: "text-success", score: "+2" },
    { icon: "upload", key: "loseUploadInvalid", color: "text-destructive", score: "-10" },
    { icon: "upload", key: "loseUploadScanned", color: "text-destructive", score: "-20" },
    { icon: "check", key: "earnAppeal", color: "text-success", score: "+5" },
  ];

  const getLevelLabelKey = (
    key: string
  ): "levelExcellent" | "levelGood" | "levelFair" | "levelRestricted" => {
    const map: Record<string, "levelExcellent" | "levelGood" | "levelFair" | "levelRestricted"> = {
      excellent: "levelExcellent",
      good: "levelGood",
      fair: "levelFair",
      restricted: "levelRestricted",
    };
    return map[key] || "levelFair";
  };

  const getLevelRangeKey = (
    key: string
  ): "levelExcellentRange" | "levelGoodRange" | "levelFairRange" | "levelRestrictedRange" => {
    const map: Record<
      string,
      "levelExcellentRange" | "levelGoodRange" | "levelFairRange" | "levelRestrictedRange"
    > = {
      excellent: "levelExcellentRange",
      good: "levelGoodRange",
      fair: "levelFairRange",
      restricted: "levelRestrictedRange",
    };
    return map[key] || "levelFairRange";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <Icon name="chevron-left" size={20} className="text-foreground" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">{t("title")}</h1>
      </div>

      {/* Intro Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Icon
            name="info"
            size={20}
            className="text-primary shrink-0 mt-0.5"
          />
          <div>
            <h2 className="font-semibold text-foreground mb-1">
              {t("howItWorks")}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("howItWorksDesc")}
            </p>
          </div>
        </div>
      </div>

      {/* Reputation Levels Section */}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
          {t("levels")}
        </p>
        <div className="space-y-2">
          {levels.map((level) => (
            <div
              key={level.key}
              className={`rounded-2xl p-4 border-2 ${level.bg} ${level.border}`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  name={level.icon as any}
                  size={22}
                  className={`${level.iconColor} shrink-0`}
                />
                <div>
                  <p className="font-semibold text-foreground">
                    {t(getLevelLabelKey(level.key))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(getLevelRangeKey(level.key))}
                  </p>
                </div>
              </div>
              {level.note && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-xs text-destructive font-medium">
                    {t(level.note as any)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* How to Earn / Lose Points */}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
          {t("howToEarn")}
        </p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {earnLoseItems.map((item, index) => (
            <div
              key={item.key}
              className={`flex items-center justify-between px-4 py-3.5 ${
                index < earnLoseItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  name={item.icon as any}
                  size={18}
                  className={`${item.color} shrink-0`}
                />
                <span className="text-sm text-foreground">
                  {t(item.key as any)}
                </span>
              </div>
              <span
                className={`text-sm font-bold ${
                  item.score.startsWith("+") ? "text-success" : "text-destructive"
                }`}
              >
                {item.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-muted/50 rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-3">{t("tips")}</h3>
        <ul className="space-y-2">
          {([1, 2, 3] as const).map((num) => (
            <li
              key={num}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
              <span>{t(`tip${num}` as any)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
