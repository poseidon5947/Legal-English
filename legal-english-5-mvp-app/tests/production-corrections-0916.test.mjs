import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { register } from "node:module";

// Informe de correcciones de producción (16 Sep 2026): the parts of the 23
// defects that can be asserted without a browser — pending-error recommendations
// (D06 / D08), approved texts (D04, D09, D10, D16, D22, D23), the removed Home
// session module (D02), pluralisation (D11), the removed quiz legend (D21) and
// the Home iconography (D20).
register(new URL("./_ts-resolver-hooks.mjs", import.meta.url));
const { failedTerms, hasPendingError, studyTerms } = await import("../lib/learner-stats.ts");
const { learnerCopy, learnerText } = await import("../lib/learner-copy.ts");
const { landingCopy } = await import("../lib/landing-copy.ts");
const { messages: dictionary } = await import("../lib/i18n.ts");

const seed = JSON.parse(readFileSync(new URL("../data/mcd-seed.json", import.meta.url), "utf8"));
const visible = studyTerms(seed.terms.map((term) => ({ ...term, published: true })), { user: { role: "learner" } });
const byArea = (category) => visible.filter((term) => term.category === category);
const row = (termId, state, extra = {}) => ({ termId, state, attempts: 1, favourite: false, updatedAt: "2026-09-16T10:00:00Z", ...extra });

test("D06: Recommended for you = Terms whose last recorded answer was wrong, nothing else", () => {
  const [c1, c2, c3] = byArea("Contracts");
  const [k1] = byArea("Corporate Law");
  const progress = {
    [c1.id]: row(c1.id, "learning", { quizCompleted: true, quizCorrect: false, lastActivityAt: "2026-09-16T10:05:00Z" }), // failed
    [c2.id]: row(c2.id, "mastered", { quizCompleted: true, quizCorrect: true }), // answered right
    [c3.id]: row(c3.id, "learning", { attempts: 0 }), // only opened, never quizzed
    [k1.id]: row(k1.id, "learning", { quizCompleted: true, quizCorrect: false, lastActivityAt: "2026-09-16T10:01:00Z" }), // failed
  };
  const failed = failedTerms(visible, progress);
  assert.deepEqual(failed.map((term) => term.id), [c1.id, k1.id], "exactly the wrong answers, most recent first");
  assert.equal(hasPendingError(progress, c2.id), false);
  assert.equal(hasPendingError(progress, c3.id), false);
  assert.equal(hasPendingError(progress, byArea("Employment Law")[0].id), false, "New Terms are never recommended");
});

test("D06: a later correct answer removes the Term from the recommendations", () => {
  const [c1] = byArea("Contracts");
  const before = { [c1.id]: row(c1.id, "learning", { quizCompleted: true, quizCorrect: false }) };
  const after = { [c1.id]: row(c1.id, "mastered", { attempts: 2, quizCompleted: true, quizCorrect: true }) };
  assert.equal(failedTerms(visible, before).length, 1);
  assert.equal(failedTerms(visible, after).length, 0);
});

test("D08: Practice Now scope is one Area's pending errors only; Areas without errors have none", () => {
  const [c1] = byArea("Contracts");
  const [k1, k2] = byArea("Corporate Law");
  const progress = {
    [c1.id]: row(c1.id, "learning", { quizCompleted: true, quizCorrect: false }),
    [k1.id]: row(k1.id, "learning", { quizCompleted: true, quizCorrect: false }),
    [k2.id]: row(k2.id, "mastered", { quizCompleted: true, quizCorrect: true }),
  };
  assert.deepEqual(failedTerms(visible, progress, "Corporate Law").map((t) => t.id), [k1.id]);
  assert.deepEqual(failedTerms(visible, progress, "Contracts").map((t) => t.id), [c1.id]);
  assert.deepEqual(failedTerms(visible, progress, "Employment Law"), []);
});

test("D02: the Home no longer carries the automatic five-term session module", () => {
  for (const key of ["dashSessionTag", "dashSessionTitle", "dashSessionBody", "dashStartSession"]) {
    assert.equal(key in learnerCopy.en, false, `${key} removed`);
    assert.equal(key in learnerCopy.es, false, `${key} removed (es)`);
  }
  assert.equal(learnerCopy.en.dashContinue, "Continue where you left off");
  assert.equal(learnerCopy.en.dashStartTitle, "Choose an Area to begin");
  assert.equal(learnerCopy.es.dashStartTitle, "Elige un Área para empezar");
});

test("D04: Help & Support is learner-facing — no Owner / Admin → Support in the learner UI", () => {
  const en = Object.entries(dictionary.en).filter(([key]) => key.startsWith("help") && !key.startsWith("helpOwner"));
  const es = Object.entries(dictionary.es).filter(([key]) => key.startsWith("help") && !key.startsWith("helpOwner"));
  for (const [key, value] of [...en, ...es]) {
    assert.doesNotMatch(value, /Admin\s*→|\bOwner\b|\btitular\b/i, `${key} exposes internal roles`);
  }
  assert.equal(dictionary.en.helpLead, "Need help? Use the form below to report a technical issue or request assistance.");
  assert.equal(dictionary.en.helpReportSend, "Send");
});

test("D09: keyboard instruction is natural English / Spanish", () => {
  assert.equal(learnerText("en", "kbdPick", { keys: "1–3" }), "Press 1–3 to select an answer");
  assert.equal(learnerText("en", "kbdCheck"), "Press Enter to check");
  assert.equal(learnerText("es", "kbdPick", { keys: "1–3" }), "Pulsa 1–3 para elegir una respuesta");
  assert.equal(learnerText("es", "kbdCheck"), "Pulsa Enter para comprobar");
});

test("D10: STUDY ANYWHERE card says 'Five minutes a day' / 'Cinco minutos al día'", () => {
  assert.equal(learnerCopy.en.photoCardTag, "Study anywhere");
  assert.equal(learnerCopy.en.photoCardTitle, "Five minutes a day");
  assert.equal(learnerCopy.es.photoCardTitle, "Cinco minutos al día");
});

test("D11: day / days pluralise from the count (0, 1, 2) in both languages", () => {
  const unit = (locale, n) => (n === 1 ? learnerText(locale, "day") : learnerText(locale, "days")).toLowerCase();
  assert.equal(learnerText("en", "longest", { n: 1, unit: unit("en", 1) }), "Longest streak: 1 day");
  assert.equal(learnerText("en", "longest", { n: 0, unit: unit("en", 0) }), "Longest streak: 0 days");
  assert.equal(learnerText("en", "longest", { n: 2, unit: unit("en", 2) }), "Longest streak: 2 days");
  assert.equal(learnerText("es", "longest", { n: 1, unit: unit("es", 1) }), "Racha más larga: 1 día");
  assert.equal(learnerText("es", "longest", { n: 2, unit: unit("es", 2) }), "Racha más larga: 2 días");
  assert.equal(learnerText("en", "best", { n: 1, unit: unit("en", 1) }), "Best: 1 day");
  assert.equal(learnerCopy.en.dashSavedBodyOne, "1 saved term");
  assert.equal(learnerCopy.en.filteredCountOne, "1 matching term");
});

test("D21 / D22 / D23: approved public texts", () => {
  assert.equal("source" in landingCopy.en.example, false, "no editorial legend under Check answer");
  assert.equal("terms" in landingCopy.en.pricing.annual, false, "Annual card states the 50% once");
  assert.equal(landingCopy.en.pricing.annual.discount, "50% discount compared with twelve monthly payments");
  assert.equal(dictionary.en.step2Body, "Start with Contracts, Corporate Law or Employment Law.");
  assert.equal(dictionary.es.step2Body, "Empieza con Contracts, Corporate Law o Employment Law.");
});

test("D20: the Home page renders no raster icons (approved SVG I01–I04 only)", () => {
  const home = readFileSync(new URL("../app/(home)/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(home, /\.png/, "no PNG icon references left on the Home");
  assert.doesNotMatch(home, /home-assets\/icons/, "legacy PNG icon folder no longer referenced");
  const footer = readFileSync(new URL("../components/landing-footer.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(footer, /\.png/);
  assert.match(footer, /href="\/help#contact"/, "D17: Contact Us → public /help#contact");
  assert.match(footer, /href="\/help#billing"/, "D18: public Billing → /help#billing");
});
