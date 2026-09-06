/**
 * Account-scoped preferences (Account → Preferences / Notifications).
 * Stored on the user record (alpha JSON / users.preferences jsonb) so they
 * follow the learner across browsers and are deleted with the account.
 *
 * Honesty note: `reminders` and `progressSummary` are recorded choices; the
 * email jobs that act on them ship with the launch mailer (Resend). The UI
 * labels them accordingly instead of implying mail is already going out.
 */
export type Preferences = {
  /** Who may see the profile name/photo beyond the learner: support only, or limited to the account. */
  visibility: "limited" | "team";
  /** Allow anonymous usage measurement for this account (Web Vitals/page views are already anonymous). */
  dataUsage: boolean;
  /** Placeholder for partner sharing — the platform never shares data; kept explicit and default off. */
  dataSharing: boolean;
  /** Study-reminder emails. */
  reminders: boolean;
  /** Weekly progress-summary emails. */
  progressSummary: boolean;
  /** Show pending verification codes (Alpha Inbox) on the Help page. */
  inboxNotices: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
  visibility: "limited",
  dataUsage: true,
  dataSharing: false,
  reminders: true,
  progressSummary: true,
  inboxNotices: true,
};

const BOOL_KEYS = ["dataUsage", "dataSharing", "reminders", "progressSummary", "inboxNotices"] as const;

/** Merge an untrusted patch onto a base; unknown keys and wrong types are ignored. */
export function normalizePreferences(base: Partial<Preferences> | null | undefined, patch: unknown = {}): Preferences {
  const next: Preferences = { ...DEFAULT_PREFERENCES, ...(base ?? {}) };
  if (patch && typeof patch === "object") {
    const input = patch as Record<string, unknown>;
    if (input.visibility === "limited" || input.visibility === "team") next.visibility = input.visibility;
    for (const key of BOOL_KEYS) if (typeof input[key] === "boolean") next[key] = input[key] as boolean;
  }
  return next;
}
