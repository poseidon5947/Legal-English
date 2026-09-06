/**
 * First-party visitor insights.
 *
 * The browser sends two kinds of anonymous events to POST /api/insights:
 *  - "view"  — a page was shown (path without query string, locale, device class);
 *  - "vital" — a Core Web Vital measured on that page (LCP, CLS, INP, TTFB).
 *
 * Nothing here identifies a person: no cookie, no IP, no user agent string,
 * no account id. The session id is a random value that lives in
 * sessionStorage for one tab and lets the Owner count "visits" instead of
 * raw page views. Data is kept 90 days and only shown on the Owner console.
 */

export const VITAL_NAMES = ["LCP", "CLS", "INP", "TTFB"] as const;
export type VitalName = (typeof VITAL_NAMES)[number];

export type InsightEvent = {
  kind: "view" | "vital";
  /** Pathname only; dynamic term ids are collapsed to /terms/[id]. */
  path: string;
  locale: "en" | "es";
  device: "mobile" | "desktop";
  /** Per-tab random id (sessionStorage), never a cookie. */
  sid: string;
  /** Vital name + value; absent for views. */
  name?: VitalName;
  value?: number;
  /** ISO timestamp, set by the server. */
  at: string;
};

export const INSIGHTS_RETENTION_DAYS = 90;
export const INSIGHTS_MAX_BATCH = 25;

const PATH_RULES: [RegExp, string][] = [
  [/^\/terms\/[^/]+\/quiz$/, "/terms/[id]/quiz"],
  [/^\/terms\/[^/]+$/, "/terms/[id]"],
  [/^\/quizzes\/[^/]+$/, "/quizzes/[category]"],
];

export function normalizePath(raw: string): string {
  let path = raw.split(/[?#]/)[0] || "/";
  if (path.length > 1) path = path.replace(/\/+$/, "");
  for (const [pattern, replacement] of PATH_RULES) if (pattern.test(path)) return replacement;
  return path.slice(0, 120);
}

/** Validate one browser-supplied event; returns null when it should be dropped. */
export function parseInsightEvent(input: unknown, now = new Date()): InsightEvent | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const kind = raw.kind === "view" || raw.kind === "vital" ? raw.kind : null;
  if (!kind) return null;
  if (typeof raw.path !== "string" || !raw.path.startsWith("/")) return null;
  const locale = raw.locale === "es" ? "es" : "en";
  const device = raw.device === "mobile" ? "mobile" : "desktop";
  const sid = typeof raw.sid === "string" && /^[a-z0-9]{6,32}$/i.test(raw.sid) ? raw.sid : null;
  if (!sid) return null;
  const event: InsightEvent = { kind, path: normalizePath(raw.path), locale, device, sid, at: now.toISOString() };
  if (kind === "vital") {
    const name = VITAL_NAMES.find((candidate) => candidate === raw.name);
    const value = typeof raw.value === "number" && Number.isFinite(raw.value) && raw.value >= 0 ? raw.value : null;
    if (!name || value === null) return null;
    // Anything above these bounds is a measurement glitch, not a user experience.
    if ((name === "CLS" && value > 10) || (name !== "CLS" && value > 120_000)) return null;
    event.name = name;
    event.value = name === "CLS" ? Math.round(value * 1000) / 1000 : Math.round(value);
  }
  return event;
}

/* ---- Owner-facing summary ------------------------------------------------ */

export type VitalSummary = { name: VitalName; p75: number | null; samples: number; rating: "good" | "needs-improvement" | "poor" | null };

export type InsightSummary = {
  days: number;
  views: number;
  visits: number;
  /** One entry per day, oldest first (views and distinct visits). */
  daily: { day: string; views: number; visits: number }[];
  topPages: { path: string; views: number }[];
  devices: { mobile: number; desktop: number };
  locales: { en: number; es: number };
  vitals: VitalSummary[];
};

// Google's Core Web Vitals thresholds ("good" / "poor" boundaries).
const THRESHOLDS: Record<VitalName, [number, number]> = { LCP: [2500, 4000], CLS: [0.1, 0.25], INP: [200, 500], TTFB: [800, 1800] };

export function rateVital(name: VitalName, value: number): VitalSummary["rating"] {
  const [good, poor] = THRESHOLDS[name];
  return value <= good ? "good" : value <= poor ? "needs-improvement" : "poor";
}

function percentile(values: number[], p: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return sorted[index];
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export function summarizeInsights(events: InsightEvent[], days: number, now = new Date()): InsightSummary {
  const since = new Date(now.getTime() - days * 86_400_000);
  const recent = events.filter((event) => new Date(event.at) >= since);
  const views = recent.filter((event) => event.kind === "view");

  const dayMap = new Map<string, { views: number; sids: Set<string> }>();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = dayKey(new Date(now.getTime() - offset * 86_400_000).toISOString());
    dayMap.set(day, { views: 0, sids: new Set() });
  }
  const pages = new Map<string, number>();
  const sids = new Set<string>();
  const devices = { mobile: 0, desktop: 0 };
  const locales = { en: 0, es: 0 };
  for (const view of views) {
    const bucket = dayMap.get(dayKey(view.at));
    if (bucket) {
      bucket.views += 1;
      bucket.sids.add(view.sid);
    }
    pages.set(view.path, (pages.get(view.path) ?? 0) + 1);
    sids.add(view.sid);
    devices[view.device] += 1;
    locales[view.locale] += 1;
  }

  const vitals = VITAL_NAMES.map((name) => {
    const values = recent.filter((event) => event.kind === "vital" && event.name === name).map((event) => event.value as number);
    const p75 = percentile(values, 0.75);
    return { name, p75, samples: values.length, rating: p75 === null ? null : rateVital(name, p75) };
  });

  return {
    days,
    views: views.length,
    visits: sids.size,
    daily: Array.from(dayMap, ([day, bucket]) => ({ day, views: bucket.views, visits: bucket.sids.size })),
    topPages: Array.from(pages, ([path, count]) => ({ path, views: count }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8),
    devices,
    locales,
    vitals,
  };
}
