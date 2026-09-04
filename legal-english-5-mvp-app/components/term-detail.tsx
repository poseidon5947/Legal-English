"use client";

import { categoryPhoto } from "@/lib/category-photos";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/components/app-provider";
import { LearnerShell } from "@/components/learner-shell";
import { useLocale } from "@/components/locale-provider";
import { categoryLabel } from "@/lib/i18n";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";
import { formatDate, stateOf, studyTerms } from "@/lib/learner-stats";
import type { ProgressState } from "@/lib/types";

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
const STATE_PCT: Record<ProgressState, number> = { new: 10, learning: 60, mastered: 100 };

/** Answer letters as the store expects them (A–D), from the option index. */
function letter(index: number) {
  return String.fromCharCode(65 + index);
}

export function TermDetail({ id }: { id: string }) {
  const { terms, progress, session, entitlement, openTerm, toggleFavourite, submitQuiz } = useApp();
  const { locale } = useLocale();
  const router = useRouter();
  const L = (key: LearnerKey, vars?: Record<string, string | number>) => learnerText(locale, key, vars);
  const visible = useMemo(() => studyTerms(terms, session), [terms, session]);
  const index = visible.findIndex((term) => term.id === id);
  const term = index >= 0 ? visible[index] : null;
  const previous = index > 0 ? visible[index - 1] : null;
  const next = index >= 0 && index < visible.length - 1 ? visible[index + 1] : null;
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

  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setSelected(null);
    setResult(null);
  }, [id]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<"us" | "uk" | null>(null);
  function play(jurisdiction: "us" | "uk") {
    if (!term) return;
    const element = audioRef.current;
    if (!element) return;
    element.src = `/api/media/${encodeURIComponent(term.id)}/${jurisdiction}`;
    setPlaying(jurisdiction);
    void element.play().catch(() => setPlaying(null));
  }

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

  const sections: { key: LearnerKey; icon: DetailIcon; theme: string; body: string; badge?: LearnerKey }[] = [
    { key: "definition", icon: "definition-book", theme: "blue", body: term.definition },
    { key: "spanishEquivalent", icon: "spanish-globe", theme: "green", body: term.spanishEquivalent, badge: "commonTranslation" },
    { key: "civilLaw", icon: "civil-scales", theme: "purple", body: term.civilLawEquivalent, badge: "legalSystemNote" },
    { key: "speakerAlert", icon: "warning-triangle", theme: "orange", body: term.spanishSpeakerAlert },
    { key: "useItWith", icon: "chain-link", theme: "indigo", body: term.useItWith.map((item) => item.expression).join(", ") },
  ].filter((section) => section.body && section.body.trim()) as { key: LearnerKey; icon: DetailIcon; theme: string; body: string; badge?: LearnerKey }[];

  return (
    <LearnerShell pageClass="consideration-reference-page">
      <audio ref={audioRef} onEnded={() => setPlaying(null)} onError={() => setPlaying(null)} preload="none" />
      <div className="consideration-content">
        <section className="consideration-main-column">
          <div className="consideration-photo-band" aria-hidden="true">
            <img src={categoryPhoto(term.category)} alt="" />
            <span>{categoryLabel(locale, term.category)}</span>
          </div>
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
              <Link className="consideration-category-chip" href={`/terms?category=${encodeURIComponent(term.category)}`}>
                <DetailIcon name="contract-document" />
                {categoryLabel(locale, term.category)}
              </Link>
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
            {sections.map((section) => (
              <article className={`consideration-info-card ${section.theme}`} key={section.key}>
                <div className="consideration-info-icon">
                  <DetailIcon name={section.icon} />
                </div>
                <div>
                  <div className="consideration-info-heading">
                    <h2>{L(section.key)}</h2>
                    {section.badge && <span>{L(section.badge)}</span>}
                  </div>
                  <p>{section.body}</p>
                </div>
              </article>
            ))}

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
          </div>

          <div className="consideration-bottom-actions">
            {state === "mastered" ? (
              <button type="button" className="done" disabled>
                <DetailIcon name="mastered-check" />
                {L("masteredDone")}
              </button>
            ) : (
              <button type="button" onClick={() => document.getElementById("quick-quiz")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
                <DetailIcon name="mastered-check" />
                {L("takeQuizToMaster")}
              </button>
            )}
            <button type="button" className={row?.favourite ? "active" : ""} onClick={() => void toggleFavourite(term.id)}>
              <DetailIcon name="bookmark-outline" />
              {row?.favourite ? L("inMyLibrary") : L("addToLibrary")}
            </button>
            {next && (
              <Link href={`/terms/${next.id}`}>
                {L("nextTerm", { term: next.term })}
                <DetailIcon name="arrow-right" />
              </Link>
            )}
          </div>
        </section>

        <aside className="consideration-right-rail">
          <div className="consideration-term-nav">
            <button type="button" disabled={!previous} onClick={() => previous && router.push(`/terms/${previous.id}`)}>
              <DetailIcon name="arrow-left" />
              {L("previousTerm")}
            </button>
            <button type="button" disabled={!next} onClick={() => next && router.push(`/terms/${next.id}`)}>
              {L("nextTermShort")}
              <DetailIcon name="arrow-right" />
            </button>
          </div>

          <section className="consideration-quiz-card" id="quick-quiz">
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
                      void submitQuiz(term.id, selected).then((response) => {
                        setBusy(false);
                        setResult({ correct: Boolean(response.correct), message: response.ok ? response.message || "" : response.message || "" });
                      });
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
            <div className="consideration-progress-body">
              <div className="consideration-ring" style={{ background: `conic-gradient(#2f73df 0 ${STATE_PCT[state]}%, #e8eef7 ${STATE_PCT[state]}% 100%)` }}>
                <strong>{STATE_PCT[state]}%</strong>
                <span>{L("understanding")}</span>
              </div>
              <p>{state === "new" ? L("progressNew") : state === "learning" ? L("progressLearning") : L("progressMastered", { n: row?.attempts ?? 0 })}</p>
            </div>
            <div className={`consideration-progress-scale state-${state}`}>
              <span>{L("stateNew")}</span>
              <span>{L("stateLearning")}</span>
              <span>{L("stateMastered")}</span>
            </div>
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
          </section>

          <Link className="learner-photo-card compact" href="/quizzes">
            <img src="/home-assets/photos/workflow-study.jpg" alt="" loading="lazy" />
            <span>
              <small>{L("detailPhotoTag")}</small>
              <strong>{L("detailPhotoTitle")}</strong>
            </span>
          </Link>
        </aside>
      </div>
    </LearnerShell>
  );
}
