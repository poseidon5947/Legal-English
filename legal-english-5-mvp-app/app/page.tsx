"use client";

import Link from "next/link";
import { HeroImageFlow } from "@/components/hero-image-flow";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { LessonPreview } from "@/components/lesson-preview";
import { ScrollEffects } from "@/components/scroll-effects";
import { Photo } from "@/components/photo";
import { useLocale } from "@/components/locale-provider";
import { landingCopy, PLAN_PRICES } from "@/lib/landing-copy";

type HomeIconName =
  | "arrow-right"
  | "bookmark"
  | "category-contracts"
  | "category-corporate"
  | "category-employment"
  | "contract-clipboard"
  | "contract-clipboard-stat"
  | "courthouse"
  | "credit-card"
  | "feature-mobile"
  | "feature-progress"
  | "feature-search"
  | "feature-timer"
  | "flame-stopwatch"
  | "globe"
  | "growth-chart"
  | "help"
  | "legal-scales"
  | "legal-scales-stat"
  | "lock"
  | "open-book"
  | "people"
  | "search"
  | "shield-badge"
  | "shield-badge-stat"
  | "speaker"
  | "user-avatar"
  | "user-avatar-stat"
  | "workflow-book"
  | "workflow-chat"
  | "workflow-growth"
  | "workflow-quiz";

function HomeIcon({ name, className = "" }: { name: HomeIconName; className?: string }) {
  return <img className={`icon home-generated-icon ${className}`.trim()} src={`/home-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

const categoryIcons: readonly HomeIconName[] = ["category-contracts", "category-corporate", "category-employment"];
// Same order as landingCopy.categories.items; these are the canonical MCD category names.
const categoryRoutes = ["Contracts", "Corporate Law", "Employment Law"] as const;
const tabIcons: readonly HomeIconName[] = ["open-book", "globe", "legal-scales", "help", "contract-clipboard", "bookmark"];
const workflowIcons: readonly HomeIconName[] = ["workflow-book", "workflow-chat", "workflow-quiz", "workflow-growth"];
const featureIcons: readonly HomeIconName[] = ["feature-search", "feature-mobile", "feature-progress", "feature-timer"];
const statIcons: readonly HomeIconName[] = ["contract-clipboard-stat", "legal-scales-stat", "shield-badge-stat", "user-avatar-stat"];
// Photography: Unsplash, see public/home-assets/photos/CREDITS.txt
const categoryPhotos = ["/home-assets/photos/category-contracts.jpg", "/home-assets/photos/category-corporate.jpg", "/home-assets/photos/category-employment.jpg"];
const lifePhotos = ["/home-assets/photos/mosaic-documents.jpg", "/home-assets/photos/mosaic-portrait.jpg", "/home-assets/photos/mosaic-library.jpg"];
// Real-practice scenarios, one per canonical category (same order as categoryRoutes); the
// sample terms are real MCD entries so what the visitor sees is what the library teaches.
const scenarioPhotos = ["/home-assets/photos/scenario-negotiation.jpg", "/home-assets/photos/scenario-boardroom.jpg", "/home-assets/photos/scenario-onboarding.jpg"];
const scenarioTerms: ReadonlyArray<readonly string[]> = [
  ["binding", "consideration", "breach"],
  ["board of directors", "resolution", "share issuance"],
  ["employment agreement", "overtime", "workplace harassment"],
];
const homePrices = PLAN_PRICES;
const trustIcons: HomeIconName[] = ["open-book", "shield-badge", "globe", "lock"];

export default function Home() {
  const { locale } = useLocale();
  const c = landingCopy[locale];
  return (
    <main className="landing home-reference">
      <LandingHeader />
      <ScrollEffects />
      <section className="home-ref-hero">
        <div className="home-ref-copy">
          <h1>
            {c.hero.title1}
            <br />
            {c.hero.title2}
          </h1>
          <p>{c.hero.lead}</p>
          <div className="home-ref-actions">
            <Link className="primary" href="/login">
              {c.hero.cta}
              <HomeIcon name="arrow-right" />
            </Link>
            <Link className="ghost" href="/terms">
              {c.hero.explore}
            </Link>
          </div>
          <p className="home-ref-reassurance">{c.hero.reassurance}</p>
        </div>
        <div className="home-ref-product">
          <HeroImageFlow slides={c.hero.slides} />
        </div>
      </section>

      <section className="home-ref-trust" aria-label="Why Legal English 5">
        <ul data-reveal="stagger">
          {c.hero.trust.map(([title, body], index) => (
            <li key={title}>
              <HomeIcon name={trustIcons[index]} />
              <div>
                <strong>{title}</strong>
                <small>{body}</small>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-ref-categories">
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.categories.eyebrow}</span>
          <h2>{c.categories.title}</h2>
          <p>{c.categories.lead}</p>
        </div>
        <div className="home-ref-category-grid" data-reveal="stagger">
          {c.categories.items.map(([title, body], index) => (
            <Link href={`/terms?category=${encodeURIComponent(categoryRoutes[index])}`} key={title}>
              <Photo className="home-ref-category-photo" src={categoryPhotos[index]} size="card" />
              <div className="home-ref-category-body">
                <span>
                  <HomeIcon name={categoryIcons[index]} />
                </span>
                <strong>{title}</strong>
                <small>{body}</small>
                <b>{c.categories.explore}</b>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-ref-learn" id="how-it-works">
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.learn.eyebrow}</span>
          <h2>{c.learn.title}</h2>
          <p>{c.learn.lead}</p>
        </div>
        <LessonPreview copy={c.learn} locale={locale} tabIcons={tabIcons} renderIcon={({ name }) => <HomeIcon name={name as HomeIconName} />} />
      </section>

      <section className="home-ref-workflow">
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.workflow.eyebrow}</span>
          <h2>{c.workflow.title}</h2>
          <p>{c.workflow.lead}</p>
        </div>
        <figure className="home-ref-workflow-photo" data-reveal="left">
          <Photo src="/home-assets/photos/workflow-study.jpg" size="card" />
          <figcaption>
            <span>{c.workflow.photoTag}</span>
            <strong>{c.workflow.photoCaption}</strong>
          </figcaption>
        </figure>
        <div data-reveal="stagger">
          {c.workflow.steps.map(([title, body], index) => (
            <article key={title}>
              <b>{index + 1}</b>
              <span>
                <HomeIcon name={workflowIcons[index]} />
              </span>
              <strong>{title}</strong>
              <small>{body}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="home-ref-features">
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.features.eyebrow}</span>
          <h2>{c.features.title}</h2>
        </div>
        <div data-reveal="stagger">
          {c.features.items.map(([title, body], index) => (
            <article key={title}>
              <HomeIcon name={featureIcons[index]} />
              <strong>{title}</strong>
              <small>
                {index === 2 ? (
                  <>
                    {c.features.statusPrefix} <span className="dot-status new">{c.features.statusNew}</span>,{" "}
                    <span className="dot-status learning">{c.features.statusLearning}</span> {c.features.statusOr}{" "}
                    <span className="dot-status mastered">{c.features.statusMastered}</span>.
                  </>
                ) : (
                  body
                )}
              </small>
            </article>
          ))}
        </div>
      </section>

      <section className="home-ref-scenarios" aria-labelledby="home-scenarios-title">
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.scenarios.eyebrow}</span>
          <h2 id="home-scenarios-title">{c.scenarios.title}</h2>
          <p>{c.scenarios.lead}</p>
        </div>
        <div className="home-ref-scenario-grid" data-reveal="stagger">
          {c.scenarios.items.map(([title, body], index) => (
            <article className={`home-ref-scenario${index === 1 ? " reverse" : ""}`} key={title}>
              <figure>
                <Photo src={scenarioPhotos[index]} size="card" />
                <figcaption>
                  <HomeIcon name={categoryIcons[index]} />
                  {c.categories.items[index][0]}
                </figcaption>
              </figure>
              <div>
                <span className="home-ref-scenario-index">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
                <small>{c.scenarios.termsLabel}</small>
                <ul>
                  {scenarioTerms[index].map((term) => (
                    <li key={term}>{term}</li>
                  ))}
                </ul>
                <Link href={`/terms?category=${encodeURIComponent(categoryRoutes[index])}`}>{c.scenarios.explore}</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-ref-life">
        <div className="home-ref-life-copy" data-reveal="left">
          <span className="eyebrow">{c.life.eyebrow}</span>
          <h2>{c.life.title}</h2>
          <p>{c.life.lead}</p>
        </div>
        <div className="home-ref-life-mosaic" data-reveal="stagger">
          {lifePhotos.map((src, index) => (
            <figure key={src}>
              <Photo src={src} size="card" />
              <figcaption>{c.life.photos[index]}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="home-ref-proof">
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.proof.eyebrow}</span>
          <h2>{c.proof.title}</h2>
        </div>
        <div className="home-ref-proof-grid" data-reveal="stagger">
          {c.proof.quotes.map(([quote, name, role]) => (
            <article className={`home-ref-quote${c.proof.quotes.length === 1 ? " wide" : ""}`} key={name}>
              <img src="/home-assets/icons/le5-shield.png" alt="" aria-hidden="true" />
              <p>“{quote}”</p>
              <strong>{name}</strong>
              <small>{role}</small>
            </article>
          ))}
          {c.proof.stats.map(([value, label], index) => (
            <article className="home-ref-stat" key={label}>
              <HomeIcon name={statIcons[index]} />
              <strong data-count={value}>{value}</strong>
              <small>{label}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="home-ref-pricing" id="pricing">
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.pricing.eyebrow}</span>
          <h2>{c.pricing.title}</h2>
          <p>{c.pricing.lead}</p>
        </div>
        <div data-reveal="stagger">
          {c.pricing.plans.map((plan, index) => (
            <article className={index === 2 ? "best" : ""} key={plan.name}>
              {index === 2 && <img className="best-value-badge" src="/home-assets/badges/best-value.png" alt={c.pricing.bestValue} />}
              <h3>{plan.name}</h3>
              <strong>
                {homePrices[index]}
                {index === 2 && <small>{c.pricing.perYear}</small>}
                {index === 1 && <small>{c.pricing.perMonth}</small>}
              </strong>
              <ul>
                {plan.features.slice(0, 3).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link className={index === 1 ? "primary" : "ghost"} href="/login">
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
        <p className="home-ref-secure">
          <HomeIcon name="lock" />
          {c.pricing.secure}
        </p>
      </section>

      <section className="home-ref-cta" data-reveal>
        <span>
          <HomeIcon name="legal-scales" />
        </span>
        <div>
          <h2>{c.cta.title}</h2>
          <p>{c.cta.lead}</p>
        </div>
        <Link className="primary" href="/login">
          {c.cta.button}
          <HomeIcon name="arrow-right" />
        </Link>
      </section>

      <LandingFooter />
    </main>
  );
}
