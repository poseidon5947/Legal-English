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
 * Approved editorial and commercial copy, reorganized following the September
 * design review: introduction, sample, practice areas, method, trust, pricing.
 * Detailed component descriptions remain available in the method disclosure.
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
const tabIcons: readonly HomeIconName[] = ["open-book", "globe", "legal-scales", "help", "contract-clipboard", "bookmark"];

export default function Home() {
  const { locale } = useLocale();
  const c = landingCopy[locale];
  return (
    <main id="main" className="landing home-reference home-brief home-journey">
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
            <a className="hero-sample-link" href="#how-it-works" onClick={() => trackAction("cta", "hero-sample")}>{c.hero.sample}<HomeIcon name="arrow-right" /></a>
          </div>
          <CtaDisclosure>{c.hero.ctaNote}</CtaDisclosure>
        </div>
        <div className="home-ref-product">
          <HeroImageFlow slides={c.hero.slides} />
        </div>
      </section>

      {/* Public lesson: experience the product directly after the introduction. */}
      <section className="home-ref-learn brief-example" id="how-it-works" aria-labelledby="brief-example-title" lang={locale} tabIndex={-1}>
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

      {/* One concise method section replaces repeated problem/solution blocks. */}
      <section className="brief-problem journey-method" aria-labelledby="brief-method-title" lang={locale}>
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.builtFor.eyebrow}</span>
          <h2 id="brief-method-title">{c.solution.title}</h2>
        </div>
        <ul className="brief-problem-grid" data-reveal="stagger">
          {c.problem.items.map(([title, body], index) => <li key={title}><HomeIcon name={problemIcons[index]} /><strong>{title}</strong><p>{body}</p></li>)}
        </ul>
        <details className="journey-components">
          <summary>{c.components.title}</summary>
          <ul className="brief-components-grid">
            {c.components.items.map(([name, description], index) => <li key={name}><HomeIcon name={componentIcons[index]} /><div><strong lang="en">{name}</strong><small>{description}</small></div></li>)}
          </ul>
        </details>
      </section>

      <section className="brief-trust" aria-labelledby="brief-trust-title" lang={locale} data-reveal>
        <img src="/brand/mpc-icon-extracted.png" width="60" height="60" alt="" />
        <div>
          <span className="eyebrow">{c.trust.eyebrow}</span>
          <h2 id="brief-trust-title">{c.trust.title}</h2>
          <p>{c.trust.body}</p>
          <Link href="/about">{locale === "es" ? "Conoce nuestro proceso editorial →" : "Meet the editor and explore our process →"}</Link>
        </div>
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
