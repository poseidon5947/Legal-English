import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { register } from "node:module";

// Hito B clarification (9 Sep 2026): guided route per area — Start / Continue
// Learning, Next Term inside the area by DisplayOrder, no locking.
register(new URL("./_ts-resolver-hooks.mjs", import.meta.url));
const { areaNeighbours, areaRoute, areaTerms, studyTerms } = await import("../lib/learner-stats.ts");

const seed = JSON.parse(readFileSync(new URL("../data/mcd-seed.json", import.meta.url), "utf8"));
// Learners only see Published Terms; publish the whole seed for the test.
const terms = seed.terms.map((term) => ({ ...term, published: true }));
const visible = studyTerms(terms, { user: { role: "learner" } });
const row = (termId, state, attempts = 0) => ({ termId, state, attempts, favourite: false, updatedAt: "2026-09-09T10:00:00Z" });

test("each area lists exactly its Published Terms in approved DisplayOrder", () => {
  for (const category of ["Contracts", "Corporate Law", "Employment Law"]) {
    const rows = areaTerms(visible, category);
    assert.equal(rows.length, 10);
    assert.ok(rows.every((term) => term.category === category));
    const orders = rows.map((term) => term.displayOrder);
    assert.deepEqual(orders, [...orders].sort((a, b) => a - b));
  }
});

test("a new learner starts at the first Term of the area", () => {
  const route = areaRoute(visible, {}, "Contracts");
  assert.equal(route.status, "start");
  assert.equal(route.term.id, areaTerms(visible, "Contracts")[0].id);
  assert.equal(route.position, 1);
  assert.equal(route.total, 10);
});

test("Continue Learning resumes at the first non-Mastered Term; a Term opened via Search does not skip earlier ones", () => {
  const [t1, t2, t3, , , t6] = areaTerms(visible, "Contracts");
  const progress = {
    [t1.id]: row(t1.id, "mastered", 1),
    [t2.id]: row(t2.id, "mastered", 1),
    // t3 never opened; t6 opened from Search and even mastered.
    [t6.id]: row(t6.id, "mastered", 1),
  };
  const route = areaRoute(visible, progress, "Contracts");
  assert.equal(route.status, "continue");
  assert.equal(route.term.id, t3.id, "route resumes at the first gap, not after the searched Term");
  assert.equal(route.position, 3);
  assert.equal(route.mastered, 3);
});

test("opening a Term (Learning) is enough to switch Start → Continue; all Mastered → complete", () => {
  const rows = areaTerms(visible, "Employment Law");
  const learning = { [rows[0].id]: row(rows[0].id, "learning") };
  assert.equal(areaRoute(visible, learning, "Employment Law").status, "continue");
  assert.equal(areaRoute(visible, learning, "Employment Law").term.id, rows[0].id);
  const done = Object.fromEntries(rows.map((term) => [term.id, row(term.id, "mastered", 1)]));
  const route = areaRoute(visible, done, "Employment Law");
  assert.equal(route.status, "complete");
  assert.equal(route.term, null);
});

test("Next / Previous Term stay inside the area and the last Term has no Next", () => {
  const corporate = areaTerms(visible, "Corporate Law");
  const first = areaNeighbours(visible, corporate[0].id);
  assert.equal(first.previous, null);
  assert.equal(first.next.id, corporate[1].id);
  assert.equal(first.position, 1);
  const last = areaNeighbours(visible, corporate[9].id);
  assert.equal(last.next, null, "no Next Term link past the end of the area");
  assert.equal(last.last, true);
  assert.equal(last.previous.id, corporate[8].id);
  // Corporate Law (DisplayOrder 1–10) is followed by Contracts (11–20) in the
  // global list; the area boundary must not leak across categories.
  assert.notEqual(last.next?.category, "Contracts");
});

test("progress in one area never affects another area's route", () => {
  const contracts = areaTerms(visible, "Contracts");
  const progress = Object.fromEntries(contracts.map((term) => [term.id, row(term.id, "mastered", 1)]));
  assert.equal(areaRoute(visible, progress, "Contracts").status, "complete");
  assert.equal(areaRoute(visible, progress, "Corporate Law").status, "start");
});
