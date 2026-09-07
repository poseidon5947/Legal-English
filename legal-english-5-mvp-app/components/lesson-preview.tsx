"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { LANDING_EXAMPLE } from "@/lib/landing-example";
import { trackAction } from "@/lib/track";

/**
 * "See how a legal term works in context" — the one product example on the
 * landing page. All term content comes from lib/landing-example.ts, which is
 * pinned by test to the approved MCD entry (brief §3.5: no invented content).
 * Only the UI labels are localized; the MCD text is shown verbatim in both
 * languages, exactly as inside the app. The speaker button uses the browser's
 * speech engine; the studio audio itself stays behind sign-in.
 */

type IconProps = { name: string };

const T = LANDING_EXAMPLE;

const UI: Record<
  Locale,
  {
    tabs: readonly [string, string, string, string, string, string];
    category: string;
    preview: string;
    explore: string;
    sections: string;
    pronunciation: string;
    listen: string;
    play: string;
    playing: string;
    noSpeech: string;
    partOfSpeech: string;
    equivalentNote: string;
    collocations: string;
    contextNote: string;
    practice: string;
    quickQuiz: string;
    correct: string;
    wrong: string;
    correctAnswer: string;
    yourAnswer: string;
    inApp: string;
    check: string;
    tryAgain: string;
    signup: string;
    next: string;
    back: string;
    source: string;
  }
> = {
  en: {
    tabs: ["Definition", "Spanish Equivalent", "Civil Law Equivalent", "Spanish-Speaker Alert", "Use It With", "In Context"],
    category: "Contracts",
    preview: "A look inside your lesson",
    explore: "Explore the term",
    sections: "Lesson sections",
    pronunciation: "Audio pronunciation",
    listen: "Listen",
    play: "Play pronunciation",
    playing: "Playing…",
    noSpeech: "Pronunciation audio plays inside the app after you sign in.",
    partOfSpeech: "noun",
    equivalentNote: "Civil Law · Colombia",
    collocations: "common collocations",
    contextNote: "US · Contracts",
    practice: "Put it into practice",
    quickQuiz: "Quick Quiz",
    correct: "Correct.",
    wrong: "Not quite.",
    correctAnswer: "Correct answer",
    yourAnswer: "Your answer",
    inApp: "Inside the app every quiz explains the answer and updates your progress.",
    check: "Check answer",
    tryAgain: "Try again",
    signup: "Start your 7-day free trial →",
    next: "Next section",
    back: "Back to definition",
    source: "Approved content · Master Content Database",
  },
  es: {
    tabs: ["Definición", "Equivalente en español", "Equivalente en derecho civil", "Alerta para hispanohablantes", "Use It With", "In Context"],
    category: "Contratos",
    preview: "Vista previa de una lección",
    explore: "Explora el término",
    sections: "Secciones de la lección",
    pronunciation: "Pronunciación en audio",
    listen: "Escuchar",
    play: "Reproducir pronunciación",
    playing: "Reproduciendo…",
    noSpeech: "El audio de pronunciación se reproduce dentro de la app al iniciar sesión.",
    partOfSpeech: "sustantivo",
    equivalentNote: "Derecho civil · Colombia",
    collocations: "combinaciones frecuentes",
    contextNote: "EE. UU. · Contratos",
    practice: "Ponlo en práctica",
    quickQuiz: "Quick Quiz",
    correct: "Correcto.",
    wrong: "No exactamente.",
    correctAnswer: "Respuesta correcta",
    yourAnswer: "Tu respuesta",
    inApp: "Dentro de la app cada quiz explica la respuesta y actualiza tu progreso.",
    check: "Comprobar respuesta",
    tryAgain: "Intentar de nuevo",
    signup: "Empieza tu prueba gratis de 7 días →",
    next: "Siguiente sección",
    back: "Volver a la definición",
    source: "Contenido aprobado · Master Content Database",
  },
};

export function LessonPreview({ locale, tabIcons, renderIcon }: { locale: Locale; tabIcons: readonly string[]; renderIcon: (props: IconProps) => ReactNode }) {
  const P = UI[locale];
  const id = useId();
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 600px)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const [tab, setTab] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [speechNote, setSpeechNote] = useState("");
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => () => { if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel(); }, []);

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      setSpeechNote(P.noSpeech);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(T.term);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("en-us"));
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      setSpeechNote(P.noSpeech);
    };
    setSpeechNote("");
    window.speechSynthesis.speak(utterance);
  }

  const panel: ReactNode = (() => {
    switch (tab) {
      case 1:
        return (
          <>
            <p lang="es" className="lesson-translation">{T.spanishEquivalent}</p>
            <div>
              <strong>{P.tabs[1]}</strong>
              <span>{T.term} → {T.spanishEquivalent}</span>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <p lang="es">{T.civilLawEquivalent}</p>
            <div>
              <strong>{P.tabs[2]}</strong>
              <span>{P.equivalentNote}</span>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <p lang="en">{T.spanishSpeakerAlert}</p>
            <div className="alert">
              <strong>{P.tabs[3]}</strong>
              <span>{T.term} ≠ consideración</span>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <ul className="lesson-collocations" aria-label={P.tabs[4]} lang="en">
              {T.useItWith.map((phrase) => (
                <li key={phrase}>{phrase}</li>
              ))}
            </ul>
            <div>
              <strong>{P.tabs[4]}</strong>
              <span>{T.useItWith.length} {P.collocations}</span>
            </div>
          </>
        );
      case 5:
        return (
          <>
            <p lang="en">{T.inContext}</p>
            <div>
              <strong>{P.tabs[5]}</strong>
              <span>{P.contextNote}</span>
            </div>
          </>
        );
      default:
        return (
          <>
            <p lang="en">{T.definition}</p>
            <div>
              <strong>{P.tabs[1]}</strong>
              <span lang="es">{T.spanishEquivalent}</span>
            </div>
          </>
        );
    }
  })();

  const correct = T.quiz.correctIndex;
  const feedback = checked ? (choice === correct ? P.correct : P.wrong) : "";

  function selectTab(next: number, focus = false) {
    setTab(next);
    if (focus) {
      tabButtons.current[next]?.focus();
      tabButtons.current[next]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
    }
  }

  return (
    <div className="lesson-studio" data-reveal>
      <header className="lesson-intro">
        <div className="lesson-meta"><span>{P.category}</span><i aria-hidden="true" /><small>{P.preview}</small></div>
        <div className="lesson-title-row">
          <div><h3 lang="en">{T.term}</h3><p className="lesson-pronunciation"><em>{P.partOfSpeech}</em> · {P.pronunciation}</p></div>
          <button type="button" className={`lesson-audio${speaking ? " speaking" : ""}`} aria-label={speaking ? P.playing : P.play} onClick={speak}>
            {renderIcon({ name: "speaker" })}<span>{speaking ? P.playing : P.listen}</span>
          </button>
        </div>
        {speechNote && <p className="lesson-speech-note" role="status">{speechNote}</p>}
      </header>
      <aside className="lesson-nav">
        <p className="lesson-nav-label">{P.explore}</p>
        <div role="tablist" aria-label={P.sections} aria-orientation={compact ? "horizontal" : "vertical"}>
          {P.tabs.map((label, index) => (
            <button type="button" role="tab" id={`${id}-tab-${index}`} aria-selected={tab === index} aria-controls={`${id}-panel`} tabIndex={tab === index ? 0 : -1} ref={(element) => { tabButtons.current[index] = element; }} key={index} onClick={() => selectTab(index)} onKeyDown={(event) => {
              let next: number;
              if (event.key === "Home") next = 0;
              else if (event.key === "End") next = P.tabs.length - 1;
              else if (event.key === (compact ? "ArrowRight" : "ArrowDown")) next = (index + 1) % P.tabs.length;
              else if (event.key === (compact ? "ArrowLeft" : "ArrowUp")) next = (index + P.tabs.length - 1) % P.tabs.length;
              else return;
              event.preventDefault(); selectTab(next, true);
            }}>
              {renderIcon({ name: tabIcons[index] })}<span>{label}</span><i aria-hidden="true">›</i>
            </button>
          ))}
        </div>
      </aside>
      <article className="lesson-reading" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${tab}`} tabIndex={0}>
        <div className="lesson-reading-body" key={tab}>
          <div className="lesson-section-heading"><span aria-hidden="true">0{tab + 1}</span><h4>{P.tabs[tab]}</h4></div>
          <div className={`lesson-panel-copy panel-${tab}`}>{panel}</div>
        </div>
        <footer className="lesson-reading-footer"><span>0{tab + 1}<i> / 06</i></span><button type="button" onClick={() => selectTab((tab + 1) % P.tabs.length, true)}>{tab === 5 ? P.back : P.next}<span aria-hidden="true">→</span></button></footer>
      </article>
      <article className="lesson-practice" aria-labelledby={`${id}-quiz-title`}>
        <div className="lesson-practice-heading"><span className="lesson-practice-icon">{renderIcon({ name: "contract-clipboard" })}</span><div><small>{P.practice}</small><h3 id={`${id}-quiz-title`}>{P.quickQuiz}</h3></div><span className="lesson-practice-number" aria-hidden="true">01</span></div>
        <div className="lesson-practice-progress" aria-hidden="true"><i style={{ width: checked ? "100%" : choice === null ? "0%" : "50%" }} /></div>
        <h4 id={`${id}-question`} lang="en">{T.quiz.question}</h4>
        <div className="lesson-answers" role="radiogroup" aria-labelledby={`${id}-question`} lang="en">
          {T.quiz.options.map((label, index) => {
            const selected = choice === index;
            const state = checked && index === correct ? "correct" : checked && selected ? "wrong" : "";
            return (
              <label className={`${selected ? "selected" : ""} ${state}`.trim()} key={index}>
                <input className="sr-only" type="radio" name={`${id}-quiz`} checked={selected} disabled={checked} onChange={() => setChoice(index)} />
                <span className="lesson-answer-letter" aria-hidden="true">{state === "correct" ? "✓" : state === "wrong" ? "×" : String.fromCharCode(65 + index)}</span>
                <span className="lesson-answer-copy">{label}{state && <small lang={locale}>{state === "correct" ? P.correctAnswer : P.yourAnswer}</small>}</span>
              </label>
            );
          })}
        </div>
        {feedback && <p className={`lesson-feedback ${choice === correct ? "ok" : "bad"}`} role="status">{feedback} <span lang="en">{T.quiz.explanation}</span><small>{P.inApp}</small></p>}
        {!checked ? <button type="button" className="lesson-check" onClick={() => choice !== null && setChecked(true)} disabled={choice === null}>{P.check}<span aria-hidden="true">→</span></button>
          : choice === correct ? <Link className="lesson-check" href="/signup" onClick={() => trackAction("cta", "example")}>{P.signup}</Link>
          : <button type="button" className="lesson-check" onClick={() => { setChecked(false); setChoice(null); }}>{P.tryAgain}<span aria-hidden="true">↻</span></button>}
        <p className="lesson-source">{P.source} · {T.id} · {T.source.workbook}</p>
      </article>
    </div>
  );
}
