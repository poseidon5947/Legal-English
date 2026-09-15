"use client";

import Link from "next/link";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";
import { Photo } from "@/components/photo";
import { PlanCards } from "@/components/plan-cards";
import { landingCopy } from "@/lib/landing-copy";
import { trackAction } from "@/lib/track";
import { Icon } from "@/components/ui-icons";

/**
 * /pricing — approved copy "Precios en Inglés / en español" (Textos Web, Part
 * III). The trial conditions live here (and only here, IMP-05): monthly card
 * terms, the annual selection note, payment information and the eight FAQs.
 * Prices and routes come from the same PlanCards component as the home page.
 */
export default function PricingPage() {
  const { locale } = useLocale();
  const c = landingCopy[locale];
  return (
    <main id="main" className="landing home-reference home-brief">
      <LandingHeader />
      <section className="landing-section brief-pricing brief-pricing-page" aria-labelledby="pricing-title" lang={locale}>
        <div className="landing-section-heading">
          <span className="eyebrow">{c.pricing.eyebrow}</span>
          <h1 id="pricing-title">{c.pricing.title}</h1>
          <p>{c.pricing.intro}</p>
        </div>
        <PlanCards locale={locale} placement="pricing-page" />
        <p className="home-ref-secure">
          <Icon name="shield" />
          {c.pricing.payment}
        </p>
      </section>
      <section className="pricing-photo-band" aria-labelledby="pricing-trust-title" lang={locale}>
        <Photo src="/home-assets/photos/editorial-process.jpg" size="full" alt="" />
        <div>
          <span className="eyebrow">{c.trust.eyebrow}</span>
          <h2 id="pricing-trust-title">{c.trust.title}</h2>
          <p>{c.trust.body}</p>
        </div>
      </section>
      <section className="landing-section brief-faq" id="faq" aria-labelledby="pricing-faq-title" lang={locale}>
        <div className="landing-section-heading">
          <span className="eyebrow">{c.faq.eyebrow}</span>
          <h2 id="pricing-faq-title">{c.faq.title}</h2>
        </div>
        <div className="faq-layout">
          <div className="faq-list">
            {c.faq.items.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
          <Link className="faq-photo-card" href="/signup" onClick={() => trackAction("cta", "pricing-faq")}>
            <Photo src="/home-assets/photos/common-civil.jpg" size="card" alt="" />
            <span>
              <small>{c.pricing.monthly.trial}</small>
              <strong>{c.cta.button}</strong>
              <em>{c.pricing.monthly.terms}</em>
            </span>
          </Link>
        </div>
        <div className="pricing-cta">
          <Link className="primary" href="/signup" onClick={() => trackAction("cta", "pricing-final")}>
            {c.cta.button}
          </Link>
          <p className="cta-disclosure">{c.pricing.monthly.terms}</p>
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}
