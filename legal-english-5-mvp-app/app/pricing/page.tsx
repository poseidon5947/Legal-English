"use client";

import Link from "next/link";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";
import { landingCopy, PLAN_PRICES } from "@/lib/landing-copy";
import { Icon } from "@/components/ui-icons";

const prices = PLAN_PRICES;

export default function PricingPage() {
  const { t, locale } = useLocale();
  const c = landingCopy[locale].pricing;
  const faqs = [
    { q: t("faqQ1"), a: t("faqA1") },
    { q: t("faqQ2"), a: t("faqA2") },
    { q: t("faqQ3"), a: t("faqA3") },
    { q: t("faqQ4"), a: t("faqA4") },
  ];
  return (
    <main className="landing home-reference">
      <LandingHeader />
      <section className="landing-section">
        <div className="landing-section-heading">
          <span className="eyebrow">{t("pricingEyebrow")}</span>
          <h2>{t("pricingTitle")}</h2>
          <p>{t("pricingLead")}</p>
        </div>
        <div className="plan-feature-strip">
          <span>{c.include}</span>
          {c.includeItems.map((item, index) => (
            <b key={item}>
              <Icon name={index === 3 ? "card" : index === 1 ? "book" : "shield"} />
              {item}
            </b>
          ))}
        </div>
        <div className="plans pricing-plans">
          {c.plans.map((plan, index) => (
            <article className={`media-card pricing-plan-card ${index === 1 ? "popular" : ""}`} key={plan.name}>
              {index === 1 && <span className="popular-label">{c.mostPopular}</span>}
              <h3>{plan.name}</h3>
              <p>{plan.body}</p>
              <strong>
                {prices[index]}
                <small>{plan.period}</small>
              </strong>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Icon name="shield" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link className={index === 1 ? "primary" : "ghost"} href="/login">
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
        <div className="guarantee-strip">
          <Icon name="shield" />
          <div>
            <strong>{c.guaranteeTitle}</strong>
            <p>{c.guaranteeBody}</p>
          </div>
        </div>
        <div className="pricing-cta">
          <Link className="primary" href="/login">
            {t("pricingCta")}
          </Link>
        </div>
      </section>
      <section className="pricing-photo-band" aria-label={t("pricingBandTitle")}>
        <img src="/home-assets/photos/pricing-lecture.jpg" alt="" loading="lazy" />
        <div>
          <span className="eyebrow">{t("pricingBandEyebrow")}</span>
          <h2>{t("pricingBandTitle")}</h2>
          <p>{t("pricingBandBody")}</p>
        </div>
      </section>
      <section className="landing-section" id="faq">
        <div className="landing-section-heading">
          <span className="eyebrow">{t("faqEyebrow")}</span>
          <h2>{t("faqTitle")}</h2>
          <p>{t("faqLead")}</p>
        </div>
        <div className="faq-layout">
          <div className="faq-list">
            {faqs.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
          <Link className="faq-photo-card" href="/signup">
            <img src="/home-assets/photos/pricing-students.jpg" alt="" loading="lazy" />
            <span>
              <small>{t("faqPhotoTag")}</small>
              <strong>{t("faqPhotoTitle")}</strong>
              <em>{t("faqPhotoBody")}</em>
            </span>
          </Link>
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}
