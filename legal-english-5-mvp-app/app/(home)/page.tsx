"use client";

import Link from "next/link";
import { ScenarioSlider } from "@/components/scenario-slider";
import { WorkflowPhoto } from "@/components/workflow-photo";
import { LearningJourney } from "@/components/learning-journey";
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
const featureIcons: readonly HomeIconName[] = ["feature-search", "feature-mobile", "feature-progress", "feature-timer"];
const statIcons: readonly HomeIconName[] = ["contract-clipboard-stat", "legal-scales-stat", "shield-badge-stat", "user-avatar-stat"];
// Photography: Unsplash, see public/home-assets/photos/CREDITS.txt
const categoryPhotos = ["/home-assets/photos/category-contracts.jpg", "/home-assets/photos/category-corporate.jpg", "/home-assets/photos/category-employment.jpg"];
const lifePhotos = ["/home-assets/photos/mosaic-documents.jpg", "/home-assets/photos/mosaic-portrait.jpg", "/home-assets/photos/mosaic-library.jpg"];
const homePrices = PLAN_PRICES;
const trustIcons: HomeIconName[] = ["open-book", "shield-badge", "globe", "lock"];

export default function Home() {
  const { locale } = useLocale();
  const c = landingCopy[locale];
  return (
    <main id="main" className="landing home-reference">
      <LandingHeader />
      <ScrollEffects />
      <section className="home-ref-hero">
        <div className="home-ref-copy hero-editorial" lang={locale}>
          <p className="hero-audience"><span aria-hidden="true" />{c.hero.audience}</p>
          <h1><span className="hero-title-main">{c.hero.title1}</span><span className="hero-title-accent">{c.hero.title2}</span></h1>
          <p className="hero-editorial-lead">{c.hero.lead}</p>
          <ul className="hero-highlights">
            {c.hero.highlights.map((benefit) => <li key={benefit}><svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>{benefit}</li>)}
          </ul>
          <div className="home-ref-actions hero-editorial-actions">
            <Link className="primary" href="/signup">{c.hero.cta}<HomeIcon name="arrow-right" /></Link>
            <Link className="hero-explore-link" href="/terms">{c.hero.explore}<span aria-hidden="true">↗</span></Link>
          </div>
          <p className="home-ref-reassurance hero-editorial-reassurance"><svg width="13" height="15" viewBox="0 0 16 18" aria-hidden="true"><path d="M8 1 14 3v5c0 4-3 7-6 9C5 15 2 12 2 8V3Z" fill="none" stroke="currentColor" strokeWidth="1.2" /><path d="m5 8 2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>{c.hero.reassurance}</p>
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
        <WorkflowPhoto tag={c.workflow.photoTag} caption={c.workflow.photoCaption} locale={locale} />
        <LearningJourney steps={c.workflow.steps} label={c.workflow.title} locale={locale} />
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
        <ScenarioSlider copy={c.scenarios} locale={locale} />
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

      <section className="home-ref-proof studio-proof" aria-labelledby="studio-proof-title" lang={locale}>
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.proof.eyebrow}</span>
          <h2 id="studio-proof-title">{c.proof.title}</h2>
        </div>
        <div className="studio-proof-content" data-reveal>
          {c.proof.quotes.map(([quote, name, role]) => {
            const emphasisIndex = quote.indexOf(c.proof.quoteEmphasis);
            return (
              <figure className="studio-note" key={name}>
                <figcaption className="studio-identity">
                  <img src="/home-assets/icons/le5-shield.png" width="60" height="72" alt="" />
                  <div><strong>{name}</strong><span>{role}</span></div>
                  <span className="studio-identity-rule" aria-hidden="true" />
                </figcaption>
                <blockquote className="studio-quotation">
                  <span className="studio-quote-mark" aria-hidden="true">“</span>
                  <p>{emphasisIndex < 0 ? quote : <>{quote.slice(0, emphasisIndex)}<strong>{c.proof.quoteEmphasis}</strong>{quote.slice(emphasisIndex + c.proof.quoteEmphasis.length)}</>}</p>
                </blockquote>
              </figure>
            );
          })}
          <dl className="studio-facts">
            {c.proof.stats.map(([value, label], index) => (
              <div className={`studio-fact${index > 1 ? " supporting" : ""}`} key={label}>
                <HomeIcon name={statIcons[index]} />
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
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
              <Link className={index === 1 ? "primary" : "ghost"} href={index === 0 ? "/signup" : `/signup?plan=${index === 1 ? "monthly" : "annual"}`}>
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
        <Link className="primary" href="/signup">
          {c.cta.button}
          <HomeIcon name="arrow-right" />
        </Link>
      </section>

      <LandingFooter />
    </main>
  );
}
