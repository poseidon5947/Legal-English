"use client";

import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { Le5Icon } from "@/components/le5-icon";
import { useLocale } from "@/components/locale-provider";
import { Photo } from "@/components/photo";
import { landingCopy } from "@/lib/landing-copy";
import Link from "next/link";

/**
 * /about — approved copy "Nosotros" (Textos Web, Part III / IMP-08): editor
 * hero, "How we review content" with three evidence points, and the four-step
 * process. Photography is P05/P06 (approved portrait) and P07 (editorial
 * process) from the Design Freeze Pack.
 */
export default function AboutPage() {
  const { t, locale } = useLocale();
  const c = landingCopy[locale];
  const steps = [
    { title: t("step1Title"), body: t("step1Body"), icon: "navigation/account" as const },
    { title: t("step2Title"), body: t("step2Body"), icon: "navigation/areas" as const },
    { title: t("step3Title"), body: t("step3Body"), icon: "content/quick-quiz" as const },
    { title: t("step4Title"), body: t("step4Body"), icon: "navigation/billing" as const },
  ];
  const points = [
    { text: t("aboutStudioPoint1"), icon: "content/definition" as const },
    { text: t("aboutStudioPoint2"), icon: "content/pronunciation" as const },
    { text: t("aboutStudioPoint3"), icon: "navigation/settings" as const },
  ];
  return (
    <main id="main" className="landing home-reference about-journey" lang={locale}>
      <LandingHeader />
      <section className="landing-section">
        <div className="about-showcase">
          <div>
            <span className="eyebrow">{t("aboutStudioEyebrow")}</span>
            <h1>{t("aboutStudioTitle")}</h1>
            <p>{t("aboutStudioBody")}</p>
            <Link className="primary inline" href="/#how-it-works">{c.hero.sample}</Link>
          </div>
          <figure className="about-photo-card">
            <Photo src="/home-assets/photos/about-pilar-portrait.jpg" size="card" priority alt={locale === "es" ? "María del Pilar Cruz, editora de Legal English 5." : "María del Pilar Cruz, editor of Legal English 5."} />
            <figcaption>
              <strong>MPC LAW STUDIO</strong>
              <span>{t("aboutStudioCaption")}</span>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="landing-section about-studio" id="studio">
        <figure className="about-studio-photo">
          <Photo src="/home-assets/photos/editorial-process.jpg" size="wide" alt="" />
          <figcaption>{t("aboutStudioCaption")}</figcaption>
        </figure>
        <div>
          <span className="eyebrow">{t("aboutEyebrow")}</span>
          <h2>{locale === "es" ? "Cómo revisamos el contenido" : "How we review content"}</h2>
          <p>{t("aboutBody2")}</p>
          <ul className="about-studio-points">
            {points.map((point) => (
              <li key={point.text}>
                <Le5Icon name={point.icon} size={22} />
                {point.text}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="landing-section" id="how-it-works">
        <div className="landing-section-heading">
          <span className="eyebrow">{t("howItWorksEyebrow")}</span>
          <h2>{t("aboutMethodTitle")}</h2>
          <p>{t("howItWorksLead")}</p>
        </div>
        <div className="step-grid">
          {steps.map((step, index) => (
            <article className="media-card" key={step.title}>
              <span className="step-icon">
                <Le5Icon name={step.icon} size={26} />
              </span>
              <b>{index + 1}</b>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}
