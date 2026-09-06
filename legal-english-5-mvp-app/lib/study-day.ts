import type { StudyDay } from "./types";

/** Local calendar day as "YYYY-MM-DD" (the learner's clock, not the server's). */
export function localDay(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * The server trusts the client's calendar day only within a window: a value
 * that is malformed or more than 36 h from the server clock falls back to the
 * server's own UTC day, so a learner cannot back-fill a streak.
 */
export function acceptDay(candidate: unknown, now = new Date()) {
  const serverDay = now.toISOString().slice(0, 10);
  if (typeof candidate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return serverDay;
  const millis = Date.parse(`${candidate}T12:00:00Z`);
  if (!Number.isFinite(millis) || Math.abs(millis - now.getTime()) > 36 * 3_600_000) return serverDay;
  return candidate;
}

export type StudyDelta = Partial<Pick<StudyDay, "opened" | "attempts" | "correct" | "saved">>;

/** Pure merge used by both stores: returns the updated list with the day bumped. */
export function bumpStudyDay(rows: StudyDay[], userId: string, day: string, delta: StudyDelta): StudyDay[] {
  const existing = rows.find((row) => row.userId === userId && row.day === day);
  const next: StudyDay = {
    userId,
    day,
    opened: (existing?.opened ?? 0) + (delta.opened ?? 0),
    attempts: (existing?.attempts ?? 0) + (delta.attempts ?? 0),
    correct: (existing?.correct ?? 0) + (delta.correct ?? 0),
    saved: (existing?.saved ?? 0) + (delta.saved ?? 0),
  };
  return [...rows.filter((row) => !(row.userId === userId && row.day === day)), next];
}
