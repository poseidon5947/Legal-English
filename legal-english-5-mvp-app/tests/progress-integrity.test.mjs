import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { register } from "node:module";

// Isolated alpha data directory so these tests never touch data/store.json.
process.env.LE5_DATA_DIR = mkdtempSync(join(tmpdir(), "le5-progress-integrity-"));
register(new URL("./_ts-resolver-hooks.mjs", import.meta.url));
register(new URL("./_next-stub-hooks.mjs", import.meta.url));
const store = await import("../lib/store.ts");
const { DEMO_ACCOUNTS } = await import("../lib/types.ts");

/**
 * "Inconsistencias graves en el estado de progreso" (15 Sep 2026) and the
 * approved functional rule that followed (16 Sep 2026):
 *
 *  - Mastered always requires a graded, recorded correct answer;
 *  - a Term does NOT have to be opened first: a New Term answered wrong becomes
 *    Learning, answered right becomes Mastered, and opened_at stays null;
 *  - opening a Term records opened_at and moves New → Learning;
 *  - every answer lands in the attempts ledger; a repeated "Check Answer"
 *    (same clientKey) cannot inflate attempts or mastery;
 *  - unpublished Terms, unknown ids and manipulated options are refused.
 */

const learner = DEMO_ACCOUNTS.find((account) => account.email.startsWith("maria"));
const auth = await store.authenticate(learner.email, learner.password);
assert.ok(auth.ok, "demo learner signs in");
const userId = auth.user.id;

// A fresh alpha seed publishes nothing: the Owner publishes three approved
// terms the learner has never touched, so every scenario starts from "new".
const owner = DEMO_ACCOUNTS.find((account) => account.role === "Owner");
const ownerAuth = await store.authenticate(owner.email, owner.password);
assert.ok(ownerAuth.ok, "demo owner signs in");
const ownerBoot = await store.bootstrap(ownerAuth.user.id);
const touched = new Set(ownerBoot.progress.filter((row) => row.userId === userId).map((row) => row.termId));
const candidates = ownerBoot.terms.filter((item) => item.quiz && item.mcdStatus === "Approved" && !touched.has(item.id));
assert.ok(candidates.length >= 4, "at least four approved terms with a quiz and no learner progress exist");
const [openedCandidate, wrongFirstCandidate, rightFirstCandidate, unpublishedCandidate] = candidates;
for (const candidate of [openedCandidate, wrongFirstCandidate, rightFirstCandidate]) {
  const published = await store.setPublished(ownerAuth.user.id, candidate.id, true);
  assert.ok(published.ok, `owner can publish ${candidate.id}: ${published.message ?? ""}`);
}

const boot = await store.bootstrap(userId);
const termOf = (candidate) => boot.terms.find((item) => item.id === candidate.id && item.quiz);
const term = termOf(openedCandidate);
const termWrongFirst = termOf(wrongFirstCandidate);
const termRightFirst = termOf(rightFirstCandidate);
assert.ok(term && termWrongFirst && termRightFirst, "the learner sees the published terms with their quizzes");
assert.ok(!boot.terms.some((item) => item.id === unpublishedCandidate.id), "the unpublished term is not visible to the learner");

const correctOf = (t) => t.quiz.correctOption.trim().toUpperCase();
const wrongOf = (t) => ["A", "B", "C", "D"].find((letter) => letter !== correctOf(t));
const correctOption = correctOf(term);
const wrongOption = wrongOf(term);

function progressFor(list, termId = term.id) {
  return list.find((row) => row.userId === userId && row.termId === termId);
}

// ---------------------------------------------------------------------------
// Flow A — open the page first (Learning), then quiz.

test("opening a term records opened_at and moves it to Learning without attempts", async () => {
  const before = progressFor(boot.progress);
  assert.ok(!before || before.state === "new", "seed learner has not touched the term yet");
  const result = await store.openTerm(userId, term.id);
  assert.ok(result.ok);
  const row = progressFor(result.progress);
  assert.equal(row.state, "learning");
  assert.equal(row.attempts, 0);
  assert.ok(row.openedAt, "opened_at stamped");
  assert.equal(row.lastActivityAt, row.openedAt, "opening updates last_activity_at");
  assert.equal(row.quizCompleted ?? false, false);
  assert.equal(row.masteredAt ?? null, null);
});

test("a wrong answer stays Learning and is written to the attempts ledger", async () => {
  const result = await store.submitQuiz(userId, term.id, wrongOption, undefined, { clientKey: "k-wrong-1", source: "term" });
  assert.ok(result.ok);
  assert.equal(result.correct, false);
  const row = progressFor(result.progress);
  assert.equal(row.state, "learning");
  assert.equal(row.attempts, 1);
  assert.equal(row.quizCompleted, true);
  assert.equal(row.quizCorrect, false);
  assert.equal(row.masteredAt, null);
});

test("the same Check Answer press (same clientKey) is not counted twice", async () => {
  const dup = await store.submitQuiz(userId, term.id, wrongOption, undefined, { clientKey: "k-wrong-1", source: "term" });
  assert.ok(dup.ok);
  assert.equal(dup.duplicate, true);
  const row = progressFor(dup.progress);
  assert.equal(row.attempts, 1, "attempts unchanged");
});

test("Mastered requires a graded correct answer and carries mastered_at", async () => {
  const result = await store.submitQuiz(userId, term.id, correctOption, undefined, { clientKey: "k-right-1", source: "term" });
  assert.ok(result.ok);
  assert.equal(result.correct, true);
  const row = progressFor(result.progress);
  assert.equal(row.state, "mastered");
  assert.equal(row.attempts, 2);
  assert.equal(row.quizCompleted, true);
  assert.equal(row.quizCorrect, true);
  assert.ok(row.masteredAt, "mastered_at stamped");
  assert.ok(row.lastActivityAt >= row.openedAt);
});

// ---------------------------------------------------------------------------
// Flow B — quiz a New Term from the global runner without ever opening it.

test("a New term answered wrong from the runner becomes Learning with opened_at null", async () => {
  assert.ok(!progressFor(boot.progress, termWrongFirst.id), "no progress row yet");
  const result = await store.submitQuiz(userId, termWrongFirst.id, wrongOf(termWrongFirst), undefined, { clientKey: "k-new-wrong", source: "runner" });
  assert.ok(result.ok, result.message);
  assert.equal(result.correct, false);
  const row = progressFor(result.progress, termWrongFirst.id);
  assert.equal(row.state, "learning");
  assert.equal(row.attempts, 1);
  assert.equal(row.quizCompleted, true);
  assert.equal(row.quizCorrect, false);
  assert.equal(row.openedAt ?? null, null, "opened_at stays null: the page was never opened");
  assert.equal(row.masteredAt ?? null, null);
  assert.ok(row.lastActivityAt, "last_activity_at set by the quiz");
});

test("a New term answered right from the runner becomes Mastered directly, opened_at still null", async () => {
  assert.ok(!progressFor(boot.progress, termRightFirst.id), "no progress row yet");
  const result = await store.submitQuiz(userId, termRightFirst.id, correctOf(termRightFirst), undefined, { clientKey: "k-new-right", source: "runner" });
  assert.ok(result.ok, result.message);
  assert.equal(result.correct, true);
  const row = progressFor(result.progress, termRightFirst.id);
  assert.equal(row.state, "mastered");
  assert.equal(row.attempts, 1);
  assert.equal(row.quizCompleted, true);
  assert.equal(row.quizCorrect, true);
  assert.ok(row.masteredAt, "mastered_at stamped");
  assert.equal(row.openedAt ?? null, null, "opened_at stays null: the page was never opened");
  assert.equal(row.lastActivityAt, row.masteredAt);
});

test("a duplicated runner press on a New term is a no-op", async () => {
  const dup = await store.submitQuiz(userId, termRightFirst.id, correctOf(termRightFirst), undefined, { clientKey: "k-new-right", source: "runner" });
  assert.ok(dup.ok);
  assert.equal(dup.duplicate, true);
  assert.equal(progressFor(dup.progress, termRightFirst.id).attempts, 1);
});

test("opening a Mastered term afterwards records opened_at without changing state or attempts", async () => {
  const result = await store.openTerm(userId, termRightFirst.id);
  assert.ok(result.ok);
  const row = progressFor(result.progress, termRightFirst.id);
  assert.equal(row.state, "mastered");
  assert.equal(row.attempts, 1);
  assert.ok(row.openedAt, "opened_at now recorded");
});

// ---------------------------------------------------------------------------
// Server-side rejections.

test("an option outside A–D is rejected and does not touch progress", async () => {
  const result = await store.submitQuiz(userId, term.id, "Z", undefined, { clientKey: "k-bad" });
  assert.equal(result.ok, false);
  const row = progressFor((await store.bootstrap(userId)).progress);
  assert.equal(row.attempts, 2);
});

test("a non-string option (manipulated payload) is rejected cleanly, never thrown", async () => {
  for (const bad of [3, null, { letter: "A" }, ["A"], true]) {
    const result = await store.submitQuiz(userId, term.id, bad, undefined, { clientKey: `k-bad-${typeof bad}-${JSON.stringify(bad)}` });
    assert.equal(result.ok, false);
  }
  assert.equal(progressFor((await store.bootstrap(userId)).progress).attempts, 2);
});

test("an unpublished term cannot be quizzed", async () => {
  const result = await store.submitQuiz(userId, unpublishedCandidate.id, "A", undefined, { clientKey: "k-unpublished", source: "runner" });
  assert.equal(result.ok, false);
  assert.ok(!progressFor((await store.bootstrap(userId)).progress, unpublishedCandidate.id));
});

test("an unknown term id cannot be quizzed", async () => {
  const result = await store.submitQuiz(userId, "ZZZ-999", "A", undefined, { clientKey: "k-unknown", source: "runner" });
  assert.equal(result.ok, false);
});
