"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApp } from "@/components/app-provider";
import { LearnerShell } from "@/components/learner-shell";
import { useLocale } from "@/components/locale-provider";
import { Photo } from "@/components/photo";
import { categoryPhoto } from "@/lib/category-photos";
import { categoryLabel } from "@/lib/i18n";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";
import { achievementsFor, categoryStats, countsFor, formatWhen, recentActivity, streakFor, studyTerms, weeklyActivity } from "@/lib/learner-stats";

type ProgressIcon =
  | "stat-book"
  | "stat-graduation"
  | "stat-target"
  | "stat-clock"
  | "flame-streak"
  | "check-circle"
  | "activity-book"
  | "activity-quiz"
  | "achievement-award"
  | "achievement-shield"
  | "achievement-trophy"
  | "courthouse"
  | "people-group";

function ProgressIcon({ name, className = "" }: { name: ProgressIcon; className?: string }) {
  return <img className={`progress-ref-icon ${className}`.trim()} src={`/progress-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

const CATEGORY_ICON: Record<string, ProgressIcon> = { Contracts: "activity-book", "Corporate Law": "courthouse", "Employment Law": "people-group" };
const CATEGORY_TONE: Record<string, string> = { Contracts: "blue", "Corporate Law": "green", "Employment Law": "purple" };
const ACTIVITY_ICON = { mastered: "achievement-shield", attempted: "activity-quiz", studied: "activity-book", saved: "stat-book" } as const;
const ACTIVITY_TONE = { mastered: "green", attempted: "purple", studied: "orange", saved: "blue" } as const;
const ACTIVITY_KEY: Record<string, LearnerKey> = { mastered: "mastered", attempted: "attempted", studied: "studied", saved: "savedTerm" };
const ACH_ICON: Record<string, ProgressIcon> = {
  firstMastery: "check-circle",
  firstSteps: "achievement-shield",
  quizMaster: "achievement-trophy",
  consistent: "achievement-award",
  champion: "stat-graduation",
};
const ACH_TONE: Record<string, string> = { firstMastery: "green", firstSteps: "green", quizMaster: "purple", consistent: "orange", champion: "blue" };
const ACH_TITLE: Record<string, [LearnerKey, LearnerKey]> = {
  firstMastery: ["achFirstMastery", "achFirstMasteryBody"],
  firstSteps: ["achFirstSteps", "achFirstStepsBody"],
  quizMaster: ["achQuizMaster", "achQuizMasterBody"],
  consistent: ["achConsistent", "achConsistentBody"],
  champion: ["achChampion", "achChampionBody"],
};

/** Real weekly buckets drawn as two lines; the scale adapts to the largest week. */
function ActivityChart({ weeks, locale }: { weeks: { start: Date; studied: number; attempts: number }[]; locale: string }) {
  const peak = Math.max(4, ...weeks.map((week) => Math.max(week.studied, week.attempts)));
  const max = Math.ceil(peak / 4) * 4;
  const left = 56;
  const right = 636;
  const top = 20;
  const bottom = 190;
  const x = (i: number) => left + (i * (right - left)) / Math.max(1, weeks.length - 1);
  const y = (value: number) => bottom - (value / max) * (bottom - top);
  const line = (key: "studied" | "attempts") => weeks.map((week, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(week[key])}`).join(" ");
  const area = (key: "studied" | "attempts") => `${line(key)} L${right} ${bottom} L${left} ${bottom} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <svg className="progress-activity-chart" viewBox="0 0 662 222" role="img" aria-label="Learning activity chart">
      <defs>
        <linearGradient id="termsArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2e7de6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2e7de6" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="quizArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#19a875" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#19a875" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1="42" x2="636" y1={y(tick * max)} y2={y(tick * max)} />
          <text x="14" y={y(tick * max) + 4}>
            {Math.round(tick * max)}
          </text>
        </g>
      ))}
      <path d={area("studied")} fill="url(#termsArea)" />
      <path d={area("attempts")} fill="url(#quizArea)" />
      <path d={line("studied")} className="terms-line" />
      <path d={line("attempts")} className="quiz-line" />
      {weeks.map((week, i) => (
        <circle className="terms-dot" cx={x(i)} cy={y(week.studied)} key={`s-${i}`} r="4" />
      ))}
      {weeks.map((week, i) => (
        <circle className="quiz-dot" cx={x(i)} cy={y(week.attempts)} key={`q-${i}`} r="4" />
      ))}
      {weeks.map((week, i) => (
        <text className="date-label" x={x(i)} y="214" key={`d-${i}`} textAnchor="middle">
          {week.start.toLocaleDateString(locale, { month: "short", day: "numeric" })}
        </text>
      ))}
    </svg>
  );
}

export default function ProgressPage() {
  const { terms, progress, progressRows, session } = useApp();
  const { locale } = useLocale();
  const L = (key: LearnerKey, vars?: Record<string, string | number>) => learnerText(locale, key, vars);
  const visible = useMemo(() => studyTerms(terms, session), [terms, session]);
  const counts = countsFor(visible, progress);
  const byCategory = categoryStats(visible, progress);
  const streak = streakFor(progressRows);
  const weeks = weeklyActivity(progressRows);
  const activity = recentActivity(visible, progressRows, 6);
  const achievements = achievementsFor(counts, streak, byCategory);
  const rangeLabel = `${weeks[0].start.toLocaleDateString(locale, { month: "short", day: "numeric" })} – ${new Date().toLocaleDateString(locale, { month: "short", day: "numeric" })}`;

  return (
    <LearnerShell pageClass="progress-reference-page">
      <div className="progress-ref-content">
        <section className="progress-ref-main">
          <div className="progress-ref-heading">
            <div>
              <h1>{L("progressTitle")}</h1>
              <p>{L("progressLead")}</p>
            </div>
            <div className="progress-date-controls">
              <span className="progress-range">{rangeLabel}</span>
            </div>
          </div>

          <section className="progress-ref-stats" aria-label="Progress statistics">
            <article className="green">
              <span>
                <ProgressIcon name="stat-book" />
              </span>
              <div>
                <p>{L("termsStudied")}</p>
                <strong>{counts.studied}</strong>
                <small>
                  <Link href="/terms?state=learning">{L("ofTotal", { n: counts.total })}</Link>
                </small>
              </div>
            </article>
            <article className="purple">
              <span>
                <ProgressIcon name="stat-graduation" />
              </span>
              <div>
                <p>{L("termsMastered")}</p>
                <strong>{counts.mastered}</strong>
                <small>
                  <Link href="/terms?state=mastered">{counts.masteryPct}%</Link>
                </small>
              </div>
            </article>
            <article className="gold">
              <span>
                <ProgressIcon name="stat-target" />
              </span>
              <div>
                <p>{L("quizzesCompleted")}</p>
                <strong>{counts.attempts}</strong>
                <small>{L("quizAccuracy")}: {counts.accuracyPct}%</small>
              </div>
            </article>
            <article className="blue">
              <span>
                <ProgressIcon name="stat-clock" />
              </span>
              <div>
                <p>{L("favourites")}</p>
                <strong>{counts.favourites}</strong>
                <small>
                  <Link href="/library">{L("navMyLibrary")}</Link>
                </small>
              </div>
            </article>
          </section>

          <section className="progress-panel progress-chart-panel">
            <div className="progress-section-top">
              <h2>{L("learningActivity")}</h2>
              <span className="progress-range">{L("lastWeeks")}</span>
            </div>
            <div className="progress-chart-legend">
              <span>
                <i className="blue" />
                {L("legendTerms")}
              </span>
              <span>
                <i className="green" />
                {L("legendQuizzes")}
              </span>
            </div>
            <ActivityChart weeks={weeks} locale={locale} />
          </section>

          <section className="progress-panel progress-category-panel">
            <div className="progress-section-top">
              <h2>{L("byCategory")}</h2>
              <Link href="/categories">{L("viewCategories")}</Link>
            </div>
            <div className="progress-category-list">
              {byCategory.map((item) => (
                <Link className={`${CATEGORY_TONE[item.category]} with-photo`} href={`/terms?category=${encodeURIComponent(item.category)}`} key={item.category}>
                  <span>
                    <Photo src={categoryPhoto(item.category)} size="thumb" />
                    <ProgressIcon name={CATEGORY_ICON[item.category]} />
                  </span>
                  <strong>{categoryLabel(locale, item.category)}</strong>
                  <div>
                    <i style={{ width: `${item.pct}%` }} />
                  </div>
                  <small>
                    {item.mastered} / {item.total}
                  </small>
                  <b>{item.pct}%</b>
                </Link>
              ))}
            </div>
          </section>
        </section>

        <aside className="progress-ref-rail">
          <Link className="learner-photo-card" href="/terms">
            <Photo src="/home-assets/photos/workflow-study.jpg" size="card" />
            <span>
              <small>{L("photoCardTag")}</small>
              <strong>{L("photoCardTitle")}</strong>
            </span>
          </Link>
          <section className="progress-panel progress-streak-card">
            <h2>{L("currentStreak")}</h2>
            <div className="progress-streak-main">
              <span>
                <ProgressIcon name="flame-streak" />
              </span>
              <div>
                <strong>
                  {streak.current} <small>{streak.current === 1 ? L("day") : L("days")}</small>
                </strong>
                <p>{streak.current > 0 ? L("streakGood") : L("streakStart")}</p>
              </div>
            </div>
            <div className="progress-week-row">
              {streak.week.map((day, index) => (
                <span className={`${day.done ? "done" : ""}${day.today ? " today" : ""}`} key={`${day.label}-${index}`}>
                  <b>{day.label}</b>
                  <i>{day.done ? "✓" : ""}</i>
                </span>
              ))}
            </div>
            <p className="progress-longest">{L("longest", { n: streak.longest })}</p>
          </section>

          <section className="progress-panel progress-recent-card">
            <div className="progress-section-top">
              <h2>{L("recentActivity")}</h2>
              <Link href="/quizzes">{L("viewAll")}</Link>
            </div>
            <div className="progress-activity-list">
              {activity.length === 0 && <p className="progress-empty">{L("noActivity")}</p>}
              {activity.map((item) => (
                <Link className={ACTIVITY_TONE[item.kind]} href={`/terms/${item.term.id}`} key={`${item.term.id}-${item.at}`}>
                  <span>
                    <ProgressIcon name={ACTIVITY_ICON[item.kind]} />
                  </span>
                  <div>
                    <strong>{L(ACTIVITY_KEY[item.kind], { term: item.term.term })}</strong>
                    <small>{formatWhen(item.at, locale, { today: L("today"), yesterday: L("yesterday") })}</small>
                  </div>
                  <b>&rsaquo;</b>
                </Link>
              ))}
            </div>
          </section>

          <section className="progress-panel progress-achievement-card">
            <div className="progress-section-top">
              <h2>{L("achievements")}</h2>
              <Link href="/account/achievements">{L("viewAll")}</Link>
            </div>
            <div className="progress-achievement-list">
              {achievements.map((item) => (
                <article className={`${ACH_TONE[item.id]}${item.done ? "" : " pending"}`} key={item.id}>
                  <span>
                    <ProgressIcon name={ACH_ICON[item.id]} />
                  </span>
                  <div>
                    <strong>{L(ACH_TITLE[item.id][0])}</strong>
                    <small>{L(ACH_TITLE[item.id][1])}</small>
                  </div>
                  <b>{item.done ? L("achieved") : `${item.value} / ${item.target}`}</b>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </LearnerShell>
  );
}
