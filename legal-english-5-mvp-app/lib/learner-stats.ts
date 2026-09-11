import { CATEGORIES } from "@/lib/types";
import { localDay } from "@/lib/study-day";
import type { Progress, ProgressState, SessionPayload, StudyDay, Term } from "@/lib/types";

/**
 * Derived learner metrics. Everything here is computed from the server-owned
 * `progress` rows (state, attempts, favourite, updatedAt) so the UI never
 * shows a number that is not backed by stored data.
 */

export function stateOf(progress: Record<string, Progress>, termId: string): ProgressState {
  return progress[termId]?.state || "new";
}

/** Terms a signed-in user can study: learners only see Published; the Owner sees every non-archived MCD term. */
export function studyTerms(terms: Term[], session: SessionPayload | null) {
  const visible = session?.user.role === "admin" ? terms.filter((term) => !term.archived) : terms.filter((term) => term.published && !term.archived);
  return [...visible].sort((a, b) => a.displayOrder - b.displayOrder || a.term.localeCompare(b.term));
}

/* ---- Guided route per area (Hito B clarification, 9 Sep 2026) ------------
 * Each canonical category is a guided route: its Published Terms in the
 * approved pedagogical order (DisplayOrder from the MCD delivery mapping).
 * Next Term stays inside the area; Continue Learning resumes at the first
 * Term of the area that is not yet Mastered, so a Term opened via Search
 * never moves the route forward. Nothing is locked: any Published Term can
 * be opened directly.
 */

/** Published Terms of one area in approved order (`visible` is already sorted by DisplayOrder). */
export function areaTerms(visible: Term[], category: string) {
  return visible.filter((term) => term.category === category);
}

export type AreaRoute = {
  category: string;
  /** "start": nothing studied yet · "continue": resume · "complete": every Term Mastered · "empty": no Published Terms. */
  status: "start" | "continue" | "complete" | "empty";
  /** The Term Start/Continue Learning opens (first non-Mastered by DisplayOrder). */
  term: Term | null;
  /** 1-based position of `term` inside the area. */
  position: number;
  total: number;
  mastered: number;
};

export function areaRoute(visible: Term[], progress: Record<string, Progress>, category: string): AreaRoute {
  const rows = areaTerms(visible, category);
  const mastered = rows.filter((term) => stateOf(progress, term.id) === "mastered").length;
  if (rows.length === 0) return { category, status: "empty", term: null, position: 0, total: 0, mastered: 0 };
  const index = rows.findIndex((term) => stateOf(progress, term.id) !== "mastered");
  if (index < 0) return { category, status: "complete", term: null, position: rows.length, total: rows.length, mastered };
  const touched = rows.some((term) => progress[term.id] && (progress[term.id].state !== "new" || progress[term.id].attempts > 0));
  return { category, status: touched ? "continue" : "start", term: rows[index], position: index + 1, total: rows.length, mastered };
}

export type AreaNeighbours = { previous: Term | null; next: Term | null; position: number; total: number; last: boolean };

/** Previous / Next Term inside the same area by DisplayOrder (`next` is null on the area's last Term). */
export function areaNeighbours(visible: Term[], termId: string): AreaNeighbours {
  const current = visible.find((term) => term.id === termId);
  if (!current) return { previous: null, next: null, position: 0, total: 0, last: false };
  const rows = areaTerms(visible, current.category);
  const index = rows.findIndex((term) => term.id === termId);
  return {
    previous: index > 0 ? rows[index - 1] : null,
    next: index < rows.length - 1 ? rows[index + 1] : null,
    position: index + 1,
    total: rows.length,
    last: index === rows.length - 1,
  };
}

export type Counts = {
  total: number;
  newCount: number;
  learning: number;
  mastered: number;
  studied: number;
  attempts: number;
  quizzed: number;
  favourites: number;
  masteryPct: number;
  accuracyPct: number;
};

/**
 * @param studyDays dated aggregates: when present, `accuracyPct` is real answer
 * accuracy (correct ÷ attempts over every day). Without them it falls back to
 * mastered ÷ quizzed, which is a mastery rate rather than accuracy.
 */
export function countsFor(terms: Term[], progress: Record<string, Progress>, studyDays: StudyDay[] = []): Counts {
  let newCount = 0;
  let learning = 0;
  let mastered = 0;
  let attempts = 0;
  let quizzed = 0;
  let favourites = 0;
  for (const term of terms) {
    const row = progress[term.id];
    const state = row?.state || "new";
    if (state === "new") newCount += 1;
    else if (state === "learning") learning += 1;
    else mastered += 1;
    attempts += row?.attempts || 0;
    if ((row?.attempts || 0) > 0) quizzed += 1;
    if (row?.favourite) favourites += 1;
  }
  const total = terms.length;
  const answered = studyDays.reduce((sum, day) => sum + day.attempts, 0);
  const correct = studyDays.reduce((sum, day) => sum + day.correct, 0);
  const accuracyPct = answered ? Math.round((correct / answered) * 100) : quizzed ? Math.round((mastered / quizzed) * 100) : 0;
  return {
    total,
    newCount,
    learning,
    mastered,
    studied: learning + mastered,
    attempts,
    quizzed,
    favourites,
    masteryPct: total ? Math.round((mastered / total) * 100) : 0,
    accuracyPct,
  };
}

export type CategoryStat = { category: string; total: number; mastered: number; learning: number; pct: number };

export function categoryStats(terms: Term[], progress: Record<string, Progress>): CategoryStat[] {
  return CATEGORIES.map((category) => {
    const rows = terms.filter((term) => term.category === category);
    const mastered = rows.filter((term) => stateOf(progress, term.id) === "mastered").length;
    const learning = rows.filter((term) => stateOf(progress, term.id) === "learning").length;
    return { category, total: rows.length, mastered, learning, pct: rows.length ? Math.round((mastered / rows.length) * 100) : 0 };
  });
}

/** Local calendar day, "YYYY-MM-DD" — the same key the server stores in StudyDay.day. */
function dayKey(date: Date) {
  return localDay(date);
}

function dayToDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function shiftDay(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export type Streak = { current: number; longest: number; activeDays: Set<string>; week: { label: string; done: boolean; today: boolean }[] };

function hadActivity(day: StudyDay) {
  return day.opened + day.attempts + day.saved > 0;
}

/** Calendar-day difference (DST-safe: compares dates at noon, not raw millis). */
function daysBetween(a: string, b: string) {
  const noon = (key: string) => {
    const date = dayToDate(key);
    date.setHours(12, 0, 0, 0);
    return date.getTime();
  };
  return Math.round((noon(b) - noon(a)) / 86_400_000);
}

/**
 * Day streak from dated study rows (one per local calendar day). Progress
 * timestamps are merged in as a fallback for activity recorded before study
 * days existed; they can only undercount, never invent activity.
 */
export function streakFor(rows: Progress[], now = new Date(), studyDays: StudyDay[] = []): Streak {
  const activeDays = new Set<string>([
    ...studyDays.filter(hadActivity).map((day) => day.day),
    ...rows.filter((row) => row.state !== "new" || row.favourite).map((row) => dayKey(new Date(row.updatedAt))),
  ]);
  let current = 0;
  let cursor = activeDays.has(dayKey(now)) ? now : shiftDay(now, -1);
  while (activeDays.has(dayKey(cursor))) {
    current += 1;
    cursor = shiftDay(cursor, -1);
  }
  const sorted = [...activeDays].sort();
  let longest = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i += 1) {
    run = i > 0 && daysBetween(sorted[i - 1], sorted[i]) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  // Monday-first week containing today.
  const weekday = (now.getDay() + 6) % 7;
  const monday = shiftDay(now, -weekday);
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const week = labels.map((label, index) => {
    const day = shiftDay(monday, index);
    return { label, done: activeDays.has(dayKey(day)), today: dayKey(day) === dayKey(now) };
  });
  return { current, longest, activeDays, week };
}

export type ActivityKind = "mastered" | "attempted" | "studied" | "saved";
export type Activity = { kind: ActivityKind; term: Term; at: string; attempts: number };

export function recentActivity(terms: Term[], rows: Progress[], limit = 6): Activity[] {
  const byId = new Map(terms.map((term) => [term.id, term]));
  return rows
    .filter((row) => byId.has(row.termId))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit)
    .map((row) => {
      const term = byId.get(row.termId)!;
      const kind: ActivityKind =
        row.state === "mastered" ? "mastered" : row.attempts > 0 ? "attempted" : row.state === "learning" ? "studied" : "saved";
      return { kind, term, at: row.updatedAt, attempts: row.attempts };
    });
}

export type WeekBucket = { start: Date; studied: number; attempts: number };

/**
 * Six weekly buckets ending this week. With study days each week shows the
 * terms opened and answers given *in that week*; without them (legacy data)
 * the row timestamps are used, which attribute a term to its latest update.
 */
export function weeklyActivity(rows: Progress[], now = new Date(), weeks = 6, studyDays: StudyDay[] = []): WeekBucket[] {
  const weekday = (now.getDay() + 6) % 7;
  const thisMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - weekday);
  const buckets: WeekBucket[] = Array.from({ length: weeks }, (_, i) => ({ start: shiftDay(thisMonday, -7 * (weeks - 1 - i)), studied: 0, attempts: 0 }));
  const bucketFor = (at: number) => buckets.findIndex((bucket, i) => at >= bucket.start.getTime() && (i === buckets.length - 1 || at < buckets[i + 1].start.getTime()));
  if (studyDays.length) {
    for (const day of studyDays) {
      const index = bucketFor(dayToDate(day.day).getTime());
      if (index < 0) continue;
      buckets[index].studied += day.opened;
      buckets[index].attempts += day.attempts;
    }
    return buckets;
  }
  for (const row of rows) {
    const index = bucketFor(new Date(row.updatedAt).getTime());
    if (index < 0) continue;
    if (row.state !== "new") buckets[index].studied += 1;
    if (row.attempts > 0) buckets[index].attempts += row.attempts;
  }
  return buckets;
}

export type AchievementId = "firstSteps" | "firstMastery" | "quizMaster" | "consistent" | "champion";
export type Achievement = { id: AchievementId; done: boolean; value: number; target: number };

export function achievementsFor(counts: Counts, streak: Streak, categories: CategoryStat[]): Achievement[] {
  const champion = categories.filter((item) => item.total > 0 && item.mastered === item.total).length;
  const list: Achievement[] = [
    { id: "firstMastery", done: counts.mastered >= 1, value: Math.min(counts.mastered, 1), target: 1 },
    { id: "firstSteps", done: counts.studied >= 10, value: Math.min(counts.studied, 10), target: 10 },
    { id: "quizMaster", done: counts.attempts >= 10, value: Math.min(counts.attempts, 10), target: 10 },
    { id: "consistent", done: streak.current >= 7, value: Math.min(streak.current, 7), target: 7 },
    { id: "champion", done: champion >= 1, value: Math.min(champion, 1), target: 1 },
  ];
  return list;
}

export function formatWhen(iso: string, locale: string, labels: { today: string; yesterday: string }, now = new Date()) {
  const date = new Date(iso);
  const time = date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
  if (dayKey(date) === dayKey(now)) return `${labels.today}, ${time}`;
  if (dayKey(date) === dayKey(shiftDay(now, -1))) return `${labels.yesterday}, ${time}`;
  return date.toLocaleDateString(locale, { month: "short", day: "numeric", year: date.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}

/**
 * Format a date for display. MCD LastReviewedAt values are calendar days
 * (`YYYY-MM-DD`). Parsing those with `new Date("YYYY-MM-DD")` treats them as
 * UTC midnight, so `toLocaleDateString` in America/Bogotá (and similar zones)
 * shows the previous calendar day. Date-only strings are therefore formatted
 * from the stored year/month/day without a timezone shift.
 */
export function formatDate(iso: string | null | undefined, locale: string) {
  if (!iso) return "—";
  const trimmed = iso.trim();
  const calendar = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (calendar) {
    const year = Number(calendar[1]);
    const month = Number(calendar[2]);
    const day = Number(calendar[3]);
    // Noon local avoids DST edge cases when only the calendar day is needed.
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return date.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
  }
  return new Date(trimmed).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}
