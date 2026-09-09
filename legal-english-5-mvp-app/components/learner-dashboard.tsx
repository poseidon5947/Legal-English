"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { LearnerShell } from "@/components/learner-shell";
import { useLocale } from "@/components/locale-provider";
import { StatusBadge } from "@/components/terms-library";
import { categoryPhoto, termPhoto } from "@/lib/category-photos";
import { Photo } from "@/components/photo";
import { categoryLabel } from "@/lib/i18n";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";
import { areaRoute, categoryStats, countsFor, formatWhen, recentActivity, stateOf, streakFor, studyTerms } from "@/lib/learner-stats";
import { routeLabel } from "@/components/area-route";

const SESSION_SIZE = 5;
const CHECKLIST_KEY = "le5.dashboard.checklist.hidden";

/**
 * Signed-in home: today's five-term session (learning first, then new in
 * curriculum order), where you left off, streak / mastery / saved at a glance
 * and the three categories. Everything is derived from the same progress rows
 * the Progress page uses, so the numbers always agree.
 */
export function LearnerDashboard() {
  const { terms, progress, progressRows, studyDays, session } = useApp();
  const { locale } = useLocale();
  const L = (key: LearnerKey, vars?: Record<string, string | number>) => learnerText(locale, key, vars);
  const visible = useMemo(() => studyTerms(terms, session), [terms, session]);
  const isOwner = session?.user.role === "admin";
  const counts = countsFor(visible, progress, studyDays);
  const byCategory = categoryStats(visible, progress);
  const streak = streakFor(progressRows, new Date(), studyDays);
  const recent = recentActivity(visible, progressRows, 4);

  const today = useMemo(() => {
    const learning = visible.filter((term) => stateOf(progress, term.id) === "learning");
    const fresh = visible.filter((term) => stateOf(progress, term.id) === "new");
    return [...learning, ...fresh].slice(0, SESSION_SIZE);
  }, [visible, progress]);

  const lastOpened = recent.find((item) => item.kind === "studied" || item.kind === "attempted") ?? recent[0];

  // Getting started: derived from real progress, so it never lies; hidden once
  // the learner dismisses it after completing everything.
  const steps = [
    { id: "open", done: counts.studied > 0, href: today[0] ? `/terms/${today[0].id}` : "/terms", label: L("checkOpen") },
    { id: "quiz", done: counts.attempts > 0, href: "/quizzes", label: L("checkQuiz") },
    { id: "save", done: counts.favourites > 0, href: "/terms", label: L("checkSave") },
    { id: "verify", done: Boolean(session?.user.emailVerified), href: "/account/settings?tab=security", label: L("checkVerify") },
    { id: "master", done: counts.mastered > 0, href: "/quizzes", label: L("checkMaster") },
  ];
  const doneCount = steps.filter((step) => step.done).length;
  const allDone = doneCount === steps.length;
  const [checklistHidden, setChecklistHidden] = useState(true);
  useEffect(() => {
    setChecklistHidden(Boolean(window.localStorage.getItem(CHECKLIST_KEY)));
  }, []);
  const showChecklist = !checklistHidden && !isOwner;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "dashGoodMorning" : hour < 19 ? "dashGoodAfternoon" : "dashGoodEvening";
  const firstName = session?.user.name.split(" ")[0] ?? "";
  const quizHref = today.length ? `/quizzes?category=${encodeURIComponent(today[0].category)}` : "/quizzes";

  return (
    <LearnerShell pageClass="dashboard-page">
      <div className="terms-reference-content dashboard">
        <div className="terms-reference-heading">
          <div>
            <h1>{L(greeting, { name: firstName })}</h1>
            <p>{isOwner ? L("dashLeadOwner") : L("dashLead")}</p>
          </div>
        </div>

        {showChecklist && (
          <section className="dashboard-checklist" aria-labelledby="dash-check-title">
            <div className="dashboard-checklist-head">
              <div>
                <span className="eyebrow">{L("checkEyebrow")}</span>
                <h2 id="dash-check-title">{allDone ? L("checkAllDone") : L("checkTitle", { done: doneCount, n: steps.length })}</h2>
              </div>
              <div className="dashboard-checklist-meter" aria-hidden="true">
                <i style={{ width: `${(doneCount / steps.length) * 100}%` }} />
              </div>
              {allDone && (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    window.localStorage.setItem(CHECKLIST_KEY, new Date().toISOString());
                    setChecklistHidden(true);
                  }}
                >
                  {L("checkDismiss")}
                </button>
              )}
            </div>
            <ol>
              {steps.map((step) => (
                <li key={step.id} className={step.done ? "done" : ""}>
                  {step.done ? (
                    <span>
                      <i aria-hidden="true">✓</i>
                      {step.label}
                    </span>
                  ) : (
                    <Link href={step.href}>
                      <i aria-hidden="true" />
                      {step.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="dashboard-grid">
          <section className="dashboard-session" aria-labelledby="dash-session-title">
            <div className="dashboard-session-head">
              <span className="eyebrow">{L("dashSessionTag")}</span>
              <h2 id="dash-session-title">{today.length ? L("dashSessionTitle", { n: today.length }) : visible.length === 0 ? L("emptyLibraryTitle") : L("stateMastered")}</h2>
              <p>{today.length ? L("dashSessionBody") : visible.length === 0 ? L("emptyLibraryBody") : L("dashSessionDone")}</p>
            </div>
            {today.length > 0 && (
              <>
                <ol className="dashboard-session-list">
                  {today.map((term, index) => (
                    <li key={term.id}>
                      <Link href={`/terms/${term.id}`}>
                        <span className="dashboard-session-index">{index + 1}</span>
                        <span className="dashboard-session-body">
                          <strong>{term.term}</strong>
                          <small>
                            {categoryLabel(locale, term.category)} · {term.spanishEquivalent}
                          </small>
                        </span>
                        <StatusBadge state={stateOf(progress, term.id)} locale={locale} />
                      </Link>
                    </li>
                  ))}
                </ol>
                <div className="dashboard-session-actions">
                  <Link className="primary inline" href={`/terms/${today[0].id}`}>
                    {L("dashStartSession")}
                  </Link>
                  <Link className="ghost" href={quizHref}>
                    {L("dashQuizThem")}
                  </Link>
                </div>
              </>
            )}
            {today.length === 0 && (
              <div className="dashboard-session-actions">
                <Link className="primary inline" href="/terms">
                  {L("navLibrary")}
                </Link>
                <Link className="ghost" href="/quizzes">
                  {L("navQuizzes")}
                </Link>
              </div>
            )}
          </section>

          <aside className="dashboard-rail">
            <section className="dashboard-continue">
              <span className="eyebrow">{L("dashContinue")}</span>
              {lastOpened ? (
                <Link href={`/terms/${lastOpened.term.id}`} className="dashboard-continue-card">
                  <Photo src={termPhoto(lastOpened.term, terms)} size="thumb" />
                  <span>
                    <strong>{lastOpened.term.term}</strong>
                    <small>
                      {categoryLabel(locale, lastOpened.term.category)} · {formatWhen(lastOpened.at, locale, { today: L("today"), yesterday: L("yesterday") })}
                    </small>
                    <em>{L("dashOpenTerm")} →</em>
                  </span>
                </Link>
              ) : (
                <p className="dashboard-empty">{L("dashContinueEmpty")}</p>
              )}
            </section>

            <div className="dashboard-stats">
              <Link href="/progress" className="dashboard-stat streak">
                <small>{L("dashStreak")}</small>
                <strong>{streak.current}</strong>
                <span>{streak.current === 0 ? L("dashStreakZero") : streak.current === 1 ? L("dashStreakOne") : L("dashStreakBody", { n: streak.current })}</span>
              </Link>
              <Link href="/terms?state=mastered" className="dashboard-stat mastery">
                <small>{L("dashMastery")}</small>
                <strong>{counts.total ? Math.round((counts.mastered / counts.total) * 100) : 0}%</strong>
                <span>{L("dashMasteryBody", { m: counts.mastered, n: counts.total })}</span>
              </Link>
              <Link href="/library" className="dashboard-stat saved">
                <small>{L("dashSaved")}</small>
                <strong>{counts.favourites}</strong>
                <span>{L("dashSavedBody", { n: counts.favourites })}</span>
              </Link>
            </div>
          </aside>
        </div>

        <section className="dashboard-categories" aria-labelledby="dash-cat-title">
          <div className="quiz-section-heading">
            <h2 id="dash-cat-title">{L("dashByCategory")}</h2>
            <Link href="/progress">{L("dashSeeProgress")} →</Link>
          </div>
          <div className="dashboard-category-grid">
            {byCategory.map((item) => (
              <Link href={`/terms?category=${encodeURIComponent(item.category)}`} key={item.category} className="dashboard-category">
                <Photo src={categoryPhoto(item.category)} size="thumb" />
                <span>
                  <strong>{categoryLabel(locale, item.category)}</strong>
                  <small>
                    {item.mastered}/{item.total} · {item.pct}%
                  </small>
                  <i className="terms-progress-track">
                    <i style={{ width: `${item.pct}%` }} />
                  </i>
                  <em className="dashboard-category-route">{routeLabel(locale, areaRoute(visible, progress, item.category))} →</em>
                </span>
              </Link>
            ))}
          </div>
          <p className="dashboard-hint">{L("dashNewTermsHint")}</p>
        </section>
      </div>
    </LearnerShell>
  );
}
