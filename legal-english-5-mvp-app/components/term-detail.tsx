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
import { areaNeighbours, formatDate, stateOf, studyTerms } from "@/lib/learner-stats";
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
  useEffect(() => {
    setSelected(null);
    setResult(null);
  }, [id]);

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

  // Lesson sequence per Design System v2.3 §10 (fields the MCD delivers):
  // Term → Pronunciation → Definition → Civil Law Equivalent → Use It With →
  // In Context → Spanish-Speaker Alert* → US/UK Variant* → Quick Quiz.
  // Optional (*) cards are hidden when empty (§8 "hide optional sections").
  const useItWith = term.useItWith.map((item) => item.expression).join(", ");
  // The Editorial Knowledge Base classifies each Civil Law Equivalent as a
  // DIRECT TERMINOLOGICAL or a FUNCTIONAL equivalent; the MCD carries that in
  // ComparativeLawNote ("Direct terminological equivalent: …" / "Functional equivalent…").
  const equivalence: LearnerKey | null = /^functional/i.test(term.comparativeLawNote) ? "functionalEquivalent" : /^direct/i.test(term.comparativeLawNote) ? "directEquivalent" : null;
  const equivalenceNote = (() => {
    let note = term.comparativeLawNote.replace(/^(direct terminological equivalent|functional equivalent)\s*[:.\-–—]?\s*/i, "").trim();
    // The note usually restates the equivalent first ("documento de constitución. The U.S. …");
    // the card already shows it as the body, so keep only the explanation.
    const lead = term.civilLawEquivalent.trim();
    if (lead && note.toLowerCase().startsWith(lead.toLowerCase())) note = note.slice(lead.length).replace(/^\s*[.;:,\-–—]\s*/, "").trim();
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
                {term.jurisdictionUK && (
                  <>
                    <button
                      type="button"
                      aria-label={L("playUk")}
                      title={term.audioUkPath ? L("playUk") : L("audioPending")}
                      disabled={!term.audioUkPath}
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

            {(term.civilLawEquivalent.trim() || term.spanishEquivalent.trim()) && (
              <article className="consideration-info-card purple">
                <div className="consideration-info-icon">
                  <DetailIcon name="civil-scales" />
                </div>
                <div>
                  <div className="consideration-info-heading">
                    <h2>{L("civilLaw")}</h2>
                    {equivalence && <span className={`equivalence ${equivalence === "directEquivalent" ? "direct" : "functional"}`}>{L(equivalence)}</span>}
                  </div>
                  <p>{term.civilLawEquivalent || term.spanishEquivalent}</p>
                  {term.civilLawEquivalent.trim() && term.spanishEquivalent.trim() && term.spanishEquivalent.trim() !== term.civilLawEquivalent.trim() && (
                    <p className="consideration-info-sub">
                      <b>{L("commonTranslation")}:</b> {term.spanishEquivalent}
                    </p>
                  )}
                  {equivalenceNote && equivalenceNote !== term.civilLawEquivalent.trim() && <p className="consideration-info-sub">{equivalenceNote}</p>}
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
            {next ? (
              <Link href={`/terms/${next.id}${sessionSuffix}`}>
                {L("nextTerm", { term: next.term })}
                <DetailIcon name="arrow-right" />
              </Link>
            ) : inSession ? (
              <Link href={`/quizzes${sessionSuffix}`}>
                {L("dashQuizThem")} <DetailIcon name="arrow-right" />
              </Link>
            ) : (
              <Link href="/categories" className="area-end-link">
                {L("areaEndChoose")}
                <DetailIcon name="arrow-right" />
              </Link>
            )}
          </div>
          {area.last && !inSession && (
            <p className="area-end-note" role="status">
              <strong>{L("areaEndTitle", { category: categoryLabel(locale, term.category) })}</strong> {L("areaEndBody")}
            </p>
          )}
        </section>

        <aside className="consideration-right-rail">
          <div className="consideration-term-nav">
            <button type="button" disabled={!previous} title={previous ? `← ${previous.term}` : undefined} onClick={() => previous && router.push(`/terms/${previous.id}${sessionSuffix}`)}>
              <DetailIcon name="arrow-left" />
              {L("previousTerm")}
            </button>
            <button type="button" disabled={!next} title={next ? `${next.term} →` : undefined} onClick={() => next && router.push(`/terms/${next.id}${sessionSuffix}`)}>
              {L("nextTermShort")}
              <DetailIcon name="arrow-right" />
            </button>
          </div>
          <div className="consideration-position" aria-label={positionLabel}>
            <div className="consideration-position-track">
              <i style={{ width: `${(position / Math.max(1, total)) * 100}%` }} />
            </div>
            <span>
              {positionLabel} · <kbd>←</kbd> <kbd>→</kbd>
            </span>
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
                    onClick={() => {
                      if (selected === null) return;
                      setBusy(true);
                      void submitQuiz(term.id, selected)
                        .then((response) => {
                          // A failed request is not a wrong answer: report it and keep the selection.
                          if (!response.ok) {
                            notify(response.message || L("reportFailed"), "error");
                            return;
                          }
                          setResult({ correct: Boolean(response.correct), message: response.message || "" });
                        })
                        .finally(() => setBusy(false));
                    }}
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
            <p className="lesson-state-explanation">{state === "new" ? L("progressNew") : state === "learning" ? L("progressLearning") : L("progressMastered", { n: row?.attempts ?? 0 })}</p>
          </section>

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

          <section className="consideration-notes-card">
            <div className="consideration-rail-heading">
              <h2>{L("source")}</h2>
              <span>{term.id}</span>
            </div>
            <div>
              <DetailIcon name="notes-page" />
              <dl className="consideration-source">
                <div>
                  <dt>{L("sourceMcd")}</dt>
                  <dd>{term.sourceWorkbookVersion.split(/\s[–—-]\s/)[0] || "—"}</dd>
                </div>
                <div>
                  <dt>{L("sourceEditorial")}</dt>
                  <dd>{term.sourceEditorialVersion || "—"}</dd>
                </div>
                <div>
                  <dt>{L("sourceReviewed")}</dt>
                  <dd>{formatDate(term.sourceLastReviewedAt, locale)}</dd>
                </div>
                <div>
                  <dt>{L("sourceStatus")}</dt>
                  <dd>{term.mcdStatus || "—"}</dd>
                </div>
                <div>
                  <dt>{L("attempts")}</dt>
                  <dd>{row?.attempts ?? 0}</dd>
                </div>
              </dl>
            </div>
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
