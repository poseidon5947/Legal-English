"use client";

import Link from "next/link";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";
import { Icon } from "@/components/ui-icons";

const pricingPlans = [
  {
    name: "7-Day Free Trial",
    price: "$0",
    period: "for 7 days",
    body: "Full access. No credit card.",
    cta: "Start Free Trial",
    features: ["Access all lessons", "Practice quizzes", "Track your progress", "Cancel anytime"],
  },
  {
    name: "Monthly Plan",
    price: "$9.99",
    period: "/month",
    body: "Cancel anytime.",
    cta: "Start Monthly Plan",
    popular: true,
    features: ["Everything in Free Trial", "Full library access", "Personalized progress", "Priority support"],
  },
  {
    name: "Annual Plan",
    price: "$79.99",
    period: "/year",
    body: "Best value. Save more.",
    cta: "Start Annual Plan",
    features: ["Everything in Monthly", "Save over 30%", "Early access to new content", "Cancel anytime"],
  },
];

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
        <div className="plan-feature-strip">
          <span>All plans include:</span>
          {["Full access", "All lessons", "Cancel anytime", "Secure payment"].map((item) => (
            <b key={item}>
              <Icon name={item === "Secure payment" ? "card" : item === "All lessons" ? "book" : "shield"} />
              {item}
            </b>
          ))}
        </div>
        <div className="plans pricing-plans">
          {pricingPlans.map((plan) => (
            <article className={`media-card pricing-plan-card ${plan.popular ? "popular" : ""}`} key={plan.name}>
              {plan.popular && <span className="popular-label">Most Popular</span>}
              <h3>{plan.name}</h3>
              <p>{plan.body}</p>
              <strong>
                {plan.price}
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
              <Link className={plan.popular ? "primary" : "ghost"} href="/login">
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
        <div className="guarantee-strip">
          <Icon name="shield" />
          <div>
            <strong>30-Day Money-Back Guarantee</strong>
            <p>Not satisfied? Get a full refund within 30 days of purchase.</p>
          </div>
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
