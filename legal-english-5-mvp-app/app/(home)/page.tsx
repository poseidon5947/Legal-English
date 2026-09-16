"use client";

import Link from "next/link";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { LessonPreview } from "@/components/lesson-preview";
import { ScrollEffects } from "@/components/scroll-effects";
import { Photo, photoSources } from "@/components/photo";
import { useLocale } from "@/components/locale-provider";
import { landingCopy } from "@/lib/landing-copy";
import { PlanCards } from "@/components/plan-cards";
import { Le5Icon, type Le5IconName } from "@/components/le5-icon";
import { trackAction } from "@/lib/track";

/**
 * Approved editorial and commercial copy, reorganized following the September
 * design review: introduction, sample, practice areas, method, trust, pricing.
 * Detailed component descriptions remain available in the method disclosure.
 */

/* D20 (16 Sep 2026): the Home renders only the approved SVG iconography
 * (Design Freeze Pack I01–I04). Every former PNG has been mapped to its
 * approved equivalent; CTA arrows are text glyphs. */
type HomeIconName = keyof typeof HOME_ICON;
const HOME_ICON = {
  "open-book": "content/definition",
  globe: "content/spanish-equivalent",
  "legal-scales": "content/civil-law-equivalent",
  help: "content/spanish-speaker-alert",
  "contract-clipboard": "content/use-it-with",
  bookmark: "content/in-context",
  speaker: "content/pronunciation",
  "in-context": "content/in-context",
  collocations: "content/use-it-with",
  "quick-quiz": "content/quick-quiz",
} as const satisfies Record<string, Le5IconName>;

function HomeIcon({ name, className = "" }: { name: HomeIconName; className?: string }) {
  return <Le5Icon name={HOME_ICON[name]} className={`icon home-generated-icon ${className}`.trim()} />;
}
function CtaArrow() {
  return <span className="cta-arrow" aria-hidden="true">→</span>;
}

// Same order as landingCopy.launch.items (the three Areas; internal keys stay as stored).
const categoryRoutes = ["Contracts", "Corporate Law", "Employment Law"] as const;
// Approved Area icons (Design Freeze Pack I02) and photography (P02 / P03 / P04, frozen crops).
const categoryIcons = ["areas/contracts", "areas/corporate-law", "areas/employment-law"] as const satisfies readonly Le5IconName[];
const categoryPhotos = ["/home-assets/photos/area-contracts.jpg", "/home-assets/photos/area-corporate.jpg", "/home-assets/photos/area-employment.jpg"];
const categoryPhotoAlts = {
  en: [
    "A legal professional reviews and marks a commercial contract at a desk.",
    "A board and legal team discuss corporate governance materials around a conference table.",
    "Employment counsel advises business and HR leaders during a workplace policy meeting.",
  ],
  es: [
    "Una profesional del derecho revisa y marca un contrato comercial en su escritorio.",
    "Una junta y su equipo jurídico analizan materiales de gobierno corporativo en una sala de reuniones.",
    "Una abogada laboralista asesora a directivos y a recursos humanos en una reunión sobre políticas laborales.",
  ],
} as const;
const problemIcons: readonly HomeIconName[] = ["in-context", "collocations", "legal-scales"];
// One approved content icon (I01) per "What a term may include" item, in the approved order.
const componentIcons = [
  "content/definition",
  "content/pronunciation",
  "content/spanish-equivalent",
  "content/civil-law-equivalent",
  "content/spanish-speaker-alert",
  "content/legalese-watch",
  "content/do-not-confuse-with",
  "content/use-it-with",
  "content/in-context",
  "content/quick-quiz",
] as const satisfies readonly Le5IconName[];
const tabIcons: readonly HomeIconName[] = ["open-book", "globe", "legal-scales", "help", "contract-clipboard", "bookmark"];

function AreaIcon({ name }: { name: Le5IconName }) {
  return <Le5Icon name={name} size={28} className="home-area-icon" />;
}
function ContentIcon({ name }: { name: Le5IconName }) {
  return <Le5Icon name={name} size={22} className="home-content-icon" />;
}

export default function Home() {
  const { locale } = useLocale();
  const c = landingCopy[locale];
  return (
    <main id="main" className="landing home-reference home-brief home-journey">
      <LandingHeader />
      <ScrollEffects />

      {/* 1 · Hero (approved copy, Part III "Inicio"). IMP-05: no trial disclosure
          here — the trial terms live in Pricing only. */}
      <section className="home-ref-hero">
        <div className="home-ref-copy hero-editorial" lang={locale}>
          <p className="hero-audience hero-brand-line"><span aria-hidden="true" />{c.hero.brandLine}</p>
          <h1><span className="hero-title-main">{c.hero.title}</span></h1>
          <p className="hero-editorial-lead">{c.hero.lead}</p>
          <p className="hero-audience-line">{c.hero.audience}</p>
          <div className="home-ref-actions hero-editorial-actions">
            <Link className="primary" href="/signup" onClick={() => trackAction("cta", "hero")}>{c.hero.cta}<CtaArrow /></Link>
            <a className="hero-sample-link" href="#how-it-works" onClick={() => trackAction("cta", "hero-sample")}>{c.hero.sample}<CtaArrow /></a>
          </div>
        </div>
        {/* Design Freeze Pack P01: approved desktop and mobile crops, no overlays. */}
        <figure className="home-ref-product hero-approved-photo">
          <picture>
            <source media="(max-width: 760px)" srcSet={photoSources("/home-assets/photos/hero-le5-mobile.jpg", "card").srcSet} sizes="100vw" />
            <Photo src="/home-assets/photos/hero-le5.jpg" size="wide" priority alt={c.hero.photoAlt} />
          </picture>
        </figure>
      </section>

      {/* 2 · Product example */}
      <section className="home-ref-learn brief-example" id="how-it-works" aria-labelledby="brief-example-title" lang={locale} tabIndex={-1}>
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.example.eyebrow}</span>
          <h2 id="brief-example-title">{c.example.title}</h2>
          <p>{c.example.lead}</p>
        </div>
        <LessonPreview locale={locale} tabIcons={tabIcons} renderIcon={({ name }) => <HomeIcon name={name as HomeIconName} />} />
      </section>

      {/* 3 · Areas */}
      <section className="home-ref-categories brief-launch" aria-labelledby="brief-launch-title" lang={locale}>
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.launch.eyebrow}</span>
          <h2 id="brief-launch-title">{c.launch.title}</h2>
        </div>
        <div className="home-ref-category-grid" data-reveal="stagger">
          {c.launch.items.map((title, index) => (
            <Link href={`/terms?category=${encodeURIComponent(categoryRoutes[index])}`} key={title}>
              <Photo className="home-ref-category-photo" src={categoryPhotos[index]} size="card" alt={categoryPhotoAlts[locale][index]} />
              <div className="home-ref-category-body">
                <span>
                  <AreaIcon name={categoryIcons[index]} />
                </span>
                <strong>{title}</strong>
                <small className="brief-term-count">{c.launch.termsLabel}</small>
                <b>{c.launch.explore} →</b>
              </div>
            </Link>
          ))}
        </div>
        <p className="brief-launch-note" data-reveal>{c.launch.note}</p>
      </section>

      {/* 4 · Benefits + components */}
      <section className="brief-problem journey-method" aria-labelledby="brief-method-title" lang={locale}>
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.benefits.eyebrow}</span>
          <h2 id="brief-method-title">{c.benefits.title}</h2>
        </div>
        <ul className="brief-problem-grid" data-reveal="stagger">
          {c.benefits.items.map(([title, body], index) => <li key={title}><HomeIcon name={problemIcons[index]} /><strong>{title}</strong><p>{body}</p></li>)}
        </ul>
        <details className="journey-components">
          <summary>{c.components.title}</summary>
          <ul className="brief-components-grid brief-components-list">
            {c.components.items.map((name, index) => <li key={name}><ContentIcon name={componentIcons[index]} /><div><strong lang="en">{name}</strong></div></li>)}
          </ul>
        </details>
      </section>

      {/* 5 · Editorial responsibility */}
      <section className="brief-trust" aria-labelledby="brief-trust-title" lang={locale} data-reveal>
        <img src="/brand/le5-monogram-light.svg" width="60" height="60" alt="" />
        <div>
          <span className="eyebrow">{c.trust.eyebrow}</span>
          <h2 id="brief-trust-title">{c.trust.title}</h2>
          <p>{c.trust.body}</p>
          <Link href="/about">{c.trust.cta} →</Link>
        </div>
      </section>

      {/* 6 · Pricing and free trial */}
      <section className="home-ref-pricing brief-pricing" id="pricing" aria-labelledby="brief-pricing-title" lang={locale}>
        <div className="home-ref-heading" data-reveal>
          <span className="eyebrow">{c.pricing.eyebrow}</span>
          <h2 id="brief-pricing-title">{c.pricing.title}</h2>
        </div>
        <PlanCards locale={locale} placement="pricing" />
        <p className="home-ref-secure">{c.pricing.payment}</p>
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

      {/* 8 · Final CTA (no trial disclosure: IMP-05) */}
      <section className="home-ref-cta brief-final" data-reveal lang={locale}>
        <div>
          <h2>{c.cta.title}</h2>
          <p className="brief-final-body">{c.cta.body}</p>
        </div>
        <Link className="primary" href="/signup" onClick={() => trackAction("cta", "final")}>
          {c.cta.button}
          <CtaArrow />
        </Link>
      </section>

      <LandingFooter />
    </main>
  );
}
