"use client";

import { categoryPhoto } from "@/lib/category-photos";
import { Photo } from "@/components/photo";
import Link from "next/link";
import { Le5Icon, type Le5IconName } from "@/components/le5-icon";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/components/app-provider";
import { LearnerShell } from "@/components/learner-shell";
import { useLocale } from "@/components/locale-provider";
import { useToast } from "@/components/toaster";
import { categoryLabel } from "@/lib/i18n";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";
import { achievementsFor, categoryStats, countsFor, failedTerms, formatWhen, stateOf, streakFor, studyTerms } from "@/lib/learner-stats";
import { quizClientKey } from "@/lib/quiz-grading";
import type { Term } from "@/lib/types";
import { sessionTerms, sessionQuery } from "@/lib/learning-session";

type QuizIcon =
  | "target-accuracy"
  | "clipboard-quizzes"
  | "flame-streak"
  | "graduation-cap"
  | "check-circle"
  | "arrow-right"
  | "document-row"
  | "courthouse"
  | "people-group"
  | "balance-scales"
  | "rising-trend"
  | "trophy-achievement"
  | "history-document"
  | "calendar"
  | "report-bars";

/** D20: quiz icons covered by the approved I01–I04 set render the DFP SVG; the rest have no approved equivalent. */
const QUIZ_APPROVED: Partial<Record<QuizIcon, Le5IconName>> = {
  "arrow-right": "utility/chevron",
  "check-circle": "utility/completion",
  "clipboard-quizzes": "navigation/quiz",
  "document-row": "navigation/terms-library",
  "history-document": "navigation/terms-library",
};
function QuizIcon({ name, className = "" }: { name: QuizIcon; className?: string }) {
  const approved = QUIZ_APPROVED[name];
  if (approved) return <Le5Icon name={approved} className={`quiz-ref-icon ${className}`.trim()} />;
  return <img className={`quiz-ref-icon ${className}`.trim()} src={`/quiz-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

const CATEGORY_ICON: Record<string, Le5IconName> = { Contracts: "areas/contracts", "Corporate Law": "areas/corporate-law", "Employment Law": "areas/employment-law" };
const CATEGORY_TONE: Record<string, string> = { Contracts: "blue", "Corporate Law": "green", "Employment Law": "purple" };
const ACH_ICON: Record<string, QuizIcon> = {
  firstMastery: "check-circle",
  firstSteps: "rising-trend",
  quizMaster: "trophy-achievement",
  consistent: "flame-streak",
  champion: "graduation-cap",
};
const ACH_TONE: Record<string, string> = { firstMastery: "green", firstSteps: "blue", quizMaster: "gold", consistent: "gold", champion: "purple" };
const ACH_TITLE: Record<string, [LearnerKey, LearnerKey]> = {
  firstMastery: ["achFirstMastery", "achFirstMasteryBody"],
  firstSteps: ["achFirstSteps", "achFirstStepsBody"],
  quizMaster: ["achQuizMaster", "achQuizMasterBody"],
  consistent: ["achConsistent", "achConsistentBody"],
  champion: ["achChampion", "achChampionBody"],
};

function letter(index: number) {
  return String.fromCharCode(65 + index);
}

function quizOptions(term: Term) {
  return (term.quiz?.options || []).map((text, i) => ({ letter: letter(i), text })).filter((option) => option.text && option.text.trim());
}

export function QuizWorkspace() {
  const { terms, progress, progressRows, studyDays, quizSessions, session, entitlement, submitQuiz, completeQuizSession } = useApp();
  const { locale, t } = useLocale();
  const { notify } = useToast();
  const params = useSearchParams();
  const L = (key: LearnerKey, vars?: Record<string, string | number>) => learnerText(locale, key, vars);
  const visible = useMemo(() => studyTerms(terms, session), [terms, session]);
  const isOwner = session?.user.role === "admin";
  const canStudy = Boolean(session) && (isOwner || entitlement.allowed);
  const counts = countsFor(visible, progress, studyDays);
  const byCategory = categoryStats(visible, progress);
  const streak = streakFor(progressRows, new Date(), studyDays);
  const quizzesCompleted = quizSessions.length;
  const achievements = achievementsFor(counts, streak, byCategory, quizzesCompleted);

  // Queue: terms with a usable quiz, weakest first, optionally one category or one term.
  const [category, setCategory] = useState<string>(params.get("category") || "All");
  const focusTerm = params.get("term");
  const selectedSession = params.get("session");
  const inSession = selectedSession !== null;
  // D08: /quizzes?practice=<Area|All> — a practice made only of the Terms the
  // learner answered incorrectly and has not corrected yet.
  const practiceArea = params.get("practice");
  const inPractice = practiceArea !== null && !inSession;
  const failedByArea = useMemo(() => failedTerms(visible, progress), [visible, progress]);
  useEffect(() => {
    const next = params.get("category");
    if (next) setCategory(next);
  }, [params]);
  const [queue, setQueue] = useState<string[]>([]);
  const [position, setPosition] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [busy, setBusy] = useState(false);
  // Synchronous re-entry guard: React state updates are async, so two events
  // in the same tick (key + click) could both pass the `busy` check. The ref
  // flips immediately and is what actually blocks a second submission.
  const inFlight = useRef(false);
  const [finished, setFinished] = useState(false);
  const [missed, setMissed] = useState<string[]>([]);
  const [answered, setAnswered] = useState(0);
  // NEW-01: one key per quiz session. Every answer carries it; the session is
  // reported complete only once every question in the queue has been answered.
  const [sessionKey, setSessionKey] = useState(() => quizClientKey());
  const completedKey = useRef<string | null>(null);
  const sessionScope = inSession ? `session:${selectedSession}` : inPractice ? `practice:${practiceArea}` : focusTerm ? `term:${focusTerm}` : category === "All" ? "all" : `area:${category}`;

  function buildQueue(scope: string, onlyTerm?: string | null) {
    // Every published Term with a quiz is practisable, including Terms still
    // New (approved rule, 16 Sep 2026): a wrong answer moves New → Learning,
    // a right one New → Mastered. Learning Terms are served first, then New,
    // then Mastered.
    const pool = visible.filter((term) => quizOptions(term).length >= 3 && term.quiz?.correctOption);
    if (inSession) return sessionTerms(pool, selectedSession).map((term) => term.id);
    if (inPractice) return failedTerms(pool, progress, practiceArea === "All" ? undefined : practiceArea).map((term) => term.id);
    const scoped = onlyTerm ? pool.filter((term) => term.id === onlyTerm) : scope === "All" ? pool : pool.filter((term) => term.category === scope);
    const weight = (term: Term) => (stateOf(progress, term.id) === "mastered" ? 2 : stateOf(progress, term.id) === "learning" ? 0 : 1);
    return [...scoped].sort((a, b) => weight(a) - weight(b) || a.displayOrder - b.displayOrder).map((term) => term.id);
  }
  useEffect(() => {
    if (visible.length === 0) return;
    setQueue(buildQueue(category, focusTerm));
    setPosition(0);
    setSelected(null);
    setResult(null);
    setCorrectCount(0);
    setFinished(false);
    setMissed([]);
    setAnswered(0);
    setSessionKey(quizClientKey());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible.length, category, focusTerm, selectedSession, practiceArea]);

  // The session counts as a completed quiz only when every question has a
  // graded answer — whether the learner pressed Finish on the last question
  // or End quiz after it. Ending early leaves the session incomplete.
  useEffect(() => {
    if (!finished || queue.length === 0 || answered < queue.length || completedKey.current === sessionKey) return;
    completedKey.current = sessionKey;
    void completeQuizSession(sessionKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, answered, queue.length, sessionKey]);

  const current = queue.length ? visible.find((term) => term.id === queue[position]) : undefined;
  const options = current ? quizOptions(current) : [];

  function check() {
    if (!current || selected === null || busy || inFlight.current || !canStudy || result) return;
    inFlight.current = true;
    setBusy(true);
    void submitQuiz(current.id, selected, { clientKey: quizClientKey(), source: inSession || inPractice ? "session" : "runner", session: { key: sessionKey, scope: sessionScope, total: queue.length } })
      .then((response) => {
        // Only a successful, graded response counts as an answer. A failed
        // request (offline, session expired) is reported and the learner's
        // selection is kept so they can simply press Check again.
        if (!response.ok) {
          notify(response.message || t("couldNotContinue"), "error");
          return;
        }
        const correct = Boolean(response.correct);
        setAnswered((value) => value + 1);
        if (correct) setCorrectCount((value) => value + 1);
        else setMissed((list) => (list.includes(current.id) ? list : [...list, current.id]));
        setResult({ correct, message: response.message || "" });
      })
      .finally(() => {
        inFlight.current = false;
        setBusy(false);
      });
  }

  function restart() {
    setQueue(buildQueue(category, focusTerm));
    setPosition(0);
    setSelected(null);
    setResult(null);
    setCorrectCount(0);
    setFinished(false);
    setMissed([]);
    setAnswered(0);
    setSessionKey(quizClientKey());
  }

  // Keyboard: 1-4 (or A-D) pick an option, Enter checks / advances, Esc ends.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (!current || finished) return;
      const key = event.key.toUpperCase();
      const byNumber = /^[1-6]$/.test(key) ? options[Number(key) - 1] : undefined;
      const byLetter = /^[A-F]$/.test(key) ? options.find((option) => option.letter === key) : undefined;
      const pick = byNumber || byLetter;
      if (pick && !result && canStudy) {
        event.preventDefault();
        setSelected(pick.letter);
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (result) advance();
        else check();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, options, result, selected, busy, finished, canStudy, position, queue.length]);

  function advance() {
    if (position + 1 >= queue.length) {
      setFinished(true);
      return;
    }
    setPosition(position + 1);
    setSelected(null);
    setResult(null);
  }

  const history = progressRows
    .filter((row) => row.attempts > 0 && visible.some((term) => term.id === row.termId))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8)
    .map((row) => ({ row, term: visible.find((term) => term.id === row.termId)! }));

  const pct = (part: number) => (counts.total ? Math.round((part / counts.total) * 100) : 0);
  const ring = `conic-gradient(var(--quiz-green) 0 ${pct(counts.mastered)}%, var(--quiz-gold) ${pct(counts.mastered)}% ${pct(counts.mastered) + pct(counts.learning)}%, var(--quiz-blue) ${
    pct(counts.mastered) + pct(counts.learning)
  }% 100%)`;

  return (
    <LearnerShell pageClass="quiz-reference-page">
      <div className="quiz-ref-content">
        <section className="quiz-ref-main-column">
          <div className="quiz-ref-heading">
            <div>
              <div>
                <h1>{L("quizTitle")}</h1>
              </div>
              <p>{L("quizLead")}</p>
            </div>
          </div>

          <section className="quiz-active-card">
            <div className="quiz-active-topline">
              <span>{L("activeQuiz")}</span>
              {queue.length > 0 && !finished && <strong>{L("questionOf", { i: position + 1, n: queue.length })}</strong>}
            </div>
            {queue.length > 0 && !finished && (
              <div className="quiz-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={queue.length} aria-valuenow={position + (result ? 1 : 0)}>
                <i style={{ width: `${((position + (result ? 1 : 0)) / queue.length) * 100}%` }} />
              </div>
            )}
            {inSession ? (
              <div className="session-scope">
                <strong>{locale === "es" ? "Tu sesión de práctica" : "Your practice session"}</strong>
                <span>{locale === "es" ? "Los términos que elegiste, en el mismo orden." : "Your selected terms, in the same order."}</span>
                <Link href={queue[0] ? `/terms/${queue[0]}?${sessionQuery(sessionTerms(visible, selectedSession))}` : "/dashboard"}>{locale === "es" ? "Volver a estudiar" : "Back to studying"}</Link>
              </div>
            ) : inPractice ? (
              <div className="session-scope">
                <strong>{practiceArea === "All" ? L("practiceScopeAll") : L("practiceScopeTitle", { area: categoryLabel(locale, practiceArea) })}</strong>
                <span>{L("practiceScopeBody")}</span>
                <Link href="/quizzes">{L("practiceBack")}</Link>
              </div>
            ) : <div className="quiz-scope">
              {["All", "Contracts", "Corporate Law", "Employment Law"].map((item) => (
                <button key={item} type="button" className={category === item ? "active" : ""} onClick={() => setCategory(item)}>
                  {item === "All" ? L("allQuiz") : categoryLabel(locale, item)}
                </button>
              ))}
            </div>}
            {queue.length === 0 ? (
              <div className="quiz-empty">
                <p>{inPractice ? L("practiceEmpty") : L("noQuizzes")}</p>
                <Link className="primary inline" href={inPractice ? "/quizzes" : category === "All" ? "/terms" : `/terms?category=${encodeURIComponent(category)}`}>
                  {inPractice ? L("practiceBack") : L("openTermsFirst")}
                </Link>
              </div>
            ) : finished ? (
              <>
                <div className="quiz-done">
                  <div className="quiz-done-score" style={{ ["--pct" as string]: `${answered ? Math.round((correctCount / answered) * 100) : 0}%` }}>
                    <strong>{answered ? Math.round((correctCount / answered) * 100) : 0}%</strong>
                  </div>
                  <div>
                    <h2>{L("sessionDone")}</h2>
                    <p>{L("sessionSummary", { correct: correctCount, n: answered })}</p>
                  </div>
                </div>
                {missed.length > 0 && (
                  <div className="quiz-missed">
                    <strong>{missed.length === 1 ? L("reviewMissedOne") : L("reviewMissed", { n: missed.length })}</strong>
                    <ul>
                      {missed.map((id) => {
                        const term = visible.find((item) => item.id === id);
                        if (!term) return null;
                        return (
                          <li key={id}>
                            <Link href={`/terms/${id}${inSession ? `?${sessionQuery(sessionTerms(visible, selectedSession))}` : ""}`}>
                              <b>{term.term}</b>
                              <small>{categoryLabel(locale, term.category)}</small>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                <div className="quiz-active-actions">
                  {inSession && <Link className="primary inline" href="/dashboard">{locale === "es" ? "Continuar aprendiendo" : "Continue learning"}</Link>}
                  <Link href="/progress">{L("viewAll")}</Link>
                  <button type="button" className={inSession ? "ghost" : "primary inline"} onClick={restart}>
                    {L("startAgain")}
                  </button>
                </div>
              </>
            ) : current ? (
              <>
                <h2>
                  <Link href={`/terms/${current.id}${inSession ? `?${sessionQuery(sessionTerms(visible, selectedSession))}` : ""}`}>{current.term}</Link> · {categoryLabel(locale, current.category)}
                </h2>
                <p>{current.quiz?.question}</p>
                <div className="quiz-active-options" role="radiogroup">
                  {options.map((option) => {
                    const isSelected = selected === option.letter;
                    return (
                      <label
                        className={`${isSelected ? "selected" : ""}${result && isSelected ? (result.correct ? " correct" : " wrong") : ""}`}
                        key={`${current.id}-${option.letter}`}
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          name={`quiz-${current.id}`}
                          checked={isSelected}
                          disabled={Boolean(result) || !canStudy}
                          onChange={() => setSelected(option.letter)}
                        />
                        <span className="quiz-option-letter" aria-hidden="true">
                          {option.letter}
                        </span>
                        <b>{option.text}</b>
                        {result && isSelected && result.correct && <QuizIcon name="check-circle" />}
                      </label>
                    );
                  })}
                </div>
                {result && (
                  <div className={`quiz-correct-row ${result.correct ? "" : "wrong"}`}>
                    <QuizIcon name="check-circle" />
                    <span>
                      <strong>{result.correct ? L("correct") : L("incorrect")}</strong> {result.message}
                    </span>
                  </div>
                )}
                <div className="quiz-active-actions">
                  <button type="button" onClick={() => setFinished(true)}>
                    {L("endQuiz")}
                  </button>
                  {result ? (
                    <button type="button" onClick={advance}>
                      {position + 1 >= queue.length ? L("finish") : L("nextQuestion")}
                      <QuizIcon name="arrow-right" />
                    </button>
                  ) : (
                    <button type="button" disabled={selected === null || busy || !canStudy} onClick={check}>
                      {L("checkAnswer")}
                      <QuizIcon name="arrow-right" />
                    </button>
                  )}
                </div>
                <p className="quiz-kbd-hint" aria-hidden="true">
                  {L("kbdPick", { keys: `1–${options.length}` })} · {result ? L("kbdNext") : L("kbdCheck")}
                </p>
              </>
            ) : null}
          </section>

          <section className="quiz-ref-stat-grid" aria-label="Quiz statistics">
            <article className="green">
              <span>
                <QuizIcon name="target-accuracy" />
              </span>
              <div>
                <p>{L("quizAccuracy")}</p>
                <strong>{counts.accuracyPct}%</strong>
                <small>{L("ofQuizzed")}</small>
              </div>
            </article>
            <article className="blue">
              <span>
                <QuizIcon name="clipboard-quizzes" />
              </span>
              <div>
                <p>{L("quizzesCompleted")}</p>
                <strong>{quizzesCompleted}</strong>
                <small>{counts.attempts === 1 ? L("answersRecordedOne") : L("answersRecorded", { n: counts.attempts })}</small>
              </div>
            </article>
            <article className="gold">
              <span>
                <QuizIcon name="flame-streak" />
              </span>
              <div>
                <p>{L("currentStreak")}</p>
                <strong>
                  {streak.current} {streak.current === 1 ? L("day") : L("days")}
                </strong>
                <small>{L("best", { n: streak.longest, unit: streak.longest === 1 ? L("day").toLowerCase() : L("days").toLowerCase() })}</small>
              </div>
            </article>
            <article className="purple">
              <span>
                <QuizIcon name="graduation-cap" />
              </span>
              <div>
                <p>{L("termsMastered")}</p>
                <strong>{counts.mastered}</strong>
                <small>{L("ofTotal", { n: counts.total })}</small>
              </div>
            </article>
          </section>

          <section className="quiz-history-card">
            <div className="quiz-section-heading">
              <h2>{L("recentHistory")}</h2>
              <Link href="/progress">
                {L("viewAll")}
                <QuizIcon name="arrow-right" />
              </Link>
            </div>
            {history.length === 0 ? (
              <p className="quiz-empty">{L("noHistory")}</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>{L("quiz")}</th>
                    <th>{L("score")}</th>
                    <th>{L("date")}</th>
                    <th>{L("category")}</th>
                    <th>{L("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(({ row, term }) => (
                    <tr key={term.id}>
                      <td>
                        <QuizIcon name="document-row" />
                        <Link href={`/terms/${term.id}`}>{term.term}</Link>
                      </td>
                      <td>{row.attempts}</td>
                      <td>{formatWhen(row.updatedAt, locale, { today: L("today"), yesterday: L("yesterday") })}</td>
                      <td>{categoryLabel(locale, term.category)}</td>
                      <td>
                        <span className={row.state === "mastered" ? "passed" : "review"}>{row.state === "mastered" ? L("passed") : L("review")}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="quiz-practice-card">
            <h2>{L("recommended")}</h2>
            <p>{L("recommendedLead")}</p>
            {failedByArea.length === 0 ? (
              <p className="quiz-empty">{L("recommendedNone")}</p>
            ) : (
              <div className="quiz-practice-grid">
                {byCategory
                  .map((item) => ({ item, failed: failedByArea.filter((term) => term.category === item.category) }))
                  .filter(({ failed }) => failed.length > 0)
                  .map(({ item, failed }) => (
                    <article className={`${CATEGORY_TONE[item.category]} with-photo`} key={item.category}>
                      <Photo className="quiz-practice-photo" src={categoryPhoto(item.category)} size="card" />
                      <span>
                        <Le5Icon name={CATEGORY_ICON[item.category]} className="quiz-ref-icon" />
                      </span>
                      <div>
                        <h3>{categoryLabel(locale, item.category)}</h3>
                        <small>{L("needsPractice")}</small>
                        <p>{L("failedCount", { n: failed.length })}</p>
                        <ul className="quiz-practice-terms">
                          {failed.map((term) => (
                            <li key={term.id}>
                              <Link href={`/terms/${term.id}`}>{term.term}</Link>
                            </li>
                          ))}
                        </ul>
                        <Link className="quiz-practice-cta" href={`/quizzes?practice=${encodeURIComponent(item.category)}`}>
                          {L("practiceNow")}
                          <QuizIcon name="arrow-right" />
                        </Link>
                      </div>
                    </article>
                  ))}
              </div>
            )}
          </section>
        </section>

        <aside className="quiz-ref-right-rail">
          <Link className="learner-photo-card" href="/terms?state=learning">
            <Photo src="/home-assets/photos/common-civil.jpg" size="card" />
            <span>
              <small>{L("quizPhotoTag")}</small>
              <strong>{L("quizPhotoTitle")}</strong>
            </span>
          </Link>
          <section className="quiz-overall-card">
            <h2>{L("overallMastery")}</h2>
            <div className="quiz-overall-body">
              <div className="quiz-mastery-ring" style={{ background: counts.total ? ring : undefined }}>
                <strong>{counts.masteryPct}%</strong>
                <span>{L("masteryWord")}</span>
              </div>
              <ul>
                <li>
                  <i /> <strong>{pct(counts.mastered)}%</strong> {L("stateMastered")}
                </li>
                <li>
                  <i /> <strong>{pct(counts.learning)}%</strong> {L("stateLearning")}
                </li>
                <li>
                  <i /> <strong>{pct(counts.newCount)}%</strong> {L("stateNew")}
                </li>
              </ul>
            </div>
            <p>{counts.mastered > 0 ? L("keepGoing") : L("startHint")}</p>
          </section>

          <section className="quiz-snapshot-card">
            <h2>{L("masterySnapshot")}</h2>
            <div>
              <span>
                <b>{L("stateNew")}</b>
                <strong>{counts.newCount}</strong>
                <small>{pct(counts.newCount)}%</small>
              </span>
              <span>
                <b>{L("stateLearning")}</b>
                <strong>{counts.learning}</strong>
                <small>{pct(counts.learning)}%</small>
              </span>
              <span>
                <b>{L("stateMastered")}</b>
                <strong>{counts.mastered}</strong>
                <small>{pct(counts.mastered)}%</small>
              </span>
            </div>
          </section>

          <section className="quiz-achievements-card">
            <div className="quiz-section-heading">
              <h2>{L("recentAchievements")}</h2>
              <Link href="/progress">
                {L("viewAll")}
                <QuizIcon name="arrow-right" />
              </Link>
            </div>
            <div className="quiz-achievement-list">
              {achievements.map((item) => (
                <article className={`${ACH_TONE[item.id]}${item.done ? "" : " pending"}`} key={item.id}>
                  <span>
                    <QuizIcon name={ACH_ICON[item.id]} />
                  </span>
                  <div>
                    <strong>{L(ACH_TITLE[item.id][0])}</strong>
                    <p>{L(ACH_TITLE[item.id][1])}</p>
                  </div>
                  <small>{item.done ? L("achieved") : `${item.value} / ${item.target}`}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="quiz-accuracy-card">
            <div className="quiz-section-heading">
              <h2>{L("categoryAccuracy")}</h2>
              <Link href="/progress">
                {L("fullReport")}
                <QuizIcon name="arrow-right" />
              </Link>
            </div>
            <div className="quiz-accuracy-list">
              {byCategory.map((item) => (
                <article className={CATEGORY_TONE[item.category]} key={item.category}>
                  <span>
                    <Le5Icon name={CATEGORY_ICON[item.category]} className="quiz-ref-icon" />
                    <strong>{categoryLabel(locale, item.category)}</strong>
                  </span>
                  <i>
                    <b style={{ width: `${item.pct}%` }} />
                  </i>
                  <em>{item.pct}%</em>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </LearnerShell>
  );
}
