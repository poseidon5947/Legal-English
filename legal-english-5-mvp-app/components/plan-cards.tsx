"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { landingCopy, PLAN_PRICES } from "@/lib/landing-copy";
import { trackAction } from "@/lib/track";

/**
 * Approved pricing (Landing Page Brief v1.0 §3.8 / §5), shared by the home
 * page and /pricing so both always display the same numbers and disclosures:
 *  - Monthly: COP $90,000/month, 7-day free trial, credit card required,
 *    automatic monthly conversion unless canceled before the trial ends.
 *  - Annual: COP $540,000/year shown as a 50% discount; there is no landing
 *    checkout CTA for it until Product confirms the annual purchase path — it
 *    is chosen from Billing after the trial starts.
 */

const priceFormat = { en: (n: number) => n.toLocaleString("en-US"), es: (n: number) => n.toLocaleString("es-CO") } as const;

export function formatCop(amount: number, locale: Locale) {
  return `COP $${priceFormat[locale](amount)}`;
}

function CardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 6.5h13" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 10h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function PlanCards({ locale, placement }: { locale: Locale; placement: string }) {
  const c = landingCopy[locale].pricing;
  return (
    <div className="brief-plans" data-reveal="stagger">
      <article className="brief-plan brief-plan-monthly">
        <h3>{c.monthly.name}</h3>
        <p className="brief-price"><strong>{formatCop(PLAN_PRICES.monthly, locale)}</strong><small>{c.perMonth}</small></p>
        <p className="brief-plan-trial">{c.monthly.trial}</p>
        <Link className="primary" href="/signup?plan=monthly" onClick={() => trackAction("cta", placement)}>{c.monthly.cta}</Link>
        <p className="cta-disclosure brief-plan-disclosure"><CardIcon />{c.monthly.terms}</p>
      </article>
      <article className="brief-plan brief-plan-annual">
        <h3>{c.annual.name}</h3>
        <p className="brief-price"><strong>{formatCop(PLAN_PRICES.annual, locale)}</strong><small>{c.perYear}</small></p>
        <p className="brief-plan-trial brief-plan-discount">{c.annual.discount}</p>
        <p className="brief-plan-terms">{c.annual.terms}</p>
        <p className="brief-plan-note">{c.annual.note}</p>
        <Link className="ghost" href="/signup?plan=annual" onClick={() => trackAction("cta", `${placement}-annual`)}>{c.annual.cta}</Link>
      </article>
    </div>
  );
}

export function CtaDisclosure({ children }: { children: React.ReactNode }) {
  return <p className="cta-disclosure"><CardIcon />{children}</p>;
}
