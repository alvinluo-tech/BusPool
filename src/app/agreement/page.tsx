"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

export default function AgreementPage() {
  const t = useTranslations("agreement");

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-lg mx-auto px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <Icon name="chevron-left" size={16} />
          {t("back")}
        </Link>

        <h1 className="text-[32px] font-bold text-foreground mb-6">{t("title")}</h1>

        <Card className="p-6 space-y-6 mb-8">
          {/* Section 1 */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">{t("section1Title")}</h2>
            <p className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-primary/30 pl-3">
              {t("section1Content")}
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">{t("section2Title")}</h2>
            <ul className="space-y-2">
              {["section2Item1", "section2Item2", "section2Item3", "section2Item4"].map((key) => (
                <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-destructive rounded-full mt-1.5 shrink-0" />
                  {t(key as never)}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">{t("section3Title")}</h2>
            <ul className="space-y-2">
              {["section3Item1", "section3Item2", "section3Item3", "section3Item4"].map((key) => (
                <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                  {t(key as never)}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">{t("section4Title")}</h2>
            <ul className="space-y-2">
              {["section4Item1", "section4Item2", "section4Item3"].map((key) => (
                <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-success rounded-full mt-1.5 shrink-0" />
                  {t(key as never)}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">{t("section5Title")}</h2>
            <ul className="space-y-2">
              {["section5Item1", "section5Item2", "section5Item3"].map((key) => (
                <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-warning rounded-full mt-1.5 shrink-0" />
                  {t(key as never)}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Link href="/">
          <Button variant="primary" size="lg" className="w-full">
            {t("understand")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
