"use client";

import Link from "next/link";
import { HeroImageFlow } from "@/components/hero-image-flow";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { LessonPreview } from "@/components/lesson-preview";
import { ScrollEffects } from "@/components/scroll-effects";
import { Photo } from "@/components/photo";
import { useLocale } from "@/components/locale-provider";
import { landingCopy } from "@/lib/landing-copy";
import { CtaDisclosure, PlanCards } from "@/components/plan-cards";
import { trackAction } from "@/lib/track";

/**
 * Home page. Section order and English copy follow the Landing Page
 * Implementation Brief v1.0 (7 Sep 2026) §3, sections 1–11:
 * hero · problem · solution · what each term can include · product example ·
 * launch content · built for legal professionals · pricing and free trial ·
 * trust · FAQ · final CTA. One primary action per section; the CTA always
 * goes to the Product-approved account/trial flow (/signup).
 */

type HomeIconName =
  | "arrow-right"
  | "bookmark"
  | "category-contracts"
  | "category-corporate"
  | "category-employment"
  | "contract-clipboard"
  | "courthouse"
  | "credit-card"
  | "feature-search"
  | "feature-timer"
  | "flame-stopwatch"
  | "globe"
  | "help"
  | "legal-scales"
  | "lock"
  | "open-book"
  | "people"
  | "search"
  | "shield-badge"
  | "speaker"
  | "user-avatar"
  | "workflow-book"
  | "workflow-chat"
  | "workflow-growth"
  | "workflow-quiz";

function HomeIcon({ name, className = "" }: { name: HomeIconName; className?: string }) {
  return <img className={`icon home-generated-icon ${className}`.trim()} src={`/home-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

// Same order as landingCopy.launch.items; these are the canonical MCD category names.
const categoryRoutes = ["Contracts", "Corporate Law", "Employment Law"] as const;
const categoryIcons: readonly HomeIconName[] = ["category-contracts", "category-corporate", "category-employment"];
// Photography: Unsplash, see public/home-assets/photos/CREDITS.txt
const categoryPhotos = ["/home-assets/photos/category-contracts.jpg", "/home-assets/photos/category-corporate.jpg", "/home-assets/photos/category-employment.jpg"];
const problemIcons: readonly HomeIconName[] = ["open-book", "workflow-chat", "globe"];
const componentIcons: readonly HomeIconName[] = ["open-book", "speaker", "workflow-chat", "contract-clipboard", "workflow-quiz", "shield-badge", "legal-scales", "globe"];
const builtForIcons: readonly HomeIconName[] = ["courthouse", "people", "flame-stopwatch"];
const tabIcons: readonly HomeIconName[] = ["open-book", "globe", "legal-scales", "help", "contract-clipboard", "bookmark"];

export default function Home() {
  const { locale } = useLocale();
  const c = landingCopy[locale];
  return (
    <main id="main" className="landing home-reference home-brief">
      <LandingHeader />
      <ScrollEffects />

      {/* 1 · Hero */}
      <section className="home-ref-hero">
        <div className="home-ref-copy hero-editorial" lang={locale}>
          <p className="hero-audience hero-brand-line"><span aria-hidden="true" />{c.hero.brandLine}</p>
          <h1><span className="hero-title-main">{c.hero.title}</span></h1>
          <p className="hero-editorial-lead">{c.hero.lead}</p>
          <div className="home-ref-actions hero-editorial-actions">
            <Link className="primary" href="/signup" onClick={() => trackAction("cta", "hero")}>{c.hero.cta}<HomeIcon name="arrow-right" /></Link>
          </div>
          <CtaDisclosure>{c.hero.ctaNote}</CtaDisclosure>
        </div>
        <div className="home-ref-product">
          <HeroImageFlow slides={c.hero.slides} />
        </div>
      </section>

      {/* 2 · The problem */}
      <section className="brief-problem" aria-labelledby="brief-problem-title" lang={locale}>
        <div className="home-ref-heading" data-reveal>
          <h2 id="brief-problem-title">{c.problem.title}</h2>
          <p>{c.problem.lead}</p>
        </div>
        <ul className="brief-problem-grid" data-reveal="stagger">
          {c.problem.items.map(([title, body], index) => (
            <li key={title}>
              <HomeIcon name={problemIcons[index]} />
              <strong>{title}</strong>
              <p>{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 3 · The solution */}
      <section className="brief-solution" aria-labelledby="brief-solution-title" lang={locale} data-reveal>
        <div>
          <h2 id="brief-solution-title">{c.solution.title}</h2>
          <p>{c.solution.lead}</p>
        </div>
      </section>

      {/* 4 · What each term can include */}
      <section className="brief-components" aria-labelledby="brief-components-title" lang={locale}>
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.components.eyebrow}</span>
          <h2 id="brief-components-title">{c.components.title}</h2>
        </div>
        <ul className="brief-components-grid" data-reveal="stagger">
          {c.components.items.map(([name, description], index) => (
            <li key={name}>
              <HomeIcon name={componentIcons[index]} />
              <div>
                <strong lang="en">{name}</strong>
                <small>{description}</small>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 5 · Product example (approved MCD content only) */}
      <section className="home-ref-learn brief-example" id="how-it-works" aria-labelledby="brief-example-title" lang={locale}>
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.example.eyebrow}</span>
          <h2 id="brief-example-title">{c.example.title}</h2>
          <p>{c.example.lead}</p>
        </div>
        <LessonPreview locale={locale} tabIcons={tabIcons} renderIcon={({ name }) => <HomeIcon name={name as HomeIconName} />} />
      </section>

      {/* 6 · Launch content */}
      <section className="home-ref-categories brief-launch" aria-labelledby="brief-launch-title" lang={locale}>
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.launch.eyebrow}</span>
          <h2 id="brief-launch-title">{c.launch.title}</h2>
        </div>
        <div className="home-ref-category-grid" data-reveal="stagger">
          {c.launch.items.map((title, index) => (
            <Link href={`/terms?category=${encodeURIComponent(categoryRoutes[index])}`} key={title}>
              <Photo className="home-ref-category-photo" src={categoryPhotos[index]} size="card" />
              <div className="home-ref-category-body">
                <span>
                  <HomeIcon name={categoryIcons[index]} />
                </span>
                <strong>{title}</strong>
                <small className="brief-term-count">{c.launch.termsLabel}</small>
                <b>{c.launch.explore}</b>
              </div>
            </Link>
          ))}
        </div>
        <p className="brief-launch-note" data-reveal>{c.launch.note}</p>
      </section>

      {/* 7 · Built for legal professionals */}
      <section className="brief-built" aria-labelledby="brief-built-title" lang={locale}>
        <div className="brief-built-copy" data-reveal="left">
          <span className="eyebrow">{c.builtFor.eyebrow}</span>
          <h2 id="brief-built-title">{c.builtFor.title}</h2>
          <ul>
            {c.builtFor.items.map(([title, body], index) => (
              <li key={title}>
                <HomeIcon name={builtForIcons[index]} />
                <div>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <figure className="brief-built-photo" data-reveal>
          <Photo src="/home-assets/photos/practice-portrait.jpg" size="wide" sizes="(max-width: 900px) 100vw, 46vw" />
          <figcaption><span>{c.builtFor.photoTag}</span><strong>{c.builtFor.photoCaption}</strong></figcaption>
        </figure>
      </section>

      {/* 8 · Pricing and free trial */}
      <section className="home-ref-pricing brief-pricing" id="pricing" aria-labelledby="brief-pricing-title" lang={locale}>
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.pricing.eyebrow}</span>
          <h2 id="brief-pricing-title">{c.pricing.title}</h2>
        </div>
        <PlanCards locale={locale} placement="pricing" />
        <p className="home-ref-secure">
          <HomeIcon name="lock" />
          {c.pricing.secure} {c.pricing.rule}
        </p>
      </section>

      {/* 9 · Trust / brand authority */}
      <section className="brief-trust" aria-labelledby="brief-trust-title" lang={locale} data-reveal>
                  <img src="/brand/mpc-icon-extracted.png" width="60" height="60" alt="" />
        <div>
          <span className="eyebrow">{c.trust.eyebrow}</span>
          <h2 id="brief-trust-title">{c.trust.title}</h2>
          <p>{c.trust.body}</p>
        </div>
      </section>

      {/* 10 · FAQ */}
      <section className="brief-faq" id="faq" aria-labelledby="brief-faq-title" lang={locale}>
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.faq.eyebrow}</span>
          <h2 id="brief-faq-title">{c.faq.title}</h2>
        </div>
        <div className="faq-list" data-reveal>
          {c.faq.items.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 11 · Final CTA */}
      <section className="home-ref-cta brief-final" data-reveal lang={locale}>
        <span>
          <HomeIcon name="legal-scales" />
        </span>
        <div>
          <h2>{c.cta.title}</h2>
          <CtaDisclosure>{c.cta.note}</CtaDisclosure>
        </div>
        <Link className="primary" href="/signup" onClick={() => trackAction("cta", "final")}>
          {c.cta.button}
          <HomeIcon name="arrow-right" />
        </Link>
      </section>

      <LandingFooter />
    </main>
  );
}
