"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { useLocale } from "@/components/locale-provider";

export function LandingFooter() {
  const { t } = useLocale();
  return (
    <footer className="landing-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <BrandMark className="light" />
          <p>{t("footerTagline")}</p>
        </div>
        <nav className="footer-nav">
          <div>
            <span>{t("footerProductHeading")}</span>
            <Link href="/sample-terms">{t("navSampleTerms")}</Link>
            <Link href="/pricing">{t("navPricing")}</Link>
            <Link href="/about">{t("navAbout")}</Link>
          </div>
          <div>
            <span>{t("footerAccountHeading")}</span>
            <Link href="/login">{t("enterAlpha")}</Link>
            <Link href="/review">{t("landingWalkthrough")}</Link>
          </div>
          <div>
            <span>{t("footerLegalHeading")}</span>
            <Link href="/privacy">{t("navPrivacy")}</Link>
            <Link href="/terms-of-service">{t("navTermsOfService")}</Link>
          </div>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>{t("footerCopyright", { year: new Date().getFullYear() })}</span>
        <span>{t("footerPrivacyNote")}</span>
      </div>
    </footer>
  );
}
