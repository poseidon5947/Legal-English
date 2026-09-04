"use client";

import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";
import { PRIVACY_SECTIONS } from "@/lib/legal-content";

export default function PrivacyPage() {
  const { locale, t } = useLocale();
  return (
    <main className="landing home-reference">
      <LandingHeader />
      <section className="landing-section legal-page">
        <div className="landing-section-heading">
          <span className="eyebrow">{t("privacyPageEyebrow")}</span>
          <h2>{t("privacyPageTitle")}</h2>
          <p>{t("privacyPageLead")}</p>
        </div>
        <div className="legal-body">
          {PRIVACY_SECTIONS[locale].map((section) => (
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
