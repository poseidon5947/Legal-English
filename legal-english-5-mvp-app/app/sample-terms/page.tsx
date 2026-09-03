"use client";

import Link from "next/link";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";
import { categoryLabel } from "@/lib/i18n";
import { sampleTerms } from "@/lib/sample-terms";
import { CATEGORIES } from "@/lib/types";

export default function SampleTermsPage() {
  const { locale, t } = useLocale();
  const categoryBody: Record<string, string> = {
    Contracts: t("categoryContractsBody"),
    "Corporate Law": t("categoryCorporateBody"),
    "Employment Law": t("categoryEmploymentBody"),
  };
  return (
    <main className="landing">
      <LandingHeader />
      <section className="landing-section">
        <div className="landing-section-heading">
          <span className="eyebrow">{t("categoriesEyebrow")}</span>
          <h2>{t("categoriesTitle")}</h2>
          <p>{t("categoriesLead")}</p>
        </div>
        <div className="category-cards">
          {CATEGORIES.map((category) => (
            <article className="media-card" key={category}>
              <span>{category}</span>
              <h3>{categoryLabel(locale, category)}</h3>
              <p>{categoryBody[category]}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="landing-section">
        <div className="landing-section-heading">
          <span className="eyebrow">{t("sampleTermsEyebrow")}</span>
          <h2>{t("sampleTermsTitle")}</h2>
          <p>{t("sampleTermsLead")}</p>
        </div>
        <div className="sample-term-list">
          {sampleTerms.map((term) => (
            <article className="media-card sample-term-card" key={term.id}>
              <span className="eyebrow">{categoryLabel(locale, term.category)}</span>
              <h2>{term.term}</h2>
              <p className="translation large">{term.spanishEquivalent}</p>
              <p className="lead">{term.definition}</p>
              {term.civilLawEquivalent && (
                <p className="muted">
                  <strong>{t("sampleTermsCivilLaw")}:</strong> {term.civilLawEquivalent}
                </p>
              )}
              {term.spanishSpeakerAlert && (
                <div className="alert-box">
                  <h3>{t("sampleTermsAlert")}</h3>
                  <p>{term.spanishSpeakerAlert}</p>
                </div>
              )}
              {term.useItWith.length > 0 && (
                <div>
                  <h3>{t("useItWith")}</h3>
                  <div className="chips">
                    {term.useItWith.map((item) => (
                      <span key={item.id}>{item.expression}</span>
                    ))}
                  </div>
                </div>
              )}
              {term.inContext && (
                <div>
                  <h3>{t("inContext")}</h3>
                  <blockquote>{term.inContext.exampleText}</blockquote>
                </div>
              )}
            </article>
          ))}
        </div>
        <div className="pricing-cta">
          <Link className="primary" href="/login">
            {t("sampleTermsCta")}
          </Link>
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}
