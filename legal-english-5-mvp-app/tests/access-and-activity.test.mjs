import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { register } from "node:module";

// These modules import each other with "@/lib/…" and extensionless paths;
// the hook resolves both so the real TypeScript runs under node:test.
register(new URL("./_ts-resolver-hooks.mjs", import.meta.url));
const { canLearn, canStudyTerm, lockTerm, termsForAccount } = await import("../lib/access.ts");
const { freshTrial } = await import("../lib/billing-state.ts");
const { acceptDay, bumpStudyDay, localDay } = await import("../lib/study-day.ts");
const { countsFor, streakFor, weeklyActivity } = await import("../lib/learner-stats.ts");
const { DEFAULT_PREFERENCES, normalizePreferences } = await import("../lib/preferences.ts");

const T0 = new Date("2026-09-10T10:00:00Z");
const trialing = () => freshTrial(T0);
const expired = () => ({ ...freshTrial(new Date("2026-01-01T00:00:00Z")), status: "trial_expired" });
const learner = (subscription, disabledAt = null) => ({ role: "learner", disabledAt, subscription });
const owner = () => ({ role: "admin", disabledAt: null, subscription: expired() });
const term = (over = {}) => ({
  id: "CON-001",
  term: "Consideration",
  definition: "Something of value…",
  spanishEquivalent: "Contraprestación",
  civilLawEquivalent: "Causa",
  spanishSpeakerAlert: "Not 'consideración'",
  category: "Contracts",
  topic: "Formation",
  displayOrder: 1,
  jurisdictionUS: true,
  jurisdictionUK: false,
  jurisdiction: "US",
  audioUsPath: "/api/media/CON-001/us",
  audioUkPath: "",
  usVariant: null,
  ukVariant: null,
  useItWith: [{ id: "u1", expression: "valuable consideration", displayOrder: 1 }],
  inContext: { id: "c1", sentence: "…", displayOrder: 1 },
  quiz: { id: "q1", question: "?", options: ["A", "B", "C"], correctOption: "A", explanation: "Because." },
  mcdStatus: "Approved",
  published: true,
  archived: false,
  sourceEditorialVersion: "1",
  sourceLastReviewedAt: "",
  sourceWorkbookVersion: "1.3.81",
  sourceContentHash: "",
  partOfSpeech: "noun",
  comparativeLawNote: "",
  pronunciation: "kənˌsɪdəˈreɪʃən",
  ...over,
});

/* ---- access rules (audit #5, #9, #10) ------------------------------------ */

test("a trialing learner may study a published term; the Owner may study anything", () => {
  assert.equal(canStudyTerm(learner(trialing()), term()).ok, true);
  assert.equal(canStudyTerm(owner(), term({ published: false })).ok, true);
  assert.equal(canStudyTerm(owner(), term({ archived: true })).ok, true);
});

test("expired, deactivated and signed-out accounts are refused before the term is even looked at", () => {
  assert.deepEqual(canLearn(learner(expired())), { ok: false, message: "Access is not active.", reason: "expired" });
  assert.equal(canLearn(learner(trialing(), "2026-09-01T00:00:00Z")).reason, "deactivated");
  assert.equal(canLearn(null).reason, "signed-out");
});

test("learners cannot touch unpublished, archived or nonexistent terms", () => {
  assert.equal(canStudyTerm(learner(trialing()), term({ published: false })).reason, "unavailable");
  assert.equal(canStudyTerm(learner(trialing()), term({ archived: true })).reason, "unavailable");
  assert.equal(canStudyTerm(learner(trialing()), null).reason, "missing");
});

test("a locked term keeps its title and category but none of the taught content or answer key", () => {
  const locked = lockTerm(term());
  assert.equal(locked.locked, true);
  assert.equal(locked.term, "Consideration");
  assert.equal(locked.category, "Contracts");
  assert.equal(locked.definition, "");
  assert.equal(locked.spanishEquivalent, "");
  assert.equal(locked.quiz, null);
  assert.equal(locked.inContext, null);
  assert.deepEqual(locked.useItWith, []);
  assert.equal(locked.audioUsPath, "");
});

test("termsForAccount locks the library for an expired learner and leaves it intact for an active one", () => {
  const list = [term(), term({ id: "CON-002" })];
  assert.equal(termsForAccount(learner(expired()), list).every((item) => item.definition === ""), true);
  assert.equal(termsForAccount(learner(trialing()), list).every((item) => item.definition !== ""), true);
});

/* ---- study days (audit #11, #12) ---------------------------------------- */

test("the client day is accepted only within 36 hours of the server clock", () => {
  const now = new Date("2026-09-10T12:00:00Z");
  assert.equal(acceptDay("2026-09-10", now), "2026-09-10");
  assert.equal(acceptDay("2026-09-11", now), "2026-09-11"); // ahead of UTC (e.g. UTC+14 midnight)
  assert.equal(acceptDay("2026-09-01", now), "2026-09-10"); // back-filling a streak is refused
  assert.equal(acceptDay("not-a-day", now), "2026-09-10");
  assert.equal(acceptDay(undefined, now), "2026-09-10");
});

test("bumpStudyDay aggregates one row per learner per day", () => {
  let rows = bumpStudyDay([], "u1", "2026-09-10", { attempts: 1, correct: 0 });
  rows = bumpStudyDay(rows, "u1", "2026-09-10", { attempts: 1, correct: 1 });
  rows = bumpStudyDay(rows, "u1", "2026-09-11", { opened: 1 });
  rows = bumpStudyDay(rows, "u2", "2026-09-10", { saved: 1 });
  assert.equal(rows.length, 3);
  assert.deepEqual(rows.find((r) => r.userId === "u1" && r.day === "2026-09-10"), { userId: "u1", day: "2026-09-10", opened: 0, attempts: 2, correct: 1, saved: 0 });
});

test("quiz accuracy is correct ÷ attempts, not latest mastery (9 misses + 1 hit = 10%, not 100%)", () => {
  const t = term();
  const progress = { [t.id]: { userId: "u1", termId: t.id, favourite: false, state: "mastered", attempts: 10, updatedAt: T0.toISOString() } };
  const days = [{ userId: "u1", day: "2026-09-10", opened: 1, attempts: 10, correct: 1, saved: 0 }];
  assert.equal(countsFor([t], progress, days).accuracyPct, 10);
  // Without dated rows the legacy mastery ratio is all we have.
  assert.equal(countsFor([t], progress).accuracyPct, 100);
});

test("streaks and weekly activity come from dated rows, so practising today does not erase yesterday", () => {
  const now = new Date(2026, 8, 10, 15, 0, 0); // local Thu 10 Sep 2026
  const today = localDay(now);
  const yesterday = localDay(new Date(2026, 8, 9));
  const twoWeeksAgo = localDay(new Date(2026, 7, 27));
  const days = [
    { userId: "u1", day: today, opened: 2, attempts: 3, correct: 2, saved: 0 },
    { userId: "u1", day: yesterday, opened: 1, attempts: 2, correct: 1, saved: 0 },
    { userId: "u1", day: twoWeeksAgo, opened: 4, attempts: 0, correct: 0, saved: 1 },
  ];
  // The single progress row was last touched today — on its own it would only prove today.
  const rows = [{ userId: "u1", termId: "CON-001", favourite: false, state: "mastered", attempts: 5, updatedAt: now.toISOString() }];
  const streak = streakFor(rows, now, days);
  assert.equal(streak.current, 2);
  assert.equal(streak.longest, 2);
  assert.equal(streakFor(rows, now).current, 1);
  const weeks = weeklyActivity(rows, now, 6, days);
  assert.equal(weeks.at(-1).attempts, 5); // this week: 3 + 2
  assert.equal(weeks.at(-1).studied, 3);
  assert.equal(weeks.at(-3).studied, 4); // two weeks ago keeps its own activity
});

/* ---- preferences (audit #13) -------------------------------------------- */

test("preferences merge defaults with a validated patch and ignore junk", () => {
  assert.deepEqual(normalizePreferences(null), DEFAULT_PREFERENCES);
  const next = normalizePreferences({ reminders: false }, { visibility: "team", dataSharing: "yes", progressSummary: false, bogus: 1 });
  assert.equal(next.reminders, false);
  assert.equal(next.visibility, "team");
  assert.equal(next.dataSharing, false); // string is not a boolean → unchanged
  assert.equal(next.progressSummary, false);
  assert.equal("bogus" in next, false);
});

/* ---- migration 007 -------------------------------------------------------- */

test("migration 007 adds owner-readable, self-writable study days and account preferences", () => {
  const sql = readFileSync(new URL("../supabase/migrations/007_study_days.sql", import.meta.url), "utf8");
  assert.match(sql, /create table if not exists public\.study_days/);
  assert.match(sql, /primary key \(user_id, day\)/);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /"users create own study days".*\n\s*with check \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.doesNotMatch(sql, /for delete/);
  assert.match(sql, /alter table public\.users add column if not exists preferences jsonb/);
  assert.match(sql, /support_tickets add column if not exists updated_at/);
});
