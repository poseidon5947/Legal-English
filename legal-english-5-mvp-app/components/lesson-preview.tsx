"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

/**
 * Interactive "Inside a lesson" preview on the landing page. Real MCD content
 * for CON-005 (consideration): the six tabs switch the term panels, the
 * speaker button pronounces the term with the browser's speech engine (the
 * studio audio itself stays behind sign-in), and the quick quiz grades the
 * visitor's pick before inviting them to sign up.
 */

type Copy = {
  tabs: readonly [string, string, string, string, string, string];
  pronunciation: string;
  definition: string;
  exampleLabel: string;
  example: string;
  quickQuiz: string;
  quizCount: string;
  question: string;
  options: readonly [string, string, string, string];
  check: string;
  viewFull: string;
};

type IconProps = { name: string };

const PANEL_COPY: Record<Locale, { spanishLabel: string; civilLabel: string; alertLabel: string; useLabel: string; contextLabel: string; spanish: string; civil: string; alert: string; useWith: readonly string[]; context: string; play: string; playing: string; noSpeech: string; correct: string; wrong: string; pick: string; explanation: string; tryAgain: string; signup: string }> = {
  en: {
    spanishLabel: "SPANISH EQUIVALENT",
    civilLabel: "CIVIL LAW EQUIVALENT",
    alertLabel: "SPANISH-SPEAKER ALERT",
    useLabel: "USE IT WITH",
    contextLabel: "IN CONTEXT",
    spanish: "contraprestación",
    civil: "There is no exact functional equivalent in Colombian civil law. Consideration is a requirement specific to contracts under the common law.",
    alert: "In contract law, “consideration” does not mean “consideración.” It generally means “contraprestación.”",
    useWith: ["in consideration of", "sufficient consideration", "lack of consideration", "consideration for the agreement"],
    context: "One company paid $1,000 in consideration for the services provided by the other company.",
    play: "Play pronunciation",
    playing: "Playing…",
    noSpeech: "Pronunciation audio plays inside the app after you sign in.",
    correct: "Correct. Consideration is what each party gives or promises in exchange.",
    wrong: "Not quite. Consideration is what each party gives or promises in exchange.",
    pick: "Choose an answer first.",
    explanation: "Inside the app every quiz explains the answer and updates your progress to Learning or Mastered.",
    tryAgain: "Try again",
    signup: "Start free trial →",
  },
  es: {
    spanishLabel: "EQUIVALENTE EN ESPAÑOL",
    civilLabel: "EQUIVALENTE EN DERECHO CIVIL",
    alertLabel: "ALERTA PARA HISPANOHABLANTES",
    useLabel: "SE USA CON",
    contextLabel: "EN CONTEXTO",
    spanish: "contraprestación",
    civil: "No existe un equivalente funcional exacto en el derecho civil colombiano. Consideration es un requisito característico de los contratos bajo el common law.",
    alert: "En derecho contractual, “consideration” no significa “consideración”. Generalmente significa “contraprestación”.",
    useWith: ["in consideration of", "sufficient consideration", "lack of consideration", "consideration for the agreement"],
    context: "One company paid $1,000 in consideration for the services provided by the other company.",
    play: "Reproducir pronunciación",
    playing: "Reproduciendo…",
    noSpeech: "El audio de pronunciación se reproduce dentro de la app al iniciar sesión.",
    correct: "Correcto. La consideration es lo que cada parte da o promete a cambio.",
    wrong: "No exactamente. La consideration es lo que cada parte da o promete a cambio.",
    pick: "Elige primero una respuesta.",
    explanation: "Dentro de la app cada quiz explica la respuesta y actualiza tu progreso a Aprendiendo o Dominado.",
    tryAgain: "Intentar de nuevo",
    signup: "Empezar prueba gratis →",
  },
};

const CORRECT_INDEX = 2;

export function LessonPreview({ copy, locale, tabIcons, renderIcon }: { copy: Copy; locale: Locale; tabIcons: readonly string[]; renderIcon: (props: IconProps) => ReactNode }) {
  const P = PANEL_COPY[locale];
  const id = useId();
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const [compact, setCompact] = useState(false);
  const es = locale === "es";
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
    const utterance = new SpeechSynthesisUtterance("consideration");
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

  function check() {
    if (choice === null) return;
    setChecked(true);
  }

  const panel: ReactNode = (() => {
    switch (tab) {
      case 1:
        return (
          <>
            <p lang="es" className="lesson-translation">{P.spanish}</p>
            <div>
              <strong>{P.spanishLabel}</strong>
              <span>consideration → contraprestación</span>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <p>{P.civil}</p>
            <div>
              <strong>{P.civilLabel}</strong>
              <span>Colombia · Código Civil / Código de Comercio</span>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <p>{P.alert}</p>
            <div className="alert">
              <strong>{P.alertLabel}</strong>
              <span>consideration ≠ consideración</span>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <ul className="lesson-collocations" aria-label={P.useLabel}>
              {P.useWith.map((phrase) => (
                <li key={phrase}>{phrase}</li>
              ))}
            </ul>
            <div>
              <strong>{P.useLabel}</strong>
              <span>{P.useWith.length} {es ? "combinaciones frecuentes" : "common collocations"}</span>
            </div>
          </>
        );
      case 5:
        return (
          <>
            <p>{P.context}</p>
            <div>
              <strong>{P.contextLabel}</strong>
              <span>US · Contracts</span>
            </div>
          </>
        );
      default:
        return (
          <>
            <p>{copy.definition}</p>
            <div>
              <strong>{copy.exampleLabel}</strong>
              <span>{copy.example}</span>
            </div>
          </>
        );
    }
  })();

  const feedback = checked ? (choice === CORRECT_INDEX ? P.correct : P.wrong) : "";

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
        <div className="lesson-meta"><span>{es ? "Contratos" : "Contracts"}</span><i aria-hidden="true" /><small>{es ? "Vista previa de una lección" : "A look inside your lesson"}</small></div>
        <div className="lesson-title-row">
          <div><h3 lang="en">Consideration</h3><p className="lesson-pronunciation">{copy.pronunciation}</p></div>
          <button type="button" className={`lesson-audio${speaking ? " speaking" : ""}`} aria-label={speaking ? P.playing : P.play} onClick={speak}>
            {renderIcon({ name: "speaker" })}<span>{speaking ? P.playing : es ? "Escuchar" : "Listen"}</span>
          </button>
        </div>
        {speechNote && <p className="lesson-speech-note" role="status">{speechNote}</p>}
      </header>
      <aside className="lesson-nav">
        <p className="lesson-nav-label">{es ? "Explora el término" : "Explore the term"}</p>
        <div role="tablist" aria-label={es ? "Secciones de la lección" : "Lesson sections"} aria-orientation={compact ? "horizontal" : "vertical"}>
          {copy.tabs.map((label, index) => (
            <button type="button" role="tab" id={`${id}-tab-${index}`} aria-selected={tab === index} aria-controls={`${id}-panel`} tabIndex={tab === index ? 0 : -1} ref={(element) => { tabButtons.current[index] = element; }} key={index} onClick={() => selectTab(index)} onKeyDown={(event) => {
              let next: number;
              if (event.key === "Home") next = 0;
              else if (event.key === "End") next = copy.tabs.length - 1;
              else if (event.key === (compact ? "ArrowRight" : "ArrowDown")) next = (index + 1) % copy.tabs.length;
              else if (event.key === (compact ? "ArrowLeft" : "ArrowUp")) next = (index + copy.tabs.length - 1) % copy.tabs.length;
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
          <div className="lesson-section-heading"><span aria-hidden="true">0{tab + 1}</span><h4>{copy.tabs[tab]}</h4></div>
          <div className={`lesson-panel-copy panel-${tab}`}>{panel}</div>
        </div>
        <footer className="lesson-reading-footer"><span>0{tab + 1}<i> / 06</i></span><button type="button" onClick={() => selectTab((tab + 1) % copy.tabs.length, true)}>{tab === 5 ? (es ? "Volver a definición" : "Back to definition") : (es ? "Siguiente sección" : "Next section")}<span aria-hidden="true">→</span></button></footer>
      </article>
      <article className="lesson-practice" aria-labelledby={`${id}-quiz-title`}>
        <div className="lesson-practice-heading"><span className="lesson-practice-icon">{renderIcon({ name: "contract-clipboard" })}</span><div><small>{es ? "Ponlo en práctica" : "Put it into practice"}</small><h3 id={`${id}-quiz-title`}>{copy.quickQuiz}</h3></div><span className="lesson-practice-number" aria-hidden="true">01</span></div>
        <div className="lesson-practice-progress" aria-hidden="true"><i style={{ width: checked ? "100%" : choice === null ? "0%" : "50%" }} /></div>
        <h4 id={`${id}-question`}>{copy.question}</h4>
        <div className="lesson-answers" role="radiogroup" aria-labelledby={`${id}-question`}>
          {copy.options.map((label, index) => {
            const selected = choice === index;
            const state = checked && index === CORRECT_INDEX ? "correct" : checked && selected ? "wrong" : "";
            return (
              <label className={`${selected ? "selected" : ""} ${state}`.trim()} key={index}>
                <input className="sr-only" type="radio" name={`${id}-quiz`} checked={selected} disabled={checked} onChange={() => setChoice(index)} />
                <span className="lesson-answer-letter" aria-hidden="true">{state === "correct" ? "✓" : state === "wrong" ? "×" : String.fromCharCode(65 + index)}</span>
                <span className="lesson-answer-copy">{label}{state && <small>{state === "correct" ? (es ? "Respuesta correcta" : "Correct answer") : (es ? "Tu respuesta" : "Your answer")}</small>}</span>
              </label>
            );
          })}
        </div>
        {feedback && <p className={`lesson-feedback ${choice === CORRECT_INDEX ? "ok" : "bad"}`} role="status">{feedback}<small>{P.explanation}</small></p>}
        {!checked ? <button type="button" className="lesson-check" onClick={check} disabled={choice === null}>{copy.check}<span aria-hidden="true">→</span></button>
          : choice === CORRECT_INDEX ? <Link className="lesson-check" href="/signup">{P.signup}</Link>
          : <button type="button" className="lesson-check" onClick={() => { setChecked(false); setChoice(null); }}>{P.tryAgain}<span aria-hidden="true">↻</span></button>}
        <Link className="lesson-full-quiz" href="/quizzes">{copy.viewFull}</Link>
      </article>
    </div>
  );
}
