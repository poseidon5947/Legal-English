"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { LanguageToggle } from "@/components/language-toggle";
import { useLocale } from "@/components/locale-provider";
import type { MessageKey } from "@/lib/i18n";

const LINKS: ReadonlyArray<readonly [string, MessageKey]> = [
  ["/sample-terms", "navSampleTerms"],
  ["/pricing", "navPricing"],
  ["/about", "navAbout"],
];

export function LandingHeader() {
  const { t } = useLocale();
  const path = usePathname();
  return (
    <header className="landing-nav">
      <Link href="/">
        <BrandMark />
      </Link>
      <div className="landing-nav-links">
        {LINKS.map(([href, key]) => (
          <Link key={href} href={href} className={path === href ? "active" : ""}>
            {t(key)}
          </Link>
        ))}
        <Link href="/review">{t("landingWalkthrough")}</Link>
        <LanguageToggle />
        <Link className="primary inline" href="/login">
          {t("enterAlpha")}
        </Link>
      </div>
    </header>
  );
}
