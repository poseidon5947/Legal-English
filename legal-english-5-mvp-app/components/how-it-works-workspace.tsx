"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApp } from "@/components/app-provider";
import { LearnerShell } from "@/components/learner-shell";
import { useLocale } from "@/components/locale-provider";
import { Photo } from "@/components/photo";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";
import { countsFor, stateOf, streakFor, studyTerms } from "@/lib/learner-stats";

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

const REASONS: ReadonlyArray<readonly [LearnerKey, LearnerKey, HowIconName, string]> = [
  ["howWhy1Title", "howWhy1Body", "reviewed-shield", "green"],
  ["howWhy2Title", "howWhy2Body", "practical-target", "purple"],
  ["howWhy3Title", "howWhy3Body", "pace-clock", "orange"],
  ["howWhy4Title", "howWhy4Body", "secure-lock", "blue"],
];

/**
 * "How It Works" for signed-in learners. The five steps are the real learning
 * loop (library → term → quiz → progress → daily session) and each one links to
 * the page where it happens and shows whether this learner has done it yet. The
 * progress rail reads the same counts as the Progress page, so it never shows a
 * number the learner cannot find elsewhere.
 */
export function HowItWorksWorkspace() {
  const { terms, progress, progressRows, studyDays, session } = useApp();
  const { locale } = useLocale();
  const L = (key: LearnerKey, vars?: Record<string, string | number>) => learnerText(locale, key, vars);

  const visible = useMemo(() => studyTerms(terms, session), [terms, session]);
  const counts = countsFor(visible, progress, studyDays);
  const streak = streakFor(progressRows, new Date(), studyDays);
  const started = counts.studied > 0 || counts.attempts > 0;

  // The best term to open next: something in progress first, otherwise a new one.
  const nextTerm = useMemo(() => {
    const learning = visible.find((term) => stateOf(progress, term.id) === "learning");
    return learning ?? visible.find((term) => stateOf(progress, term.id) === "new") ?? visible[0] ?? null;
  }, [visible, progress]);
  const nextHref = nextTerm ? `/terms/${nextTerm.id}` : "/terms";

  const steps: ReadonlyArray<{
    title: LearnerKey;
    body: LearnerKey;
    cta: LearnerKey;
    icon: HowIconName;
    tone: string;
    href: string;
    done: boolean;
    stat: string;
  }> = [
    { title: "howStep1Title", body: "howStep1Body", cta: "howStep1Cta", icon: "explore-search", tone: "blue", href: "/terms", done: counts.studied > 0, stat: L("howStat1", { n: counts.studied, total: counts.total }) },
    { title: "howStep2Title", body: "howStep2Body", cta: "howStep2Cta", icon: "learn-book", tone: "green", href: nextHref, done: counts.favourites > 0, stat: L("howStat2", { n: counts.favourites }) },
    { title: "howStep3Title", body: "howStep3Body", cta: "howStep3Cta", icon: "quiz-clipboard", tone: "purple", href: "/quizzes", done: counts.attempts > 0, stat: L("howStat3", { n: counts.attempts }) },
    { title: "howStep4Title", body: "howStep4Body", cta: "howStep4Cta", icon: "progress-chart", tone: "orange", href: "/progress", done: streak.current > 0, stat: L("howStat4", { n: streak.current }) },
    { title: "howStep5Title", body: "howStep5Body", cta: "howStep5Cta", icon: "mastery-award", tone: "blue", href: "/dashboard", done: counts.mastered > 0, stat: L("howStat5", { n: counts.mastered, total: counts.total }) },
  ];

  const ring = `conic-gradient(var(--how-green) 0 ${counts.masteryPct}%, #e4e1ec ${counts.masteryPct}% 100%)`;

  return (
    <LearnerShell pageClass="how-works-page">
      <div className="how-works-content">
        <section className="how-works-main">
          <div className="how-works-heading">
            <p className="eyebrow">{L("howEyebrow")}</p>
            <h1>{L("howTitle")}</h1>
            <p>{L("howLead")}</p>
          </div>

          <ol className="how-works-steps" aria-label={L("howStepsLabel")}>
            {steps.map((step, index) => (
              <li className={`how-works-step ${step.tone}${step.done ? " is-done" : ""}`} key={step.title}>
                <span className="how-works-step-number" aria-hidden="true">
                  {step.done ? (
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8.5l3.2 3L13 4.5" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="how-works-step-icon">
                  <HowIcon name={step.icon} />
                </span>
                <div className="how-works-step-body">
                  <h2>
                    <Link href={step.href}>{L(step.title)}</Link>
                  </h2>
                  <p>{L(step.body)}</p>
                  <div className="how-works-step-meta">
                    <span className={`how-works-step-state${step.done ? " done" : ""}`}>
                      <i aria-hidden="true" />
                      {step.done ? L("howStepDone") : L("howStepTodo")}
                      <em>· {step.stat}</em>
                    </span>
                    <Link href={step.href}>{L(step.cta)} →</Link>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <section className="how-works-result-card">
            <Photo className="how-works-result-photo" src="/home-assets/photos/study-group.jpg" size="card" aria-hidden="true" />
            <span>
              <HowIcon name="built-star" />
            </span>
            <div>
              <h2>{L("howResultTitle")}</h2>
              <p>{L("howResultBody")}</p>
            </div>
            <Link href={started ? "/dashboard" : nextHref}>{started ? L("howContinueLearning") : L("howStartLearning")}</Link>
          </section>

          <p className="how-works-support-line">
            <HowIcon name="support-bulb" />
            {L("howSupportLine")}
            <Link href="/account/help#contact">{L("howContactSupport")}</Link>
          </p>
        </section>

        <aside className="how-works-rail">
          <section className="how-works-panel how-works-progress-card" aria-label={L("yourProgress")}>
            <h2>{L("yourProgress")}</h2>
            <div className="how-works-progress-body">
              <div className="how-works-ring" style={{ background: ring }} role="img" aria-label={`${counts.masteryPct}% ${L("stateMastered")}`}>
                <strong>{counts.masteryPct}%</strong>
                <span>{L("stateMastered")}</span>
              </div>
              <dl>
                <div>
                  <dt>{L("termsStudied")}</dt>
                  <dd>{counts.studied}</dd>
                </div>
                <div>
                  <dt>{L("termsMastered")}</dt>
                  <dd>{counts.mastered}</dd>
                </div>
                <div>
                  <dt>{L("quizzesCompleted")}</dt>
                  <dd>{counts.attempts}</dd>
                </div>
                <div>
                  <dt>{L("quizAccuracy")}</dt>
                  <dd>{counts.accuracyPct}%</dd>
                </div>
              </dl>
            </div>
            {!started && <p className="how-works-progress-empty">{L("howProgressEmpty")}</p>}
            <Link href="/progress">
              <HowIcon name="progress-chart" />
              {L("viewFullProgress")}
            </Link>
          </section>

          <section className="how-works-panel how-works-reasons-card">
            <h2>{L("howWhyTitle")}</h2>
            <div className="how-works-reason-list">
              {REASONS.map(([title, body, icon, tone]) => (
                <article className={`how-works-reason ${tone}`} key={title}>
                  <span>
                    <HowIcon name={icon} />
                  </span>
                  <div>
                    <h3>{L(title)}</h3>
                    <p>{L(body)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="how-works-panel how-works-help-card">
            <h2>{L("howHelpTitle")}</h2>
            <p>{L("howHelpBody")}</p>
            <Link href="/account/help">
              {L("howHelpCta")}
              <HowIcon name="external-link" />
            </Link>
          </section>
        </aside>
      </div>
    </LearnerShell>
  );
}
