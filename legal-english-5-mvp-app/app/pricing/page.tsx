"use client";

import Link from "next/link";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";
import { IMAGES } from "@/lib/media";

export default function PricingPage() {
  const { t } = useLocale();
  const faqs = [
    { q: t("faqQ1"), a: t("faqA1") },
    { q: t("faqQ2"), a: t("faqA2") },
    { q: t("faqQ3"), a: t("faqA3") },
    { q: t("faqQ4"), a: t("faqA4") },
  ];
  return (
    <main className="landing">
      <LandingHeader />
      <section className="landing-section">
        <div className="landing-section-heading">
          <span className="eyebrow">{t("pricingEyebrow")}</span>
          <h2>{t("pricingTitle")}</h2>
          <p>{t("pricingLead")}</p>
        </div>
        <div className="plans">
          <article className="media-card">
            <div className="card-media">
              <img src={IMAGES.planMonth} alt="" />
            </div>
            <span>{t("monthly")}</span>
            <strong>{t("priceNote")}</strong>
            <p>{t("monthlyBody")}</p>
          </article>
          <article className="media-card">
            <div className="card-media">
              <img src={IMAGES.planYear} alt="" />
            </div>
            <span>{t("annual")}</span>
            <strong>{t("priceNote")}</strong>
            <p>{t("annualBody")}</p>
          </article>
        </div>
        <div className="pricing-cta">
          <Link className="primary" href="/login">
            {t("pricingCta")}
          </Link>
        </div>
      </section>
      <section className="landing-section" id="faq">
        <div className="landing-section-heading">
          <span className="eyebrow">{t("faqEyebrow")}</span>
          <h2>{t("faqTitle")}</h2>
          <p>{t("faqLead")}</p>
        </div>
        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}
