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
 * "Inconsistencias graves en el estado de progreso" (15 Sep 2026): a Learner
 * account showed 30 Mastered terms with quiz attempts she did not recognise.
 * These tests pin the hardening: no Mastered without an opened term and a
 * graded correct answer; every answer lands in the attempts ledger; a repeated
 * "Check Answer" (same clientKey) cannot inflate attempts or mastery.
 */

const learner = DEMO_ACCOUNTS.find((account) => account.email.startsWith("maria"));
const auth = await store.authenticate(learner.email, learner.password);
assert.ok(auth.ok, "demo learner signs in");
const userId = auth.user.id;

// A fresh alpha seed publishes nothing: the Owner publishes one approved term
// the learner has never touched, so the run starts from a clean "new" state.
const owner = DEMO_ACCOUNTS.find((account) => account.role === "Owner");
const ownerAuth = await store.authenticate(owner.email, owner.password);
assert.ok(ownerAuth.ok, "demo owner signs in");
const ownerBoot = await store.bootstrap(ownerAuth.user.id);
const touched = new Set(ownerBoot.progress.filter((row) => row.userId === userId).map((row) => row.termId));
const candidate = ownerBoot.terms.find((item) => item.quiz && item.mcdStatus === "Approved" && !touched.has(item.id));
assert.ok(candidate, "an approved term with a quiz and no learner progress exists");
const published = await store.setPublished(ownerAuth.user.id, candidate.id, true);
assert.ok(published.ok, `owner can publish ${candidate.id}: ${published.message ?? ""}`);

const boot = await store.bootstrap(userId);
const term = boot.terms.find((item) => item.id === candidate.id && item.quiz);
assert.ok(term, "the learner sees the published term with its quiz");
const correctOption = term.quiz.correctOption.trim().toUpperCase();
const wrongOption = ["A", "B", "C", "D"].find((letter) => letter !== correctOption);

function progressFor(list) {
  return list.find((row) => row.userId === userId && row.termId === term.id);
}

test("a quiz answer is refused until the term has been opened (no unearned Mastered)", async () => {
  const before = progressFor(boot.progress);
  assert.ok(!before || before.state === "new", "seed learner has not opened the term yet");
  const result = await store.submitQuiz(userId, term.id, correctOption, undefined, { clientKey: "k-not-opened", source: "runner" });
  assert.equal(result.ok, false);
  assert.equal(result.code, "not-opened");
  const after = progressFor((await store.bootstrap(userId)).progress);
  assert.ok(!after || after.state === "new");
  assert.ok(!after || after.attempts === 0);
});

test("opening a term records opened_at and moves it to Learning without attempts", async () => {
  const result = await store.openTerm(userId, term.id);
  assert.ok(result.ok);
  const row = progressFor(result.progress);
  assert.equal(row.state, "learning");
  assert.equal(row.attempts, 0);
  assert.ok(row.openedAt, "opened_at stamped");
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

test("an option outside A–D is rejected and does not touch progress", async () => {
  const result = await store.submitQuiz(userId, term.id, "Z", undefined, { clientKey: "k-bad" });
  assert.equal(result.ok, false);
  const row = progressFor((await store.bootstrap(userId)).progress);
  assert.equal(row.attempts, 2);
});
