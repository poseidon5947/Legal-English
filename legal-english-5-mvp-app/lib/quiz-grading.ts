import type { Term } from "@/lib/types";

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
