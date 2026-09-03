"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useApp } from "@/components/app-provider";
import { useLocale } from "@/components/locale-provider";
import { categoryLabel, stateLabel } from "@/lib/i18n";
import { Icon } from "@/components/ui-icons";
import { cardImage } from "@/lib/media";

export default function TermDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { publishedTerms, progress, toggleFavourite, submitQuiz, openTerm } = useApp();
  const { locale, t } = useLocale();
  const term = publishedTerms.find((item) => item.id === id);
  const record = progress[id];
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ correct?: boolean; message?: string } | null>(null);
  useEffect(() => {
    if (id) void openTerm(id);
  }, [id]);
  if (!term) {
    return (
      <AppShell>
        <div className="empty">
          <h1>{t("termUnavailable")}</h1>
          <p>{t("termUnavailableBody")}</p>
          <Link href="/terms">{t("backGlossary")}</Link>
        </div>
      </AppShell>
    );
  }
  const quiz = term.quiz;
  return (
    <AppShell>
      <Link className="back-link" href="/terms">
        ← {t("glossary")}
      </Link>
      <article className="detail">
        <div className="detail-hero">
          <img src={cardImage(term.id)} alt="" />
        </div>
        <header className="detail-title">
          <div>
            <div className="term-meta">
              <span>{categoryLabel(locale, term.category)}</span>
              <span>{term.jurisdiction}</span>
              <span className={`state ${record?.state || "learning"}`}>{stateLabel(locale, record?.state || "learning")}</span>
            </div>
            <h1>{term.term}</h1>
            <p className="translation large">{term.spanishEquivalent}</p>
          </div>
          <div className="detail-tools">
            <button className={`star large ${record?.favourite ? "active" : ""}`} onClick={() => void toggleFavourite(term.id)}>
              ★
            </button>
            <button className="icon-button" aria-label="Audio">
              <Icon name="bell" />
            </button>
          </div>
        </header>
        <section className="definition-card">
          <h2>{t("plainEnglish")}</h2>
          <p className="lead">{term.definition}</p>
          <div className="knowledge-row" aria-label="Knowledge status">
            {[
              ["new", t("stateNew"), "I'm just learning this"],
              ["learning", t("stateLearning"), "I'm getting it"],
              ["mastered", t("stateMastered"), "I know it well"],
            ].map(([state, label, helper]) => (
              <button key={state} className={(record?.state || "learning") === state ? "active" : ""}>
                <strong>{label}</strong>
                <span>{helper}</span>
              </button>
            ))}
          </div>
        </section>
        <div className="two-col">
          <section>
            <h2>{t("civilLaw")}</h2>
            <p>{term.civilLawEquivalent || t("civilEmpty")}</p>
          </section>
          <section className="alert-box">
            <h2>{t("spanishAlert")}</h2>
            <p>{term.spanishSpeakerAlert || t("spanishAlertEmpty")}</p>
          </section>
        </div>
        {(term.audioUsPath || term.audioUkPath) && (
          <section>
            <h2>{t("pronunciation")}</h2>
            <div className="two-col">
              {term.audioUsPath && (
                <div>
                  <p className="muted">{t("audioUS")}</p>
                  <audio controls src={term.audioUsPath} />
                </div>
              )}
              {term.audioUkPath && (
                <div>
                  <p className="muted">{t("audioUK")}</p>
                  <audio controls src={term.audioUkPath} />
                </div>
              )}
            </div>
          </section>
        )}
        {(term.usVariant || term.ukVariant) && (
          <section>
            <h2>{t("jurisdictionVariants")}</h2>
            <div className="two-col">
              {term.usVariant && (
                <p>
                  <b>US · {term.usVariant.variantTerm}</b>
                  <br />
                  {term.usVariant.definition}
                </p>
              )}
              {term.ukVariant && (
                <p>
                  <b>UK · {term.ukVariant.variantTerm}</b>
                  <br />
                  {term.ukVariant.definition}
                </p>
              )}
            </div>
          </section>
        )}
        {term.useItWith.length > 0 && (
          <section>
            <h2>{t("useItWith")}</h2>
            <div className="chips">
              {term.useItWith.map((item) => (
                <span key={item.id}>{item.expression}</span>
              ))}
            </div>
          </section>
        )}
        {term.inContext && (
          <section>
            <h2>{t("inContext")}</h2>
            <blockquote>{term.inContext.exampleText}</blockquote>
          </section>
        )}
        <section className="quiz">
          <div className="quiz-topline">
            <Link href="/terms">← {t("glossary")}</Link>
            <span>{quiz ? "Question 3 of 10" : t("quiz")}</span>
          </div>
          <div className="quiz-progress"><i /></div>
          <span className="eyebrow">{t("quiz")}</span>
          <h2>{quiz?.question || t("noQuiz")}</h2>
          {quiz && (
            <>
              {quiz.options.map((option, index) => (
                <label className={`option ${answer === option ? "selected" : ""}`} key={option}>
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={answer === option}
                    onChange={() => {
                      setAnswer(option);
                      setFeedback(null);
                    }}
                  />
                  <b>{String.fromCharCode(65 + index)}</b>
                  <span>{option}</span>
                </label>
              ))}
              <div className="quiz-footer">
                <button className="ghost" type="button" onClick={() => setAnswer("")}>
                  Previous
                </button>
                <button
                  className="primary"
                  type="button"
                  disabled={!answer}
                  onClick={() => {
                    void submitQuiz(term.id, answer).then(setFeedback);
                  }}
                >
                  {t("submitAnswer")}
                </button>
              </div>
              {feedback?.message && (
                <div className={feedback.correct ? "feedback correct" : "feedback incorrect"}>
                  <strong>{feedback.correct ? t("quizCorrect") : t("quizIncorrect")}</strong>
                  <p>{feedback.message}</p>
                </div>
              )}
            </>
          )}
        </section>
      </article>
    </AppShell>
  );
}
