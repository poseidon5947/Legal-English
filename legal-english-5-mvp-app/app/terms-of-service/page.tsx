"use client";

import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";
import { TERMS_SECTIONS } from "@/lib/legal-content";

export default function TermsOfServicePage() {
  const { locale, t } = useLocale();
  return (
    <main className="landing home-reference">
      <LandingHeader />
      <section className="landing-section legal-page">
        <figure className="legal-banner" aria-hidden="true">
          <img src="/home-assets/photos/tos-signature.jpg" alt="" />
        </figure>
        <div className="landing-section-heading">
          <span className="eyebrow">{t("termsPageEyebrow")}</span>
          <h2>{t("termsPageTitle")}</h2>
          <p>{t("termsPageLead")}</p>
        </div>
        <div className="legal-body">
          {TERMS_SECTIONS[locale].map((section) => (
            <section key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </section>
          ))}
          <p className="muted tiny legal-note">{t("legalDraftNote")}</p>
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}
