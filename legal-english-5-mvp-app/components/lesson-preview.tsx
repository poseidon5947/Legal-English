"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
            <p lang="es" className="home-ref-term-big">{P.spanish}</p>
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
            <ul className="home-ref-term-chips" aria-label={P.useLabel}>
              {P.useWith.map((phrase) => (
                <li key={phrase}>{phrase}</li>
              ))}
            </ul>
            <div>
              <strong>{P.useLabel}</strong>
              <span>{P.useWith.length} collocations · MCD v1.3.81</span>
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

  return (
    <div className="home-ref-lesson" data-reveal>
      <aside role="tablist" aria-label={copy.tabs[0]}>
        {copy.tabs.map((label, index) => (
          <button
            type="button"
            role="tab"
            aria-selected={tab === index}
            aria-controls="home-lesson-panel"
            className={tab === index ? "active" : ""}
            key={label}
            onClick={() => setTab(index)}
          >
            {renderIcon({ name: tabIcons[index] })}
            {label}
          </button>
        ))}
      </aside>
      <article className="home-ref-term" id="home-lesson-panel" role="tabpanel">
        <h3>Consideration</h3>
        <button type="button" className={speaking ? "speaking" : ""} aria-label={speaking ? P.playing : P.play} title={P.play} onClick={speak}>
          {renderIcon({ name: "speaker" })}
        </button>
        <p className="home-ref-pronunciation">{copy.pronunciation}</p>
        {speechNote && <p className="home-ref-speech-note" role="status">{speechNote}</p>}
        {panel}
      </article>
      <article className="home-ref-quiz">
        <div>
          <strong>{copy.quickQuiz}</strong>
          <span>{copy.quizCount}</span>
        </div>
        <h3 id="home-quiz-question">{copy.question}</h3>
        <div className="home-ref-quiz-options" role="radiogroup" aria-labelledby="home-quiz-question">
          {copy.options.map((label, index) => {
            const selected = choice === index;
            const state = checked && selected ? (index === CORRECT_INDEX ? "correct" : "wrong") : checked && index === CORRECT_INDEX ? "reveal" : "";
            return (
              <label className={`${selected ? "selected" : ""} ${state}`.trim()} key={label}>
                <input type="radio" name="home-quiz" checked={selected} disabled={checked} onChange={() => setChoice(index)} />
                {label}
                {(selected || state === "reveal") && renderIcon({ name: state === "wrong" ? "help" : "shield-badge" })}
              </label>
            );
          })}
        </div>
        {feedback && (
          <p className={`home-ref-quiz-feedback ${choice === CORRECT_INDEX ? "ok" : "bad"}`} role="status">
            {feedback} <small>{P.explanation}</small>
          </p>
        )}
        {!checked ? (
          <button type="button" className="primary" onClick={check} disabled={choice === null} title={choice === null ? P.pick : undefined}>
            {copy.check}
          </button>
        ) : choice === CORRECT_INDEX ? (
          <Link className="primary" href="/signup">
            {P.signup}
          </Link>
        ) : (
          <button
            type="button"
            className="primary"
            onClick={() => {
              setChecked(false);
              setChoice(null);
            }}
          >
            {P.tryAgain}
          </button>
        )}
        <Link href="/quizzes">{copy.viewFull}</Link>
      </article>
    </div>
  );
}
