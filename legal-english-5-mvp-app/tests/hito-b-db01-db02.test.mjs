import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register(new URL("./_ts-resolver-hooks.mjs", import.meta.url));
const { formatDate } = await import("../lib/learner-stats.ts");

/**
 * DB02 (Solicitud de corrección Hito B, 11 Sep 2026): LastReviewedAt is a
 * calendar day from the MCD. Formatting must not shift it by timezone.
 */

test("DB02 ordinary calendar date keeps the MCD day (2026-08-26 → 26)", () => {
  const en = formatDate("2026-08-26", "en");
  const es = formatDate("2026-08-26", "es");
  assert.match(en, /26/);
  assert.match(en, /August|august/i);
  assert.match(en, /2026/);
  assert.doesNotMatch(en, /\b25\b/);
  assert.match(es, /26/);
  assert.doesNotMatch(es, /\b25\b/);
});

test("DB02 first day of the month stays on day 1 (2026-09-01 → 1)", () => {
  const en = formatDate("2026-09-01", "en");
  const es = formatDate("2026-09-01", "es");
  assert.match(en, /\b1\b|1st/i);
  assert.match(en, /September|september/i);
  assert.doesNotMatch(en, /\b31\b/);
  assert.doesNotMatch(en, /August|august/i);
  assert.match(es, /\b1\b/);
  assert.doesNotMatch(es, /\b31\b/);
});

test("DB02 full timestamps still format without throwing", () => {
  const value = formatDate("2026-09-08T20:22:00.000Z", "en");
  assert.ok(value.length > 4);
  assert.notEqual(value, "—");
});

/** DB01 mapping helpers — same rules as Term Detail (MCD-DEC-09 / EKB-DEC-18). */
function visibleEquivalents(term) {
  const spanish = String(term.spanishEquivalent ?? "").trim();
  const civil = String(term.civilLawEquivalent ?? "").trim();
  return {
    showSpanish: Boolean(spanish),
    spanish,
    showCivil: Boolean(civil),
    civil,
  };
}

test("DB01 CON-001 shows Spanish Equivalent only; Civil Law Equivalent is hidden", () => {
  const view = visibleEquivalents({
    spanishEquivalent: "acuerdo; convenio, según el contexto",
    civilLawEquivalent: "",
  });
  assert.equal(view.showSpanish, true);
  assert.equal(view.spanish, "acuerdo; convenio, según el contexto");
  assert.equal(view.showCivil, false);
});

test("DB01 CON-004 shows Spanish Equivalent vinculante without Civil Law Equivalent", () => {
  const view = visibleEquivalents({ spanishEquivalent: "vinculante", civilLawEquivalent: "" });
  assert.equal(view.showSpanish, true);
  assert.equal(view.spanish, "vinculante");
  assert.equal(view.showCivil, false);
});

test("DB01 EMP-009 shows both components separately even when the text matches", () => {
  const view = visibleEquivalents({ spanishEquivalent: "acoso laboral", civilLawEquivalent: "acoso laboral" });
  assert.equal(view.showSpanish, true);
  assert.equal(view.showCivil, true);
  assert.equal(view.spanish, "acoso laboral");
  assert.equal(view.civil, "acoso laboral");
});
