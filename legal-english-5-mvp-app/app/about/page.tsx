"use client";

import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";
import { Icon } from "@/components/ui-icons";

export default function AboutPage() {
  const { t } = useLocale();
  const steps = [
    { title: t("step1Title"), body: t("step1Body") },
    { title: t("step2Title"), body: t("step2Body") },
    { title: t("step3Title"), body: t("step3Body") },
    { title: t("step4Title"), body: t("step4Body") },
  ];
  return (
    <main className="landing">
      <LandingHeader />
      <section className="landing-section">
        <div className="about-showcase">
          <div>
            <span className="eyebrow">{t("aboutEyebrow")}</span>
            <h2>{t("aboutTitle")}</h2>
            <p>{t("aboutLead")}</p>
            <p>{t("aboutBody2")}</p>
          </div>
          <figure>
            <Icon name="scales" />
            <figcaption>
              <strong>Legal English 5</strong>
              <span>One source of truth for terms, quizzes, audio, and progress.</span>
            </figcaption>
          </figure>
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
