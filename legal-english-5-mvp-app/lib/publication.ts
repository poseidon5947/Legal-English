import type { Term } from "./types";

export function requiresAudioUk(term: Pick<Term, "id">) {
  return term.id === "EMP-009";
}

export function publicationBlockers(term: Term): string[] {
  const blockers: string[] = [];
  const quizReady = Boolean(term.quiz?.question && (term.quiz.options?.filter(Boolean).length ?? 0) >= 3);
  if (!quizReady) blockers.push("A complete quiz (at least three options) is required.");
  if (!term.audioUsPath) blockers.push("AudioUS is required before publication.");
  if (requiresAudioUk(term) && !term.audioUkPath) blockers.push("AudioUK is required for EMP-009 before publication.");
  if (!(CATEGORIES_SET.has(term.category))) blockers.push("Category must be Contracts, Corporate Law or Employment Law.");
  return blockers;
}

const CATEGORIES_SET = new Set(["Corporate Law", "Contracts", "Employment Law"]);

export function canPublish(term: Term) {
  return publicationBlockers(term).length === 0;
}
