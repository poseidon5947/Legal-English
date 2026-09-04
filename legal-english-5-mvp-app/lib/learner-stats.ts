import { CATEGORIES } from "@/lib/types";
import type { Progress, ProgressState, SessionPayload, Term } from "@/lib/types";

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

export function countsFor(terms: Term[], progress: Record<string, Progress>): Counts {
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
    accuracyPct: quizzed ? Math.round((mastered / quizzed) * 100) : 0,
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

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function shiftDay(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export type Streak = { current: number; longest: number; activeDays: Set<string>; week: { label: string; done: boolean; today: boolean }[] };

/**
 * Day streak from the progress timestamps. A row only stores its latest
 * update, so this counts days with at least one recorded change; it can only
 * undercount, never invent activity.
 */
export function streakFor(rows: Progress[], now = new Date()): Streak {
  const activeDays = new Set(rows.filter((row) => row.state !== "new" || row.favourite).map((row) => dayKey(new Date(row.updatedAt))));
  let current = 0;
  let cursor = activeDays.has(dayKey(now)) ? now : shiftDay(now, -1);
  while (activeDays.has(dayKey(cursor))) {
    current += 1;
    cursor = shiftDay(cursor, -1);
  }
  const sorted = [...activeDays]
    .map((key) => {
      const [y, m, d] = key.split("-").map(Number);
      return new Date(y, m, d).getTime();
    })
    .sort((a, b) => a - b);
  let longest = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i += 1) {
    run = i > 0 && sorted[i] - sorted[i - 1] === 86_400_000 ? run + 1 : 1;
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

/** Six weekly buckets ending this week, from row timestamps. */
export function weeklyActivity(rows: Progress[], now = new Date(), weeks = 6): WeekBucket[] {
  const weekday = (now.getDay() + 6) % 7;
  const thisMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - weekday);
  const buckets: WeekBucket[] = Array.from({ length: weeks }, (_, i) => ({ start: shiftDay(thisMonday, -7 * (weeks - 1 - i)), studied: 0, attempts: 0 }));
  for (const row of rows) {
    const at = new Date(row.updatedAt).getTime();
    const index = buckets.findIndex((bucket, i) => at >= bucket.start.getTime() && (i === buckets.length - 1 || at < buckets[i + 1].start.getTime()));
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

export function formatDate(iso: string | null | undefined, locale: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}
