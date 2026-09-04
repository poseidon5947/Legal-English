"use client";

import Link from "next/link";
import { HeroImageFlow } from "@/components/hero-image-flow";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";
import { landingCopy } from "@/lib/landing-copy";

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
const benefitIcons: readonly HomeIconName[] = ["flame-stopwatch", "shield-badge", "growth-chart", "credit-card"];
const statIcons: readonly HomeIconName[] = ["contract-clipboard-stat", "legal-scales-stat", "shield-badge-stat", "user-avatar-stat"];
const quotePhotos = ["/home-assets/people/carlos-mendez.png", "/home-assets/people/ana-rodriguez.png"];
const homePrices = ["$0", "$12", "$99"];

export default function Home() {
  const { locale } = useLocale();
  const c = landingCopy[locale];
  return (
    <main className="landing home-reference">
      <LandingHeader />
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
          <div className="home-ref-benefits">
            {c.hero.benefits.map((label, index) => (
              <span key={label}>
                <HomeIcon name={benefitIcons[index]} />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="home-ref-product">
          <HeroImageFlow slides={c.hero.slides} />
        </div>
      </section>

      <section className="home-ref-categories">
        <div className="home-ref-heading">
          <h2>{c.categories.title}</h2>
          <p>{c.categories.lead}</p>
        </div>
        <div className="home-ref-category-grid">
          {c.categories.items.map(([title, body], index) => (
            <Link href={`/terms?category=${encodeURIComponent(categoryRoutes[index])}`} key={title}>
              <span>
                <HomeIcon name={categoryIcons[index]} />
              </span>
              <strong>{title}</strong>
              <small>{body}</small>
              <b>{c.categories.explore}</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-ref-learn" id="how-it-works">
        <div className="home-ref-heading">
          <h2>{c.learn.title}</h2>
          <p>{c.learn.lead}</p>
        </div>
        <div className="home-ref-lesson">
          <aside>
            {c.learn.tabs.map((label, index) => (
              <button className={index === 0 ? "active" : ""} key={label}>
                <HomeIcon name={tabIcons[index]} />
                {label}
              </button>
            ))}
          </aside>
          <article className="home-ref-term">
            <h3>Consideration</h3>
            <button aria-label="Play pronunciation">
              <HomeIcon name="speaker" />
            </button>
            <p className="home-ref-pronunciation">{c.learn.pronunciation}</p>
            <p>{c.learn.definition}</p>
            <div>
              <strong>{c.learn.exampleLabel}</strong>
              <span>{c.learn.example}</span>
            </div>
          </article>
          <article className="home-ref-quiz">
            <div>
              <strong>{c.learn.quickQuiz}</strong>
              <span>{c.learn.quizCount}</span>
            </div>
            <h3>{c.learn.question}</h3>
            {c.learn.options.map((label, index) => {
              const checked = index === 2;
              return (
                <label className={checked ? "selected" : ""} key={label}>
                  <input type="radio" checked={checked} readOnly />
                  {label}
                  {checked && <HomeIcon name="shield-badge" />}
                </label>
              );
            })}
            <Link className="primary" href="/login">
              {c.learn.check}
            </Link>
            <Link href="/quizzes">{c.learn.viewFull}</Link>
          </article>
        </div>
      </section>

      <section className="home-ref-workflow">
        <div className="home-ref-heading">
          <h2>{c.workflow.title}</h2>
          <p>{c.workflow.lead}</p>
        </div>
        <div>
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
        <div className="home-ref-heading">
          <h2>{c.features.title}</h2>
        </div>
        <div>
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

      <section className="home-ref-proof">
        <h2>{c.proof.title}</h2>
        <div className="home-ref-proof-grid">
          {c.proof.quotes.map(([quote, name, role], index) => (
            <article className="home-ref-quote" key={name}>
              <img src={quotePhotos[index]} alt="" aria-hidden="true" />
              <p>“{quote}”</p>
              <strong>{name}</strong>
              <small>{role}</small>
            </article>
          ))}
          {c.proof.stats.map(([value, label], index) => (
            <article className="home-ref-stat" key={label}>
              <HomeIcon name={statIcons[index]} />
              <strong>{value}</strong>
              <small>{label}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="home-ref-pricing" id="pricing">
        <div className="home-ref-heading">
          <h2>{c.pricing.title}</h2>
          <p>{c.pricing.lead}</p>
        </div>
        <div>
          {c.pricing.plans.map((plan, index) => (
            <article className={index === 2 ? "best" : ""} key={plan.name}>
              {index === 2 && <img className="best-value-badge" src="/home-assets/badges/best-value.png" alt={c.pricing.bestValue} />}
              <h3>{plan.name}</h3>
              <strong>
                {homePrices[index]}
                {index === 2 && <small>{c.pricing.perYear}</small>}
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

      <section className="home-ref-cta">
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
