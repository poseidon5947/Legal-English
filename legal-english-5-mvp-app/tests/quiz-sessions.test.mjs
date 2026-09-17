import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { register } from "node:module";

// Isolated alpha data directory so these tests never touch data/store.json.
process.env.LE5_DATA_DIR = mkdtempSync(join(tmpdir(), "le5-quiz-sessions-"));
register(new URL("./_ts-resolver-hooks.mjs", import.meta.url));
register(new URL("./_next-stub-hooks.mjs", import.meta.url));
const store = await import("../lib/store.ts");
const { DEMO_ACCOUNTS } = await import("../lib/types.ts");
const { achievementsFor, countsFor, streakFor, categoryStats } = await import("../lib/learner-stats.ts");

/**
 * NEW-01 (client revalidation, 17 Sep 2026): "Quizzes Completed" rose from
 * 10 to 11 after ONE answer on question 1 of 30. The metric was the sum of
 * question attempts. Approved criterion: it increments only when a defined
 * quiz session is finished; question attempts and Term attempts are counted
 * separately.
 */

const learner = DEMO_ACCOUNTS.find((account) => account.email.startsWith("maria"));
const auth = await store.authenticate(learner.email, learner.password);
assert.ok(auth.ok);
const userId = auth.user.id;

const owner = DEMO_ACCOUNTS.find((account) => account.role === "Owner");
const ownerAuth = await store.authenticate(owner.email, owner.password);
const ownerBoot = await store.bootstrap(ownerAuth.user.id);
const candidates = ownerBoot.terms.filter((item) => item.quiz && item.mcdStatus === "Approved").slice(0, 3);
assert.equal(candidates.length, 3);
for (const candidate of candidates) assert.ok((await store.setPublished(ownerAuth.user.id, candidate.id, true)).ok);
const boot = await store.bootstrap(userId);
const terms = candidates.map((candidate) => boot.terms.find((item) => item.id === candidate.id));
const correctOf = (t) => t.quiz.correctOption.trim().toUpperCase();
const wrongOf = (t) => ["A", "B", "C", "D"].find((letter) => letter !== correctOf(t));

const completedCount = async () => (await store.bootstrap(userId)).quizSessions.length;
// Attempts relative to the seeded demo progress, so the assertions read as "this test added N".
const seededAttempts = boot.progress.reduce((sum, row) => sum + (row.attempts ?? 0), 0);
const attemptsCount = async () => (await store.bootstrap(userId)).progress.reduce((sum, row) => sum + (row.attempts ?? 0), 0) - seededAttempts;
let n = 0;
const key = () => `k-${Date.now()}-${++n}`;

test("a fresh learner has 0 completed quizzes and the bootstrap carries the list", async () => {
  assert.deepEqual(boot.quizSessions, []);
});

test("answering question 1 of 3 records an attempt but does NOT complete a quiz", async () => {
  const session = { key: "s-one", scope: "all", total: 3 };
  const first = await store.submitQuiz(userId, terms[0].id, correctOf(terms[0]), undefined, { clientKey: key(), source: "runner", session });
  assert.ok(first.ok);
  assert.equal(await attemptsCount(), 1, "the question attempt is counted");
  assert.equal(await completedCount(), 0, "Quizzes Completed is unchanged");
});

test("asking the server to complete a session with unanswered questions is refused", async () => {
  const result = await store.completeQuizSession(userId, "s-one");
  assert.equal(result.ok, false);
  assert.equal(result.answered, 1);
  assert.equal(result.total, 3);
  assert.equal(await completedCount(), 0);
});

test("ending a quiz early (2 of 3 answered) never completes it", async () => {
  const session = { key: "s-one", scope: "all", total: 3 };
  await store.submitQuiz(userId, terms[1].id, wrongOf(terms[1]), undefined, { clientKey: key(), source: "runner", session });
  assert.equal((await store.completeQuizSession(userId, "s-one")).ok, false);
  assert.equal(await completedCount(), 0);
  assert.equal(await attemptsCount(), 2);
});

test("once every question has a recorded answer the session completes exactly once", async () => {
  const session = { key: "s-one", scope: "all", total: 3 };
  await store.submitQuiz(userId, terms[2].id, correctOf(terms[2]), undefined, { clientKey: key(), source: "runner", session });
  const done = await store.completeQuizSession(userId, "s-one");
  assert.ok(done.ok);
  assert.equal(await completedCount(), 1, "Quizzes Completed = 1 after the whole session");
  const [row] = (await store.bootstrap(userId)).quizSessions;
  assert.equal(row.total, 3);
  assert.equal(row.answered, 3);
  assert.equal(row.correct, 2);
  assert.ok(row.completedAt);
  // Double "Finish" (retry, double tap) is a no-op.
  const again = await store.completeQuizSession(userId, "s-one");
  assert.ok(again.ok && again.duplicate);
  assert.equal(await completedCount(), 1);
});

test("Term-page answers (no session) count as attempts only, and unknown sessions are refused", async () => {
  await store.submitQuiz(userId, terms[0].id, correctOf(terms[0]), undefined, { clientKey: key(), source: "term" });
  assert.equal(await attemptsCount(), 4);
  assert.equal(await completedCount(), 1);
  assert.equal((await store.completeQuizSession(userId, "never-started")).ok, false);
  assert.equal((await store.completeQuizSession(userId, 42)).ok, false);
});

test("a malformed session reference is ignored rather than crashing the answer", async () => {
  for (const bad of [{ key: "x", total: 0 }, { key: "", total: 3 }, { key: "x", total: 1.5 }, { key: "x", total: 9999 }, "str", 7]) {
    const result = await store.submitQuiz(userId, terms[1].id, correctOf(terms[1]), undefined, { clientKey: key(), source: "runner", session: bad });
    assert.ok(result.ok, JSON.stringify(bad));
  }
  assert.equal(await completedCount(), 1);
});

test("Quiz Master counts completed quizzes, not question attempts", async () => {
  const fresh = await store.bootstrap(userId);
  const progress = Object.fromEntries(fresh.progress.map((row) => [row.termId, row]));
  const counts = countsFor(fresh.terms, progress, fresh.studyDays);
  assert.ok(counts.attempts >= 10, "the learner has at least 10 question attempts by now");
  const achievements = achievementsFor(counts, streakFor(fresh.progress, new Date(), fresh.studyDays), categoryStats(fresh.terms, progress), fresh.quizSessions.length);
  const quizMaster = achievements.find((item) => item.id === "quizMaster");
  assert.equal(quizMaster.value, 1);
  assert.equal(quizMaster.done, false);
});
