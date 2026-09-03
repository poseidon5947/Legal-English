"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { LanguageToggle } from "@/components/language-toggle";
import { useLocale } from "@/components/locale-provider";
import { categoryLabel } from "@/lib/i18n";
import { HERO_VIDEO, IMAGES } from "@/lib/media";
import { CATEGORIES } from "@/lib/types";

export default function Home() {
  const [videoReady, setVideoReady] = useState(false);
  const { locale, t } = useLocale();
  const features = [
    { n: "01", title: t("feat1Title"), body: t("feat1Body"), image: IMAGES.landingOne },
    { n: "02", title: t("feat2Title"), body: t("feat2Body"), image: IMAGES.landingTwo },
    { n: "03", title: t("feat3Title"), body: t("feat3Body"), image: IMAGES.landingThree },
  ];
  const steps = [
    { title: t("step1Title"), body: t("step1Body") },
    { title: t("step2Title"), body: t("step2Body") },
    { title: t("step3Title"), body: t("step3Body") },
    { title: t("step4Title"), body: t("step4Body") },
  ];
  const categoryBody: Record<string, string> = {
    Contracts: t("categoryContractsBody"),
    "Corporate Law": t("categoryCorporateBody"),
    "Employment Law": t("categoryEmploymentBody"),
  };
  const faqs = [
    { q: t("faqQ1"), a: t("faqA1") },
    { q: t("faqQ2"), a: t("faqA2") },
    { q: t("faqQ3"), a: t("faqA3") },
    { q: t("faqQ4"), a: t("faqA4") },
  ];
  return (
    <main className="landing">
      <header className="landing-nav">
        <BrandMark />
        <div className="landing-nav-links">
          <a href="#features">{t("navFeatures")}</a>
          <a href="#how-it-works">{t("navHowItWorks")}</a>
          <a href="#pricing">{t("navPricing")}</a>
          <a href="#faq">{t("navFaq")}</a>
          <LanguageToggle />
          <Link href="/review">{t("landingWalkthrough")}</Link>
          <Link className="primary inline" href="/login">
            {t("enterAlpha")}
          </Link>
        </div>
      </header>
      <section className="landing-hero">
        <div className="hero-photo">
          <div className="hero-slides" aria-hidden="true">
            <img src={IMAGES.heroSlideA} alt="" />
            <img src={IMAGES.heroSlideB} alt="" />
            <img src={IMAGES.heroSlideC} alt="" />
          </div>
          <video
            autoPlay
            muted
            loop
            playsInline
            className={videoReady ? "is-live" : ""}
            onCanPlay={() => setVideoReady(true)}
            onError={() => setVideoReady(false)}
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">{t("landingEyebrow")}</p>
          <h1>
            {t("landingTitle")}
            <em>{t("landingTitleEm")}</em>
          </h1>
          <p className="lead">{t("landingLead")}</p>
          <div className="hero-actions">
            <Link className="primary" href="/login">
              {t("reviewAlpha")}
            </Link>
            <Link className="ghost" href="/review">
              {t("twelveMin")}
            </Link>
          </div>
        </div>
      </section>
      <ul className="proof-row">
        <li>
          <strong>30</strong>
          <span>{t("proofTerms")}</span>
        </li>
        <li>
          <strong>30</strong>
          <span>{t("proofQuizzes")}</span>
        </li>
        <li>
          <strong>3</strong>
          <span>{t("proofAccounts")}</span>
        </li>
        <li>
          <strong>0</strong>
          <span>{t("proofSecurity")}</span>
        </li>
      </ul>
      <section className="landing-grid" id="features">
        {features.map((feature) => (
          <article className="media-card" key={feature.n}>
            <div className="card-media">
              <img src={feature.image} alt="" />
            </div>
            <span>{feature.n}</span>
            <h2>{feature.title}</h2>
            <p>{feature.body}</p>
          </article>
        ))}
      </section>

      <section className="landing-section" id="how-it-works">
        <div className="landing-section-heading">
          <span className="eyebrow">{t("howItWorksEyebrow")}</span>
          <h2>{t("howItWorksTitle")}</h2>
          <p>{t("howItWorksLead")}</p>
        </div>
        <div className="step-grid">
          {steps.map((step, index) => (
            <article className="media-card" key={step.title}>
              <b>{index + 1}</b>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

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

      <section className="landing-section" id="pricing">
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

      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <BrandMark className="light" />
            <p>{t("footerTagline")}</p>
          </div>
          <nav className="footer-nav">
            <div>
              <span>{t("footerProductHeading")}</span>
              <a href="#features">{t("navFeatures")}</a>
              <a href="#how-it-works">{t("navHowItWorks")}</a>
              <a href="#pricing">{t("navPricing")}</a>
              <a href="#faq">{t("navFaq")}</a>
            </div>
            <div>
              <span>{t("footerAccountHeading")}</span>
              <Link href="/login">{t("enterAlpha")}</Link>
              <Link href="/review">{t("landingWalkthrough")}</Link>
            </div>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>{t("footerCopyright", { year: new Date().getFullYear() })}</span>
          <span>{t("footerPrivacyNote")}</span>
        </div>
      </footer>
    </main>
  );
}
