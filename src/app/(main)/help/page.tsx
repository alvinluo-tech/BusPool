"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState, useMemo } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import type { IconName } from "@/components/ui/Icon";

interface FaqItem {
  id: number;
  q: string;
  a: string;
}

interface Category {
  icon: IconName;
  key: string;
  titleKey: string;
  range: [number, number];
}

const categories: Category[] = [
  { icon: "help" as IconName, key: "gettingStarted", titleKey: "gettingStarted", range: [1, 3] },
  { icon: "tickets" as IconName, key: "usingTickets", titleKey: "usingTickets", range: [4, 6] },
  { icon: "share" as IconName, key: "sharingTickets", titleKey: "sharingTickets", range: [7, 9] },
  { icon: "shield" as IconName, key: "reputationSystem", titleKey: "reputationSystem", range: [10, 12] },
  { icon: "dollar" as IconName, key: "pointsWallet", titleKey: "pointsWallet", range: [13, 15] },
  { icon: "shield" as IconName, key: "safetyPrivacy", titleKey: "safetyPrivacy", range: [13, 15] },
];

export default function HelpPage() {
  const t = useTranslations("help");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["gettingStarted"]));
  const searchLower = searchQuery.toLowerCase().trim();

  const allFaqItems: FaqItem[] = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        q: t(`faq_${i + 1}_q` as any),
        a: t(`faq_${i + 1}_a` as any),
      })),
    [t]
  );

  const categoryMatchMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    if (!searchLower) {
      categories.forEach((cat) => {
        map[cat.key] = true;
      });
      return map;
    }
    categories.forEach((cat) => {
      const items = allFaqItems.slice(cat.range[0] - 1, cat.range[1]);
      map[cat.key] = items.some(
        (item) =>
          item.q.toLowerCase().includes(searchLower) ||
          item.a.toLowerCase().includes(searchLower)
      );
    });
    return map;
  }, [searchLower, allFaqItems]);

  const hasAnyResult = Object.values(categoryMatchMap).some(Boolean);

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <h1 className="text-xl font-bold text-foreground">{t("title")}</h1>

      {/* Search */}
      <div className="relative">
        <Icon
          name="search"
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-12 pr-4 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
        />
      </div>

      {/* FAQ Categories */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const catItems = allFaqItems.slice(cat.range[0] - 1, cat.range[1]);
          const isExpanded = expandedCategories.has(cat.key);
          const isVisible = !searchLower || categoryMatchMap[cat.key];

          if (!isVisible) return null;

          return (
            <div
              key={cat.key}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat.key)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                <Icon
                  name={cat.icon}
                  size={20}
                  className="text-muted-foreground shrink-0"
                />
                <span className="flex-1 text-sm font-semibold text-foreground">
                  {t(cat.titleKey as any)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {catItems.length}
                </span>
                <Icon
                  name="chevron-right"
                  size={18}
                  className={`text-muted-foreground shrink-0 transition-transform duration-200 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </button>

              {/* Expanded FAQ items */}
              {isExpanded && (
                <div className="border-t border-border">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-3 border-b border-border last:border-b-0"
                    >
                      <p className="font-semibold text-sm text-foreground">
                        {item.q}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No results state */}
      {searchLower && !hasAnyResult && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Icon name="search" size={40} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            {t("noResults", { query: searchQuery })}
          </p>
        </div>
      )}

      {/* Contact Support */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
        <h3 className="font-semibold text-sm text-foreground">
          {t("stillNeedHelp")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {t("stillNeedHelpDesc")}
        </p>
        <Button
          variant="primary"
          size="lg"
          className="w-full mt-3 rounded-xl"
        >
          {t("contactSupport")}
        </Button>
      </div>

      {/* Additional Resources */}
      <div className="bg-muted/50 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">
          {t("additionalResources")}
        </h3>
        <div className="space-y-1">
          <Link
            href="/reputation"
            className="flex items-center justify-between py-2"
          >
            <span className="text-sm text-foreground">
              {t("reputationGuide")}
            </span>
            <Icon
              name="chevron-right"
              size={18}
              className="text-muted-foreground"
            />
          </Link>
          <div className="border-b border-border" />
          <Link
            href="/agreement"
            className="flex items-center justify-between py-2"
          >
            <span className="text-sm text-foreground">
              {t("termsConditions")}
            </span>
            <Icon
              name="chevron-right"
              size={18}
              className="text-muted-foreground"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
