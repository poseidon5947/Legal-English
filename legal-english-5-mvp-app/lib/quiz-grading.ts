import type { QuizSessionRef, Term } from "@/lib/types";

/**
 * Resolve a submitted answer to one of this Term's own option letters (A–D)
 * and grade it. Returns null when the value is not one of the quiz's options,
 * so an arbitrary string can never be counted as an attempt.
 */
export function gradeAnswer(term: Term, option: string): { letter: string; correct: boolean } | null {
  const quiz = term.quiz;
  if (!quiz) return null;
  const options = quiz.options
    .map((text, index) => ({ letter: String.fromCharCode(65 + index), text: (text ?? "").trim() }))
    .filter((item) => item.text);
  // A manipulated payload (number, object, null) is rejected as "no such option", never a 500.
  const trimmed = typeof option === "string" ? option.trim() : "";
  const match = options.find((item) => item.letter === trimmed.toUpperCase()) ?? options.find((item) => item.text === trimmed);
  if (!match) return null;
  return { letter: match.letter, correct: match.letter === quiz.correctOption.trim().toUpperCase() };
}

/** Browser-side idempotency key for one Check Answer press. */
export function quizClientKey() {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${Date.now().toString(36)}-${random}`;
}

/**
 * Validate the quiz-session reference sent with an answer (NEW-01). Anything
 * malformed — missing key, non-integer or out-of-range total — is treated as
 * "no session" rather than rejected, so a Term-page answer is unaffected.
 */
export function sessionRef(value: unknown): QuizSessionRef | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const key = typeof raw.key === "string" ? raw.key.trim().slice(0, 80) : "";
  const total = typeof raw.total === "number" && Number.isInteger(raw.total) ? raw.total : NaN;
  if (!key || !(total >= 1 && total <= 500)) return null;
  const scope = typeof raw.scope === "string" && raw.scope.trim() ? raw.scope.trim().slice(0, 80) : "all";
  return { key, scope, total };
}
