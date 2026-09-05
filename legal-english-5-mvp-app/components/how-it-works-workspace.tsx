"use client";

import Link from "next/link";
import { LearnerShell } from "@/components/learner-shell";
import { useLocale } from "@/components/locale-provider";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";

type HowIconName =
  | "explore-search"
  | "learn-book"
  | "quiz-clipboard"
  | "progress-chart"
  | "mastery-award"
  | "built-star"
  | "reviewed-shield"
  | "practical-target"
  | "pace-clock"
  | "secure-lock"
  | "external-link"
  | "support-bulb";

function HowIcon({ name, className = "" }: { name: HowIconName; className?: string }) {
  return <img className={`how-works-icon ${className}`.trim()} src={`/how-it-works-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

const steps = [
  {
    title: "Explore Terms",
    text: "Browse or search our comprehensive library of legal terms. Each term includes clear definitions and real-world examples.",
    icon: "explore-search",
    tone: "blue",
  },
  {
    title: "Learn & Understand",
    text: "Read detailed explanations, view usage in context, and add important terms to your library.",
    icon: "learn-book",
    tone: "green",
  },
  {
    title: "Practice with Quizzes",
    text: "Test your knowledge with interactive quizzes and track your progress over time.",
    icon: "quiz-clipboard",
    tone: "purple",
  },
  {
    title: "Track Your Progress",
    text: "Monitor your learning journey with detailed statistics and personalized insights.",
    icon: "progress-chart",
    tone: "orange",
  },
  {
    title: "Master Legal English",
    text: "Stay consistent, reach your goals, and confidently use Legal English in real situations.",
    icon: "mastery-award",
    tone: "blue",
  },
] as const;

const reasons = [
  ["Expert-Reviewed Content", "All terms and examples are reviewed by legal professionals.", "reviewed-shield", "green"],
  ["Practical & Relevant", "Learn the terms you need with examples from real legal situations.", "practical-target", "purple"],
  ["Learn at Your Pace", "Study anytime, anywhere with flexible learning that fits your schedule.", "pace-clock", "orange"],
  ["Secure & Reliable", "Your progress and personal data are always safe with us.", "secure-lock", "blue"],
] as const;

const referenceStats = {
  masteryPct: 90,
  studied: 82,
  mastered: 56,
  attempts: 24,
  accuracyPct: 78,
};

export function HowItWorksWorkspace() {
  const { locale } = useLocale();
  const L = (key: LearnerKey, vars?: Record<string, string | number>) => learnerText(locale, key, vars);

  return (
    <LearnerShell pageClass="how-works-page">
      <div className="how-works-content">
        <section className="how-works-main">
          <div className="how-works-heading">
            <h1>How It Works</h1>
            <p>Legal English 5 is designed to help you learn, practice, and master legal terms in a simple and effective way.</p>
          </div>

          <section className="how-works-steps" aria-label="How Legal English 5 works">
            {steps.map((step, index) => (
              <article className={`how-works-step ${step.tone}`} key={step.title}>
                <span className="how-works-step-number">{index + 1}</span>
                <span className="how-works-step-icon">
                  <HowIcon name={step.icon} />
                </span>
                <div>
                  <h2>{step.title}</h2>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </section>

          <section className="how-works-result-card">
            <span>
              <HowIcon name="built-star" />
            </span>
            <div>
              <h2>Built for real results</h2>
              <p>Our structured learning system, expert content, and smart tracking help you build lasting knowledge and skills.</p>
            </div>
            <Link href="/terms">Start Learning</Link>
          </section>

          <p className="how-works-support-line">
            <HowIcon name="support-bulb" />
            Have questions? We&apos;re here to help you succeed.
            <Link href="/account/help">Contact Support</Link>
          </p>
        </section>

        <aside className="how-works-rail">
          <section className="how-works-panel how-works-progress-card">
            <h2>{L("yourProgress")}</h2>
            <div className="how-works-progress-body">
              <div className="how-works-ring" style={{ background: `conic-gradient(var(--how-green) 0 ${referenceStats.masteryPct}%, #e8eef7 ${referenceStats.masteryPct}% 100%)` }}>
                <strong>{referenceStats.masteryPct}%</strong>
                <span>{L("stateMastered")}</span>
              </div>
              <dl>
                <div><dt>{L("termsStudied")}</dt><dd>{referenceStats.studied}</dd></div>
                <div><dt>{L("termsMastered")}</dt><dd>{referenceStats.mastered}</dd></div>
                <div><dt>{L("quizzesCompleted")}</dt><dd>{referenceStats.attempts}</dd></div>
                <div><dt>{L("quizAccuracy")}</dt><dd>{referenceStats.accuracyPct}%</dd></div>
              </dl>
            </div>
            <Link href="/progress">
              <HowIcon name="progress-chart" />
              {L("viewFullProgress")}
            </Link>
          </section>

          <section className="how-works-panel how-works-reasons-card">
            <h2>Why Learn with Legal English 5?</h2>
            <div className="how-works-reason-list">
              {reasons.map(([title, text, icon, tone]) => (
                <article className={`how-works-reason ${tone}`} key={title}>
                  <span>
                    <HowIcon name={icon as HowIconName} />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="how-works-panel how-works-help-card">
            <h2>Need More Help?</h2>
            <p>Check out our Help Center or contact our support team for any questions.</p>
            <Link href="/account/help">
              Visit Help Center
              <HowIcon name="external-link" />
            </Link>
          </section>
        </aside>
      </div>
    </LearnerShell>
  );
}
