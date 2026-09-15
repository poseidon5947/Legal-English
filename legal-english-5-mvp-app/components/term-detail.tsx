"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/components/app-provider";
import { LearnerShell } from "@/components/learner-shell";
import { useLocale } from "@/components/locale-provider";
import { useToast } from "@/components/toaster";
import { categoryLabel } from "@/lib/i18n";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";
import { areaNeighbours, stateOf, studyTerms } from "@/lib/learner-stats";
import { quizClientKey } from "@/lib/quiz-grading";
import type { ProgressState } from "@/lib/types";
import { sessionTerms, sessionQuery } from "@/lib/learning-session";

type DetailIcon =
  | "chevron-right"
  | "arrow-left"
  | "arrow-right"
  | "bookmark-outline"
  | "speaker"
  | "contract-document"
  | "definition-book"
  | "spanish-globe"
  | "civil-scales"
  | "warning-triangle"
  | "chain-link"
  | "quote-marks"
  | "mastered-check"
  | "notes-page"
  | "nav-quiz";

function DetailIcon({ name, className = "" }: { name: DetailIcon; className?: string }) {
  return <img className={`consideration-icon ${className}`.trim()} src={`/consideration-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

const STATE_KEY: Record<ProgressState, LearnerKey> = { new: "stateNew", learning: "stateLearning", mastered: "stateMastered" };

/** Answer letters as the store expects them (A–D), from the option index. */
function letter(index: number) {
  return String.fromCharCode(65 + index);
}

export function TermDetail({ id }: { id: string }) {
  const { terms, progress, session, entitlement, openTerm, toggleFavourite, submitQuiz, reportIssue, refresh } = useApp();
  const { notify } = useToast();
  const { locale } = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const L = (key: LearnerKey, vars?: Record<string, string | number>) => learnerText(locale, key, vars);
  const visible = useMemo(() => studyTerms(terms, session), [terms, session]);
  const index = visible.findIndex((term) => term.id === id);
  const term = index >= 0 ? visible[index] : null;
  // Normal browsing follows the area curriculum. A dashboard session instead
  // follows its explicit selection, even when that selection spans areas.
  const area = useMemo(() => areaNeighbours(visible, id), [visible, id]);
  const selectedSession = sessionTerms(visible, params.get("session"));
  const sessionIndex = selectedSession.findIndex((item) => item.id === id);
  const inSession = sessionIndex >= 0;
  const sessionSuffix = inSession ? `?${sessionQuery(selectedSession)}` : "";
  const previous = inSession ? selectedSession[sessionIndex - 1] : area.previous;
  const next = inSession ? selectedSession[sessionIndex + 1] : area.next;
  const position = inSession ? sessionIndex + 1 : area.position;
  const total = inSession ? selectedSession.length : area.total;
  const positionLabel = inSession
    ? (locale === "es" ? `Término ${position} de ${total} de tu sesión` : `Term ${position} of ${total} in your session`)
    : L("termPositionArea", { i: position, n: total, category: term ? categoryLabel(locale, term.category) : "" });
  const row = term ? progress[term.id] : undefined;
  const state = term ? stateOf(progress, term.id) : "new";
  const isOwner = session?.user.role === "admin";
  const canStudy = Boolean(session) && (isOwner || entitlement.allowed);

  // Opening a term is the Learning transition promised in the proposal.
  const opened = useRef<string | null>(null);
  useEffect(() => {
    if (!term || !canStudy || opened.current === term.id) return;
    opened.current = term.id;
    if (state === "new") void openTerm(term.id);
  }, [term, canStudy, state, openTerm]);

  // ← / → move through the curriculum; "s" toggles My Library.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "ArrowLeft" && previous) router.push(`/terms/${previous.id}${sessionSuffix}`);
      else if (event.key === "ArrowRight" && next) router.push(`/terms/${next.id}${sessionSuffix}`);
      else if ((event.key === "s" || event.key === "S") && term && canStudy) void toggleFavourite(term.id);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [previous, next, term, canStudy, router, toggleFavourite, sessionSuffix]);

  // "Report a problem" — the warranty channel promised in the Propuesta, one click from the term.
  const [reportOpen, setReportOpen] = useState(false);
  const [reportKind, setReportKind] = useState<"content" | "translation" | "audio" | "quiz" | "other">("content");
  const [reportText, setReportText] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  useEffect(() => {
    setReportOpen(false);
    setReportText("");
    setReportKind("content");
  }, [id]);
  async function sendReport() {
    if (!term || reportText.trim().length < 5 || reportBusy) return;
    setReportBusy(true);
    try {
      const kindLabel = L(`reportKind_${reportKind}` as LearnerKey);
      const result = await reportIssue(`[${term.id}] ${kindLabel}: ${term.term}`, `${reportText.trim()}\n\n— ${window.location.origin}/terms/${term.id} · MCD ${term.sourceWorkbookVersion}`);
      if (result.ok) {
        notify(L("reportSent"));
        setReportOpen(false);
        setReportText("");
      } else notify(result.message || L("reportFailed"), "error");
    } finally {
      setReportBusy(false);
    }
  }

  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  // Synchronous re-entry guard (state updates are async; a double tap in the
  // same tick must not produce two attempts). One client key per press lets
  // the server drop a duplicated request as well.
  const inFlight = useRef(false);
  useEffect(() => {
    setSelected(null);
    setResult(null);
  }, [id]);
  async function checkAnswer() {
    if (!term || selected === null || inFlight.current || busy || result || !canStudy) return;
    inFlight.current = true;
    setBusy(true);
    const clientKey = quizClientKey();
    try {
      let response = await submitQuiz(term.id, selected, { clientKey, source: "term" });
      if (!response.ok && response.code === "not-opened") {
        // The open request from mount has not landed yet (slow network): record
        // the open, then grade the same press once with the same key.
        await openTerm(term.id);
        response = await submitQuiz(term.id, selected, { clientKey, source: "term" });
      }
      // A failed request is not a wrong answer: report it and keep the selection.
      if (!response.ok) {
        notify(response.message || L("reportFailed"), "error");
        return;
      }
      setResult({ correct: Boolean(response.correct), message: response.message || "" });
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<"us" | "uk" | null>(null);
  // The bootstrap payload already carries the playable URL for each recording:
  // alpha serves /api/media/... behind the session gate, production hands out
  // a short-lived signed Storage URL. Using it (instead of hard-coding the
  // alpha route) is what makes playback work in production.
  const retried = useRef(false);
  const [retryWith, setRetryWith] = useState<"us" | "uk" | null>(null);
  function start(jurisdiction: "us" | "uk") {
    if (!term) return;
    const element = audioRef.current;
    const src = jurisdiction === "us" ? term.audioUsPath : term.audioUkPath;
    if (!element || !src) return;
    if (element.src !== src) element.src = src;
    setPlaying(jurisdiction);
    void element.play().catch(() => void onAudioError(jurisdiction));
  }
  function play(jurisdiction: "us" | "uk") {
    retried.current = false;
    start(jurisdiction);
  }
  async function onAudioError(jurisdiction?: "us" | "uk") {
    const which = jurisdiction ?? playing;
    setPlaying(null);
    // A signed URL expires after a long study session: fetch fresh URLs once
    // and retry before telling the learner the recording is unavailable.
    if (which && !retried.current) {
      retried.current = true;
      if (await refresh()) {
        setRetryWith(which);
        return;
      }
    }
    notify(L("audioFailed"), "error");
  }
  // Runs once the refreshed terms (with new URLs) have rendered.
  useEffect(() => {
    if (!retryWith) return;
    setRetryWith(null);
    start(retryWith);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryWith, terms]);

  const options = term?.quiz ? term.quiz.options.map((text, i) => ({ letter: letter(i), text })).filter((option) => option.text && option.text.trim()) : [];
  const related = term ? visible.filter((item) => item.category === term.category && item.id !== term.id).slice(0, 6) : [];

  if (!term) {
    return (
      <LearnerShell pageClass="consideration-reference-page">
        <div className="consideration-content single">
          <section className="consideration-main-column">
            <div className="blocked-panel">
              <span>{L("libraryTitle")}</span>
              <h1>{L("termNotFound")}</h1>
              <p>{L("termNotFoundBody")}</p>
              <Link className="primary inline" href="/terms">
                {L("backToLibrary")}
              </Link>
            </div>
          </section>
        </div>
      </LearnerShell>
    );
  }

  // Lesson sequence (Product Bible Term Detail / MCD-DEC-09):
  // Term → Pronunciation → Definition → Spanish Equivalent → Civil Law
  // Equivalent* → Use It With → In Context → Spanish-Speaker Alert* →
  // US/UK Variant* → Quick Quiz. Optional (*) cards are hidden when empty.
  // SpanishEquivalent and CivilLawEquivalent are separate fields: one never
  // substitutes for the other, even when the text coincides (EKB-DEC-18).
  const useItWith = term.useItWith.map((item) => item.expression).join(", ");
  const spanishEquivalent = term.spanishEquivalent.trim();
  const civilLawEquivalent = term.civilLawEquivalent.trim();
  // ComparativeLawNote belongs to the Civil Law Equivalent card only.
  const equivalence: LearnerKey | null = /^functional/i.test(term.comparativeLawNote)
    ? "functionalEquivalent"
    : /^direct/i.test(term.comparativeLawNote)
      ? "directEquivalent"
      : null;
  const equivalenceNote = (() => {
    let note = term.comparativeLawNote.replace(/^(direct terminological equivalent|functional equivalent)\s*[:.\-–—]?\s*/i, "").trim();
    if (civilLawEquivalent && note.toLowerCase().startsWith(civilLawEquivalent.toLowerCase())) {
      note = note.slice(civilLawEquivalent.length).replace(/^\s*[.;:,\-–—]\s*/, "").trim();
    }
    return note;
  })();

  return (
    <LearnerShell pageClass="consideration-reference-page">
      <audio ref={audioRef} onEnded={() => setPlaying(null)} onError={() => void onAudioError()} preload="none" />
      <div className="consideration-content">
        <section className="consideration-main-column">
          <nav className="consideration-breadcrumb" aria-label="Breadcrumb">
            <Link href="/terms">{L("breadcrumbLibrary")}</Link>
            <DetailIcon name="chevron-right" />
            <Link href={`/terms?category=${encodeURIComponent(term.category)}`}>{categoryLabel(locale, term.category)}</Link>
            <DetailIcon name="chevron-right" />
            <span>{term.term}</span>
          </nav>

          <div className="consideration-title-row">
            <div>
              <div className="consideration-title-line">
                <h1>{term.term}</h1>
                {term.partOfSpeech && <em className="consideration-pos">{term.partOfSpeech}</em>}
                <button
                  type="button"
                  className={row?.favourite ? "active" : ""}
                  aria-pressed={Boolean(row?.favourite)}
                  aria-label={row?.favourite ? L("inMyLibrary") : L("addToLibrary")}
                  title={row?.favourite ? L("inMyLibrary") : L("addToLibrary")}
                  onClick={() => void toggleFavourite(term.id)}
                >
                  <DetailIcon name="bookmark-outline" />
                </button>
              </div>
              <div className="consideration-pronunciation">
                <button
                  type="button"
                  aria-label={L("playUs")}
                  title={term.audioUsPath ? L("playUs") : L("audioPending")}
                  disabled={!term.audioUsPath}
                  className={playing === "us" ? "playing" : ""}
                  onClick={() => play("us")}
                >
                  <DetailIcon name="speaker" />
                </button>
                <span>US</span>
                {/* M-01: a UK control appears only when an approved AudioUK recording exists (EMP-009). */}
                {term.audioUkPath && (
                  <>
                    <button
                      type="button"
                      aria-label={L("playUk")}
                      title={L("playUk")}
                      className={playing === "uk" ? "playing" : ""}
                      onClick={() => play("uk")}
                    >
                      <DetailIcon name="speaker" />
                    </button>
                    <span>UK</span>
                  </>
                )}
                <strong>{term.pronunciation || (term.audioUsPath ? "" : L("audioPending"))}</strong>
              </div>
            </div>
            <div className="consideration-term-actions">
              <label className="consideration-status-select">
                <span>{L("learningStatus")}</span>
                <button type="button" className={`state-${state}`} disabled>
                  <i />
                  {L(STATE_KEY[state])}
                </button>
              </label>
            </div>
          </div>

          <div className="consideration-detail-stack">
            {term.definition.trim() && (
              <article className="consideration-info-card blue">
                <div className="consideration-info-icon">
                  <DetailIcon name="definition-book" />
                </div>
                <div>
                  <div className="consideration-info-heading">
                    <h2>{L("definition")}</h2>
                  </div>
                  <p>{term.definition}</p>
                </div>
              </article>
            )}

            {spanishEquivalent && (
              <article className="consideration-info-card green">
                <div className="consideration-info-icon">
                  <DetailIcon name="civil-scales" />
                </div>
                <div>
                  <div className="consideration-info-heading">
                    <h2>{L("spanishEquivalent")}</h2>
                  </div>
                  <p lang="es">{spanishEquivalent}</p>
                </div>
              </article>
            )}

            {civilLawEquivalent && (
              <article className="consideration-info-card purple">
                <div className="consideration-info-icon">
                  <DetailIcon name="civil-scales" />
                </div>
                <div>
                  <div className="consideration-info-heading">
                    <h2>{L("civilLaw")}</h2>
                    {equivalence && <span className={`equivalence ${equivalence === "directEquivalent" ? "direct" : "functional"}`}>{L(equivalence)}</span>}
                  </div>
                  <p lang="es">{civilLawEquivalent}</p>
                </div>
              </article>
            )}

            {/* H-04: the approved Comparative Law Note is its own component, so it
                is shown whether or not the Term also has a Civil Law Equivalent
                (CON-008 / CON-009 / CON-010 have a note and no equivalent). */}
            {equivalenceNote && equivalenceNote !== civilLawEquivalent && (
              <article className="consideration-info-card purple comparative-note">
                <div className="consideration-info-icon">
                  <DetailIcon name="civil-scales" />
                </div>
                <div>
                  <div className="consideration-info-heading">
                    <h2>{L("comparativeLawNote")}</h2>
                  </div>
                  <p>{equivalenceNote}</p>
                </div>
              </article>
            )}

            {useItWith.trim() && (
              <article className="consideration-info-card indigo">
                <div className="consideration-info-icon">
                  <DetailIcon name="chain-link" />
                </div>
                <div>
                  <div className="consideration-info-heading">
                    <h2>{L("useItWith")}</h2>
                  </div>
                  <p>{useItWith}</p>
                </div>
              </article>
            )}

            {term.inContext && (
              <article className="consideration-info-card quote">
                <div className="consideration-info-icon">
                  <DetailIcon name="quote-marks" />
                </div>
                <div>
                  <h2>{L("inContext")}</h2>
                  <p>{term.inContext.exampleText}</p>
                  <span>
                    {L("realWorld")}
                    {term.inContext.jurisdiction ? ` · ${term.inContext.jurisdiction}` : ""}
                  </span>
                </div>
              </article>
            )}

            {term.spanishSpeakerAlert.trim() && (
              <article className="consideration-info-card orange">
                <div className="consideration-info-icon">
                  <DetailIcon name="warning-triangle" />
                </div>
                <div>
                  <div className="consideration-info-heading">
                    <h2>{L("speakerAlert")}</h2>
                  </div>
                  <p>{term.spanishSpeakerAlert}</p>
                </div>
              </article>
            )}

            {(term.usVariant || term.ukVariant) && (
              <article className="consideration-info-card indigo">
                <div className="consideration-info-icon">
                  <DetailIcon name="spanish-globe" />
                </div>
                <div>
                  {term.usVariant && (
                    <>
                      <div className="consideration-info-heading">
                        <h2>{L("usVariant")}</h2>
                        <span>{term.usVariant.variantTerm}</span>
                      </div>
                      <p>{term.usVariant.definition}</p>
                    </>
                  )}
                  {term.ukVariant && (
                    <>
                      <div className="consideration-info-heading">
                        <h2>{L("ukVariant")}</h2>
                        <span>{term.ukVariant.variantTerm}</span>
                      </div>
                      <p>{term.ukVariant.definition}</p>
                    </>
                  )}
                </div>
              </article>
            )}
          </div>

          <div className="consideration-bottom-actions">
            {state === "mastered" ? (
              <button type="button" className="done" disabled>
                <DetailIcon name="mastered-check" />
                {L("masteredDone")}
              </button>
            ) : (
              <button type="button" onClick={() => {
                const quiz = document.getElementById("quick-quiz");
                quiz?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
                quiz?.focus({ preventScroll: true });
              }}>
                <DetailIcon name="mastered-check" />
                {L("takeQuizToMaster")}
              </button>
            )}
            <button type="button" className={row?.favourite ? "active" : ""} onClick={() => void toggleFavourite(term.id)}>
              <DetailIcon name="bookmark-outline" />
              {row?.favourite ? L("inMyLibrary") : L("addToLibrary")}
            </button>
          </div>

          {/* H-01 / MOB-UI-05: the one and only Previous / Next control. Previous
              is the secondary action (disabled on the first Term); Next Term is
              the primary action and is disabled on the last Term of the area,
              where "Choose another area" takes over. Stacks on narrow screens. */}
          <nav className="consideration-term-nav consideration-term-nav-main" aria-label={L("termNavigation")}>
            {previous ? (
              <Link className="secondary" href={`/terms/${previous.id}${sessionSuffix}`} title={previous.term}>
                <DetailIcon name="arrow-left" />
                {L("previousTerm")}
              </Link>
            ) : (
              <button type="button" className="secondary" disabled>
                <DetailIcon name="arrow-left" />
                {L("previousTerm")}
              </button>
            )}
            {next ? (
              <Link className="primary" href={`/terms/${next.id}${sessionSuffix}`}>
                {L("nextTerm", { term: next.term })}
                <DetailIcon name="arrow-right" />
              </Link>
            ) : (
              <button type="button" className="primary" disabled>
                {L("nextTermShort")}
                <DetailIcon name="arrow-right" />
              </button>
            )}
          </nav>
          {!next && inSession && (
            <p className="area-end-note" role="status">
              <Link href={`/quizzes${sessionSuffix}`} className="area-end-link">
                {L("dashQuizThem")} <DetailIcon name="arrow-right" />
              </Link>
            </p>
          )}
          {area.last && !inSession && (
            <p className="area-end-note" role="status">
              <strong>{L("areaEndTitle", { category: categoryLabel(locale, term.category) })}</strong> {L("areaEndBody")}
              <Link href="/categories" className="area-end-link">
                {L("areaEndChoose")}
                <DetailIcon name="arrow-right" />
              </Link>
            </p>
          )}
        </section>

        <aside className="consideration-right-rail">
          <div className="consideration-position" aria-label={positionLabel}>
            <div className="consideration-position-track">
              <i style={{ width: `${(position / Math.max(1, total)) * 100}%` }} />
            </div>
            {/* Position only — the keyboard hint looked like a second Previous/Next control (MOB-UI-05). */}
            <span>{positionLabel}</span>
          </div>

          <section className="consideration-quiz-card" id="quick-quiz" tabIndex={-1}>
            <div className="consideration-rail-heading">
              <h2>
                <DetailIcon name="nav-quiz" />
                {L("quickQuiz")}
              </h2>
              <span>{L("oneOfOne")}</span>
            </div>
            {term.quiz && options.length >= 3 ? (
              <>
                <p>{term.quiz.question}</p>
                <div className="consideration-options" role="radiogroup">
                  {options.map((option) => {
                    const isSelected = selected === option.letter;
                    const isCorrectPick = result && isSelected && result.correct;
                    const isWrongPick = result && isSelected && !result.correct;
                    return (
                      <label className={`${isSelected ? "selected" : ""}${isCorrectPick ? " correct" : ""}${isWrongPick ? " wrong" : ""}`} key={`${term.id}-${option.letter}`}>
                        <input
                          type="radio"
                          name={`quiz-${term.id}`}
                          checked={isSelected}
                          disabled={Boolean(result) || !canStudy}
                          onChange={() => setSelected(option.letter)}
                          className="sr-only"
                        />
                        <span />
                        <b>{option.text}</b>
                        {isCorrectPick && <DetailIcon name="mastered-check" />}
                      </label>
                    );
                  })}
                </div>
                {result ? (
                  <>
                    <div className={`consideration-quiz-result ${result.correct ? "ok" : "ko"}`}>
                      <strong>{result.correct ? L("correct") : L("incorrect")}</strong>
                      {result.message && <p>{result.message}</p>}
                    </div>
                    {!result.correct && (
                      <button
                        className="consideration-primary"
                        type="button"
                        onClick={() => {
                          setResult(null);
                          setSelected(null);
                        }}
                      >
                        {L("tryAgain")}
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    className="consideration-primary"
                    type="button"
                    disabled={selected === null || busy || !canStudy}
                    onClick={() => void checkAnswer()}
                  >
                    {L("checkAnswer")}
                  </button>
                )}
              </>
            ) : (
              <p>{L("noQuiz")}</p>
            )}
          </section>

          <section className="consideration-progress-card">
            <h2>{L("yourProgress")}</h2>
            <ol className="lesson-state-steps" aria-label={L("learningStatus")}>
              {(["new", "learning", "mastered"] as const).map((step, i) => (
                <li key={step} aria-current={state === step ? "step" : undefined}>
                  <span aria-hidden="true">{i + 1}</span>
                  <strong>{L(STATE_KEY[step])}</strong>
                </li>
              ))}
            </ol>
            <p className="lesson-state-explanation">{state === "new" ? L("progressNew") : state === "learning" ? L("progressLearning") : L("progressMastered")}</p>
          </section>

          {/* MOB-UI-02: the card exists only when there is at least one other published Term in the area. */}
          {related.length > 0 && (
            <section className="consideration-related-card">
              <div className="consideration-rail-heading">
                <h2>{L("relatedTerms")}</h2>
                <Link href={`/terms?category=${encodeURIComponent(term.category)}`}>{L("viewAllIn", { category: categoryLabel(locale, term.category) })}</Link>
              </div>
              <div>
                {related.map((item) => (
                  <Link href={`/terms/${item.id}`} key={item.id}>
                    {item.term}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* H-03 / MOB-UI-03 / IMP-02: no source-of-truth block, Term id, workbook,
              editorial version, status or attempt counters in the learner UI. Only
              the feedback channel stays. */}
          <section className="consideration-notes-card">
            <div className="consideration-rail-heading">
              <h2>{L("feedbackTitle")}</h2>
            </div>
            <p className="consideration-feedback-lead">{L("feedbackLead")}</p>
            <div className="consideration-report">
              {reportOpen ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void sendReport();
                  }}
                >
                  <label>
                    <span>{L("reportWhat")}</span>
                    <select value={reportKind} onChange={(event) => setReportKind(event.target.value as typeof reportKind)}>
                      {(["content", "translation", "audio", "quiz", "other"] as const).map((kind) => (
                        <option key={kind} value={kind}>
                          {L(`reportKind_${kind}` as LearnerKey)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>{L("reportDetail")}</span>
                    <textarea rows={3} value={reportText} onChange={(event) => setReportText(event.target.value)} placeholder={L("reportPlaceholder")} required minLength={5} />
                  </label>
                  <div>
                    <button type="button" className="ghost" onClick={() => setReportOpen(false)}>
                      {L("cancel")}
                    </button>
                    <button type="submit" className="primary inline" disabled={reportBusy || reportText.trim().length < 5}>
                      {reportBusy ? "…" : L("reportSend")}
                    </button>
                  </div>
                </form>
              ) : (
                <button type="button" className="consideration-report-toggle" onClick={() => setReportOpen(true)}>
                  <DetailIcon name="notes-page" />
                  {L("reportProblem")}
                </button>
              )}
            </div>
          </section>

        </aside>
      </div>
    </LearnerShell>
  );
}
