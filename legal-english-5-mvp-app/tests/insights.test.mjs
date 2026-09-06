import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// lib/insights.ts is plain TypeScript with no imports; strip the types so the
// pure functions can run under node:test without a build step.
const source = readFileSync(new URL("../lib/insights.ts", import.meta.url), "utf8");
const { normalizePath, parseInsightEvent, summarizeInsights, rateVital } = await import(
  "data:text/javascript;base64," +
    Buffer.from(
      (await import("node:module")).stripTypeScriptTypes
        ? (await import("node:module")).stripTypeScriptTypes(source)
        : source
    ).toString("base64")
);

const NOW = new Date("2026-09-06T12:00:00Z");
const base = { locale: "es", device: "mobile", sid: "abc123def" };

test("paths lose query strings and dynamic ids collapse", () => {
  assert.equal(normalizePath("/pricing?utm=x#faq"), "/pricing");
  assert.equal(normalizePath("/terms/CON-005"), "/terms/[id]");
  assert.equal(normalizePath("/terms/CON-005/quiz"), "/terms/[id]/quiz");
  assert.equal(normalizePath("/terms/"), "/terms");
});

test("malformed or oversized events are dropped, valid ones are timestamped by the server", () => {
  assert.equal(parseInsightEvent({ kind: "bogus", path: "/", ...base }, NOW), null);
  assert.equal(parseInsightEvent({ kind: "view", path: "http://evil", ...base }, NOW), null);
  assert.equal(parseInsightEvent({ kind: "view", path: "/", ...base, sid: "<script>" }, NOW), null);
  assert.equal(parseInsightEvent({ kind: "vital", name: "LCP", value: -1, path: "/", ...base }, NOW), null);
  assert.equal(parseInsightEvent({ kind: "vital", name: "CLS", value: 99, path: "/", ...base }, NOW), null);
  const view = parseInsightEvent({ kind: "view", path: "/terms/EMP-001?x=1", ...base, at: "1999-01-01" }, NOW);
  assert.deepEqual(view, { kind: "view", path: "/terms/[id]", locale: "es", device: "mobile", sid: "abc123def", at: NOW.toISOString() });
  const vital = parseInsightEvent({ kind: "vital", name: "CLS", value: 0.12345, path: "/", ...base }, NOW);
  assert.equal(vital.value, 0.123);
});

test("summary counts visits by session, views by page and rates p75 vitals", () => {
  const at = (hoursAgo) => new Date(NOW.getTime() - hoursAgo * 3_600_000).toISOString();
  const events = [
    { kind: "view", path: "/", locale: "en", device: "desktop", sid: "a", at: at(1) },
    { kind: "view", path: "/pricing", locale: "es", device: "mobile", sid: "a", at: at(1) },
    { kind: "view", path: "/", locale: "es", device: "mobile", sid: "b", at: at(30) },
    { kind: "view", path: "/", locale: "es", device: "mobile", sid: "old", at: at(24 * 20) }, // outside the window
    { kind: "vital", name: "LCP", value: 1000, path: "/", locale: "en", device: "desktop", sid: "a", at: at(1) },
    { kind: "vital", name: "LCP", value: 3000, path: "/", locale: "en", device: "desktop", sid: "b", at: at(1) },
    { kind: "vital", name: "LCP", value: 5000, path: "/", locale: "en", device: "desktop", sid: "c", at: at(1) },
    { kind: "vital", name: "LCP", value: 2000, path: "/", locale: "en", device: "desktop", sid: "d", at: at(1) },
  ];
  const summary = summarizeInsights(events, 14, NOW);
  assert.equal(summary.views, 3);
  assert.equal(summary.visits, 2);
  assert.equal(summary.daily.length, 14);
  assert.equal(summary.daily.at(-1).views, 2);
  assert.equal(summary.daily.at(-2).views, 1);
  assert.deepEqual(summary.topPages[0], { path: "/", views: 2 });
  assert.deepEqual(summary.devices, { mobile: 2, desktop: 1 });
  const lcp = summary.vitals.find((vital) => vital.name === "LCP");
  assert.equal(lcp.samples, 4);
  assert.equal(lcp.p75, 3000);
  assert.equal(lcp.rating, "needs-improvement");
  assert.equal(summary.vitals.find((vital) => vital.name === "CLS").rating, null);
});

test("ratings follow Google's Core Web Vitals thresholds", () => {
  assert.equal(rateVital("LCP", 2500), "good");
  assert.equal(rateVital("LCP", 4001), "poor");
  assert.equal(rateVital("CLS", 0.2), "needs-improvement");
  assert.equal(rateVital("INP", 150), "good");
  assert.equal(rateVital("TTFB", 900), "needs-improvement");
});

test("insights migration is Owner-read-only and stores no personal data", () => {
  const sql = readFileSync(new URL("../supabase/migrations/006_insights.sql", import.meta.url), "utf8");
  assert.match(sql, /enable row level security/);
  assert.match(sql, /for select to authenticated/);
  assert.doesNotMatch(sql, /for insert/);
  for (const column of ["ip", "user_agent", "user_id", "email"]) assert.doesNotMatch(sql, new RegExp(`\\b${column}\\b`));
});
