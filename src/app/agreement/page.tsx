"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

interface SectionConfig {
  titleKey: string;
  icon: string;
  type: "content" | "items";
  itemKeys?: string[];
}

export default function AgreementPage() {
  const t = useTranslations("agreement");

  const sections: SectionConfig[] = [
    {
      titleKey: "section1Title",
      icon: "info",
      type: "content",
    },
    {
      titleKey: "section2Title",
      icon: "file-text",
      type: "content",
    },
    {
      titleKey: "section3Title",
      icon: "users",
      type: "items",
      itemKeys: ["section3Item1", "section3Item2", "section3Item3", "section3Item4"],
    },
    {
      titleKey: "section4Title",
      icon: "shield",
      type: "items",
      itemKeys: ["section4Item1", "section4Item2", "section4Item3"],
    },
    {
      titleKey: "section5Title",
      icon: "dollar",
      type: "items",
      itemKeys: ["section5Item1", "section5Item2", "section5Item3"],
    },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <Icon name="chevron-left" size={20} className="text-foreground" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">{t("title")}</h1>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-muted-foreground text-center">
          {t("lastUpdated", { date: "May 13, 2026" })}
        </p>

        {/* Welcome Card (Section 1 styled specially) */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Icon
              name="info"
              size={20}
              className="text-primary shrink-0 mt-0.5"
            />
            <div>
              <h2 className="font-semibold text-foreground mb-1">
                {t("section1Title")}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("section1Content")}
              </p>
            </div>
          </div>
        </div>

        {/* Section Cards (Sections 2-5) */}
        {sections.slice(1).map((section) => (
          <div
            key={section.titleKey}
            className="bg-card border border-border rounded-2xl p-5 shadow-level1"
          >
            <div className="flex items-start gap-3">
              <Icon
                name={section.icon as any}
                size={20}
                className="text-primary shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <h2 className="font-semibold text-foreground mb-2">
                  {t(section.titleKey as any)}
                </h2>
                {section.type === "content" ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`${section.titleKey.replace("Title", "Content")}` as any)}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {section.itemKeys?.map((itemKey) => (
                      <li
                        key={itemKey}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                            section.titleKey === "section3Title"
                              ? "bg-destructive"
                              : section.titleKey === "section4Title"
                                ? "bg-success"
                                : "bg-warning"
                          }`}
                        />
                        <span>{t(itemKey as any)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Section 6 — Contact Card */}
        <div className="bg-muted/50 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Icon
              name="help"
              size={20}
              className="text-primary shrink-0 mt-0.5"
            />
            <div>
              <h2 className="font-semibold text-foreground mb-1">
                {t("section6Title")}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {t("section6Content")}
              </p>
              <p className="text-sm text-primary font-medium">
                {t("contactEmail")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("contactHelp")}
              </p>
            </div>
          </div>
        </div>

        {/* Acknowledgment Bar */}
        <div className="bg-success/10 border border-success/20 rounded-2xl p-3 text-center">
          <p className="text-sm text-foreground">{t("acknowledgment")}</p>
        </div>

        {/* I Understand Button */}
        <Link href="/" className="block">
          <Button variant="primary" size="lg" className="w-full h-12 rounded-xl">
            {t("understand")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
