import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { register } from "node:module";

// Landing-page brief §3.5: the product example must be copied from the approved
// MCD, never written by hand. This pins lib/landing-example.ts to the seed.
register(new URL("./_ts-resolver-hooks.mjs", import.meta.url));
const { LANDING_EXAMPLE } = await import("../lib/landing-example.ts");

const seed = JSON.parse(readFileSync(new URL("../data/mcd-seed.json", import.meta.url), "utf8"));
const term = seed.terms.find((item) => item.id === LANDING_EXAMPLE.id);

test("landing example term exists in the MCD seed and is approved", () => {
  assert.ok(term, `${LANDING_EXAMPLE.id} not in data/mcd-seed.json`);
  assert.equal(term.mcdStatus, "Approved");
  assert.equal(term.quiz?.mcdStatus, "Approved");
});

test("landing example text matches the MCD verbatim", () => {
  assert.equal(LANDING_EXAMPLE.term, term.term);
  assert.equal(LANDING_EXAMPLE.partOfSpeech, term.partOfSpeech);
  assert.equal(LANDING_EXAMPLE.category, term.category);
  assert.equal(LANDING_EXAMPLE.topic, term.topic);
  assert.equal(LANDING_EXAMPLE.jurisdiction, term.jurisdiction);
  assert.equal(LANDING_EXAMPLE.definition, term.definition);
  assert.equal(LANDING_EXAMPLE.spanishEquivalent, term.spanishEquivalent);
  assert.equal(LANDING_EXAMPLE.civilLawEquivalent, term.civilLawEquivalent);
  assert.equal(LANDING_EXAMPLE.spanishSpeakerAlert, term.spanishSpeakerAlert);
  assert.deepEqual(
    [...LANDING_EXAMPLE.useItWith],
    [...term.useItWith].sort((a, b) => a.displayOrder - b.displayOrder).map((item) => item.expression)
  );
  assert.equal(LANDING_EXAMPLE.inContext, term.inContext.exampleText);
});

test("landing example quiz matches the MCD quiz", () => {
  assert.equal(LANDING_EXAMPLE.quiz.question, term.quiz.question);
  assert.deepEqual([...LANDING_EXAMPLE.quiz.options], term.quiz.options);
  assert.equal(LANDING_EXAMPLE.quiz.correctIndex, "ABCD".indexOf(term.quiz.correctOption));
  assert.equal(LANDING_EXAMPLE.quiz.explanation, term.quiz.explanation);
  assert.equal(LANDING_EXAMPLE.source.workbook, term.sourceWorkbookVersion);
  assert.equal(LANDING_EXAMPLE.source.editorialVersion, term.sourceEditorialVersion);
  assert.equal(LANDING_EXAMPLE.source.reviewedAt, term.sourceLastReviewedAt);
});
