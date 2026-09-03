"use client";

import Link from "next/link";
import { useState } from "react";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";
import { HERO_VIDEO, IMAGES } from "@/lib/media";

export default function Home() {
  const [videoReady, setVideoReady] = useState(false);
  const { t } = useLocale();
  const features = [
    { n: "01", title: t("feat1Title"), body: t("feat1Body"), image: IMAGES.landingOne },
    { n: "02", title: t("feat2Title"), body: t("feat2Body"), image: IMAGES.landingTwo },
    { n: "03", title: t("feat3Title"), body: t("feat3Body"), image: IMAGES.landingThree },
  ];
  return (
    <main className="landing">
      <LandingHeader />
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
      <p className="landing-more-link">
        <Link href="/sample-terms">{t("sampleTermsCtaInline")} →</Link>
      </p>

      <section className="landing-section landing-cta-band">
        <div className="landing-section-heading">
          <span className="eyebrow">{t("pricingEyebrow")}</span>
          <h2>{t("pricingTitle")}</h2>
          <p>{t("pricingLead")}</p>
        </div>
        <div className="pricing-cta">
          <Link className="primary" href="/pricing">
            {t("navPricing")}
          </Link>
          <Link className="ghost" href="/about">
            {t("navAbout")}
          </Link>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
