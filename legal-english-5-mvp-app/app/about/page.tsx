"use client";

import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";
import { Photo } from "@/components/photo";
import { Icon } from "@/components/ui-icons";
import Link from "next/link";

export default function AboutPage() {
  const { t, locale } = useLocale();
  const steps = [
    { title: t("step1Title"), body: t("step1Body") },
    { title: t("step2Title"), body: t("step2Body") },
    { title: t("step3Title"), body: t("step3Body") },
    { title: t("step4Title"), body: t("step4Body") },
  ];
  return (
    <main id="main" className="landing home-reference about-journey">
      <LandingHeader />
      <section className="landing-section">
        <div className="about-showcase">
          <div>
            <span className="eyebrow">{t("aboutStudioEyebrow")}</span>
            <h1>{t("aboutStudioTitle")}</h1>
            <p>{t("aboutStudioBody")}</p>
            <Link className="primary inline" href="/#how-it-works">{locale === "es" ? "Prueba una lección de muestra" : "Try a sample lesson"}</Link>
          </div>
          <figure className="about-photo-card">
            <Photo src="/home-assets/photos/about-library.jpg" size="card" priority />
            <figcaption>
              <strong>Legal English 5</strong>
              <span>{t("aboutStudioCaption")}</span>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="landing-section about-studio" id="studio">
        <figure className="about-studio-photo">
          <Photo src="/home-assets/photos/studio-boardroom.jpg" size="wide" />
          <figcaption>{t("aboutStudioCaption")}</figcaption>
        </figure>
        <div>
          <span className="eyebrow">{t("aboutEyebrow")}</span>
          <h2>{locale === "es" ? "Cómo revisamos el contenido" : "How we review content"}</h2>
          <p>{t("aboutBody2")}</p>
          <ul className="about-studio-points">
            <li>
              <Icon name="shield" />
              {t("aboutStudioPoint1")}
            </li>
            <li>
              <Icon name="speaker" />
              {t("aboutStudioPoint2")}
            </li>
            <li>
              <Icon name="lock" />
              {t("aboutStudioPoint3")}
            </li>
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
                <Icon name={index === 0 ? "mail" : index === 1 ? "book" : index === 2 ? "target" : "card"} />
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
