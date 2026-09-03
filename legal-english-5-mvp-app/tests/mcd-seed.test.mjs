import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const seed = JSON.parse(readFileSync(new URL("../data/mcd-seed.json", import.meta.url), "utf8"));

test("LC-001 seed matches the v1.3.81 delivery baseline", () => {
  assert.equal(seed.source.version, "v1.3.81");
  assert.equal(seed.source.collection, "LC-001");
  assert.equal(seed.terms.length, 30);
  assert.equal(seed.counts.corporateLaw, 10);
  assert.equal(seed.counts.contracts, 10);
  assert.equal(seed.counts.employmentLaw, 10);
  assert.equal(seed.counts.useItWith, 117);
  assert.equal(seed.counts.inContext, 30);
  assert.equal(seed.counts.quizzes, 30);
  assert.equal(seed.counts.quizzesThreeOptions, 12);
  assert.equal(seed.counts.quizzesFourOptions, 18);
  assert.equal(seed.counts.variants, 8);
  assert.equal(seed.counts.published, 0);
  assert.equal(seed.counts.audioUs, 0);
  assert.ok(seed.terms.every((term) => ["Corporate Law", "Contracts", "Employment Law"].includes(term.category)));
  assert.ok(seed.terms.every((term) => term.published === false));
  assert.ok(seed.terms.every((term) => term.quiz && term.quiz.options.length >= 3));
  assert.ok(seed.terms.some((term) => term.id === "EMP-009"));
});
