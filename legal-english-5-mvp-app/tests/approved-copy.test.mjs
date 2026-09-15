import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register(new URL("./_ts-resolver-hooks.mjs", import.meta.url));
const { landingCopy } = await import("../lib/landing-copy.ts");
const { learnerCopy } = await import("../lib/learner-copy.ts");
const { SEO, HOME_TITLE, SITE_DESCRIPTION } = await import("../lib/site.ts");

/**
 * "Textos Web e Instrucciones de Implementación" (14 Sep 2026), Part IV:
 * words that must never reach a learner-facing screen, and Part III / V
 * anchors that must be present verbatim.
 */
const FORBIDDEN = [
  /\bcategor(y|ies|ía|ías)\b/i,
  /canonical/i,
  /master content database/i,
  /\bMCD\b/,
  /source of truth/i,
  /workbook/i,
  /supabase|resend|vercel|sandbox|simulator/i,
];

function strings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => strings(item, out));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => strings(item, out));
  return out;
}

for (const locale of ["en", "es"]) {
  test(`landing copy (${locale}) carries no internal or prohibited terminology`, () => {
    for (const text of strings(landingCopy[locale])) {
      for (const pattern of FORBIDDEN) assert.doesNotMatch(text, pattern, `"${text}"`);
    }
  });

  test(`learner copy (${locale}) carries no internal or prohibited terminology`, () => {
    const copy = { ...learnerCopy[locale] };
    // Owner-only strings are allowed to name drafts, but still never "Category".
    for (const text of strings(copy)) {
      // {category} is a placeholder name filled with the Area title, never shown as-is.
      const visible = text.replaceAll("{category}", "{area}");
      for (const pattern of FORBIDDEN) assert.doesNotMatch(visible, pattern, `"${text}"`);
    }
  });
}

test("navigation and Areas terminology match Part III / IV", () => {
  assert.equal(landingCopy.en.nav.areas, "Areas");
  assert.equal(landingCopy.es.nav.areas, "Áreas");
  assert.equal(landingCopy.en.nav.library, "Terms Library");
  assert.equal(landingCopy.es.nav.library, "Biblioteca de términos");
  assert.equal(learnerCopy.en.allCategories, "All Areas");
  assert.equal(learnerCopy.es.allCategories, "Todas las Áreas");
  assert.equal(learnerCopy.en.categoriesTitle, "Areas");
  assert.equal(learnerCopy.en.libraryLead, "Browse terms across Contracts, Corporate Law and Employment Law.");
});

test("home hero, example credit and trial CTA are the approved texts (IMP-03 / IMP-04)", () => {
  assert.equal(landingCopy.en.hero.title, "Legal English for real legal work.");
  assert.equal(landingCopy.es.hero.title, "Legal English para el trabajo jurídico real.");
  assert.equal(landingCopy.en.example.source, "Editorially reviewed by MPC LAW STUDIO.");
  assert.equal(landingCopy.es.example.source, "Revisado editorialmente por MPC LAW STUDIO.");
  assert.equal(landingCopy.en.hero.cta, "Start your 7-day free trial");
  assert.equal(landingCopy.es.hero.cta, "Empieza tu prueba gratis de 7 días");
});

test("pricing keeps the approved amounts and the trial conditions (IMP-05 / IMP-06)", () => {
  const en = strings(landingCopy.en.pricing).join(" ");
  const es = strings(landingCopy.es.pricing).join(" ");
  assert.match(en, /COP \$90,000/);
  assert.match(es, /COP \$90\.000/);
  // The annual amount itself is rendered by PlanCards from PLAN_PRICES (formatCop); the copy names the plan and the 50% saving.
  assert.match(es, /50 ?%/);
  assert.match(landingCopy.en.pricing.monthly.terms, /automatically continue on the COP \$90,000 monthly plan/);
  // The trial disclosure is not repeated in the home CTA block (IMP-05).
  assert.doesNotMatch(landingCopy.en.cta.body + landingCopy.en.hero.lead, /credit card/i);
});

test("the FAQ has exactly the eight canonical questions in both languages (IMP-07)", () => {
  assert.equal(landingCopy.en.faq.items.length, 8);
  assert.equal(landingCopy.es.faq.items.length, 8);
});

test("SEO titles and descriptions follow the approved table (IMP-19)", () => {
  assert.equal(HOME_TITLE, "Legal English 5 | Professional Legal English in Context");
  assert.equal(SITE_DESCRIPTION, "Build accurate, practical Legal English through focused lessons for Spanish-speaking lawyers, law students and legal professionals.");
  assert.equal(SEO["/pricing"].en.title, "Pricing and Free Trial | Legal English 5");
  assert.equal(SEO["/about"].en.title, "About Legal English 5 | MPC LAW STUDIO");
  assert.equal(SEO["/status"].en.description, "Check the current availability of Legal English 5 services.");
  for (const entry of Object.values(SEO)) {
    assert.ok(entry.es.title && entry.es.description, "every page has a Spanish equivalent");
  }
});
