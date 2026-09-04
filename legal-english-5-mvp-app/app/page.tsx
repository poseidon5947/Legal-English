"use client";

import Link from "next/link";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { IMAGES } from "@/lib/media";

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

const practiceAreas: ReadonlyArray<readonly [string, string, HomeIconName]> = [
  ["Contracts", "Master essential contract terms and clauses used in everyday practice.", "category-contracts"],
  ["Corporate Law", "Learn the language of companies, governance, and business transactions.", "category-corporate"],
  ["Employment Law", "Build confidence with employment terms and workplace terminology.", "category-employment"],
];

const learningTabs: ReadonlyArray<readonly [string, HomeIconName]> = [
  ["Definition", "open-book"],
  ["Spanish Equivalent", "globe"],
  ["Civil Law Equivalent", "legal-scales"],
  ["Spanish-Speaker Alert", "help"],
  ["Use It With", "contract-clipboard"],
  ["In Context", "bookmark"],
];

const workflow: ReadonlyArray<readonly [string, string, HomeIconName]> = [
  ["Discover Terms", "Browse or search key legal terms by category or topic.", "workflow-book"],
  ["Study in Context", "Review clear explanations, equivalents, and real-world examples.", "workflow-chat"],
  ["Take Quiz", "Reinforce your knowledge with short, focused quizzes.", "workflow-quiz"],
  ["Track Mastery", "Monitor your progress and build lasting confidence.", "workflow-growth"],
];

const features: ReadonlyArray<readonly [string, string, HomeIconName]> = [
  ["Smart Search & Filters", "Find terms quickly by keyword, category, or practice area.", "feature-search"],
  ["Learn Anywhere", "Responsive experience on desktop, tablet, and mobile.", "feature-mobile"],
  ["Personalized Progress", "Terms are marked as New, Learning, or Mastered.", "feature-progress"],
  ["All-Access Subscription", "Unlimited access to all terms, quizzes, and new content.", "feature-timer"],
];

const pricingPlans = [
  ["7-Day Free Trial", "$0", "Full access to all features", "All terms and quizzes", "Cancel anytime", "Start Free Trial"],
  ["Monthly Plan", "$12", "Unlimited access to all content", "New terms added regularly", "Cancel anytime", "Start Monthly Plan"],
  ["Annual Plan", "$99", "Everything in Monthly Plan", "Save over 30% with annual billing", "Cancel anytime", "Start Annual Plan"],
] as const;

export default function Home() {
  return (
    <main className="landing home-reference">
      <LandingHeader />
      <section className="home-ref-hero">
        <div className="home-ref-copy">
          <h1>
            Master Legal English
            <br />
            in 5-Minute Sessions.
          </h1>
          <p>
            The microlearning platform built for Spanish-speaking lawyers and law students. Learn essential legal terminology through clear explanations,
            contextual usage, functional equivalents, and progress tracking.
          </p>
          <div className="home-ref-actions">
            <Link className="primary" href="/login">
              Start 7-Day Free Trial
              <HomeIcon name="arrow-right" />
            </Link>
            <Link className="ghost" href="/sample-terms">
              Explore Terms Library
            </Link>
          </div>
          <div className="home-ref-benefits">
            {[
              ["5-Minute Lessons", "flame-stopwatch"],
              ["Built for legal professionals", "shield-badge"],
              ["Track your progress", "growth-chart"],
              ["No credit card required", "credit-card"],
            ].map(([label, icon]) => (
              <span key={label}>
                <HomeIcon name={icon as HomeIconName} />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="home-ref-product">
          <img src={IMAGES.generatedHero} alt="Legal English 5 dashboard preview" />
        </div>
      </section>

      <section className="home-ref-categories">
        <div className="home-ref-heading">
          <h2>Explore Our Launch Categories</h2>
          <p>Focused learning paths designed for real legal practice.</p>
        </div>
        <div className="home-ref-category-grid">
          {practiceAreas.map(([title, body, icon]) => (
            <Link href="/sample-terms" key={title}>
              <span>
                <HomeIcon name={icon} />
              </span>
              <strong>{title}</strong>
              <small>{body}</small>
              <b>Explore Terms →</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-ref-learn" id="how-it-works">
        <div className="home-ref-heading">
          <h2>See How You’ll Learn</h2>
          <p>Every term includes clear definitions, real-world context, and smart practice.</p>
        </div>
        <div className="home-ref-lesson">
          <aside>
            {learningTabs.map(([label, icon], index) => (
              <button className={index === 0 ? "active" : ""} key={label}>
                <HomeIcon name={icon} />
                {label}
              </button>
            ))}
          </aside>
          <article className="home-ref-term">
            <h3>Consideration</h3>
            <button aria-label="Play pronunciation">
              <HomeIcon name="speaker" />
            </button>
            <p className="home-ref-pronunciation">Pronunciation: /kənˌsɪdəˈreɪʃən/</p>
            <p>
              Something of value exchanged between parties that induces each to enter into a contract. It is a fundamental element required for a valid,
              enforceable contract in common law.
            </p>
            <div>
              <strong>EXAMPLE</strong>
              <span>The promisor agreed to pay $10,000 as consideration for the sale of the equipment.</span>
            </div>
          </article>
          <article className="home-ref-quiz">
            <div>
              <strong>Quick Quiz</strong>
              <span>1 of 3</span>
            </div>
            <h3>What is consideration in contract law?</h3>
            {[
              ["A legal duty imposed by statute", false],
              ["A promise without any exchange", false],
              ["Something of value exchanged between parties", true],
              ["A contract term added later", false],
            ].map(([label, checked]) => (
              <label className={checked ? "selected" : ""} key={String(label)}>
                <input type="radio" checked={Boolean(checked)} readOnly />
                {label}
                {checked && <HomeIcon name="shield-badge" />}
              </label>
            ))}
            <Link className="primary" href="/login">
              Check Answer
            </Link>
            <Link href="/sample-terms">View full quiz →</Link>
          </article>
        </div>
      </section>

      <section className="home-ref-workflow">
        <div className="home-ref-heading">
          <h2>How It Works</h2>
          <p>Learn smarter in four simple steps.</p>
        </div>
        <div>
          {workflow.map(([title, body, icon], index) => (
            <article key={title}>
              <b>{index + 1}</b>
              <span>
                <HomeIcon name={icon} />
              </span>
              <strong>{title}</strong>
              <small>{body}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="home-ref-features">
        <div className="home-ref-heading">
          <h2>Everything You Need to Succeed</h2>
        </div>
        <div>
          {features.map(([title, body, icon]) => (
            <article key={title}>
              <HomeIcon name={icon} />
              <strong>{title}</strong>
              <small>
                {title === "Personalized Progress" ? (
                  <>
                    Terms are marked as <span className="dot-status new">New</span>, <span className="dot-status learning">Learning</span>, or{" "}
                    <span className="dot-status mastered">Mastered</span>.
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
        <h2>Trusted by Legal Professionals</h2>
        <div className="home-ref-proof-grid">
          {[
            [
              "Legal English 5 me ayuda a entender y usar la terminología correcta en mis contratos diarios. Las lecciones son claras y muy prácticas.",
              "Carlos Méndez",
              "Abogado Corporativo, México",
              "/home-assets/people/carlos-mendez.png",
            ],
            [
              "Como estudiante de derecho, esta plataforma ha sido clave para ganar confianza en mis lecturas y clases en inglés.",
              "Ana Rodríguez",
              "Estudiante de Derecho, España",
              "/home-assets/people/ana-rodriguez.png",
            ],
          ].map(([quote, name, role, photo]) => (
            <article className="home-ref-quote" key={name}>
              <img src={photo} alt="" aria-hidden="true" />
              <p>“{quote}”</p>
              <strong>{name}</strong>
              <small>{role}</small>
            </article>
          ))}
          {[
            ["30+", "Published Terms", "contract-clipboard-stat"],
            ["3", "Legal Categories", "legal-scales-stat"],
            ["7-Day", "Free Trial", "shield-badge-stat"],
            ["For Lawyers", "& Law Students", "user-avatar-stat"],
          ].map(([value, label, icon]) => (
            <article className="home-ref-stat" key={value}>
              <HomeIcon name={icon as HomeIconName} />
              <strong>{value}</strong>
              <small>{label}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="home-ref-pricing" id="pricing">
        <div className="home-ref-heading">
          <h2>Simple, Transparent Pricing</h2>
          <p>Full access to all terms, quizzes, and features.</p>
        </div>
        <div>
          {pricingPlans.map((plan, index) => (
            <article className={index === 2 ? "best" : ""} key={plan[0]}>
              {index === 2 && <img className="best-value-badge" src="/home-assets/badges/best-value.png" alt="Best Value" />}
              <h3>{plan[0]}</h3>
              <strong>
                {plan[1]}
                {index === 2 && <small>/year</small>}
              </strong>
              <ul>
                <li>{plan[2]}</li>
                <li>{plan[3]}</li>
                <li>{plan[4]}</li>
              </ul>
              <Link className={index === 1 ? "primary" : "ghost"} href="/login">
                {plan[5]}
              </Link>
            </article>
          ))}
        </div>
        <p className="home-ref-secure">
          <HomeIcon name="lock" />
          Secure checkout. Cancel anytime. No hidden fees.
        </p>
      </section>

      <section className="home-ref-cta">
        <span>
          <HomeIcon name="legal-scales" />
        </span>
        <div>
          <h2>Ready to Master Legal English?</h2>
          <p>Join thousands of lawyers and law students building confidence every day.</p>
        </div>
        <Link className="primary" href="/login">
          Start Your 7-Day Free Trial
          <HomeIcon name="arrow-right" />
        </Link>
      </section>

      <LandingFooter />
    </main>
  );
}
