import { entitlementFor } from "./entitlement";
import type { PublicUser, Subscription, Term, User } from "./types";

/**
 * Server-side access rules shared by both stores (alpha JSON and Supabase).
 *
 * Hiding a page in the browser protects nothing: the bootstrap payload and
 * every learning mutation must apply the same checks. Two questions:
 *  - may this account learn right now? (signed in, not deactivated, entitled)
 *  - may this account touch this term? (exists, published, not archived —
 *    the Owner sees everything)
 */

type Actor = Pick<User | PublicUser, "role" | "disabledAt" | "subscription">;

export type AccessDenied = { ok: false; message: string; reason: "signed-out" | "deactivated" | "expired" | "missing" | "unavailable" };

export function canLearn(user: Actor | null | undefined): AccessDenied | { ok: true } {
  if (!user) return { ok: false, message: "Sign in required.", reason: "signed-out" };
  if (user.disabledAt) return { ok: false, message: "This account is deactivated.", reason: "deactivated" };
  if (user.role !== "admin" && !entitlementFor(user.subscription as Subscription).allowed) {
    return { ok: false, message: "Access is not active.", reason: "expired" };
  }
  return { ok: true };
}

export function canUseTerm(user: Actor, term: Pick<Term, "published" | "archived"> | null | undefined): AccessDenied | { ok: true } {
  if (!term) return { ok: false, message: "This term does not exist.", reason: "missing" };
  if (user.role !== "admin" && (!term.published || term.archived)) {
    return { ok: false, message: "This term is not available.", reason: "unavailable" };
  }
  return { ok: true };
}

/** Both checks in one call, in the order a route needs them. */
export function canStudyTerm(user: Actor | null | undefined, term: Pick<Term, "published" | "archived"> | null | undefined): AccessDenied | { ok: true } {
  const learner = canLearn(user);
  if (!learner.ok) return learner;
  return canUseTerm(user as Actor, term);
}

/**
 * What a signed-in account without active access may see of the library:
 * enough to browse titles and decide to subscribe (term, category, topic,
 * order), none of the taught content (definition, equivalents, examples,
 * quiz, audio). `locked: true` lets the UI show the paywall state.
 */
export function lockTerm(term: Term): Term & { locked: true } {
  return {
    ...term,
    locked: true,
    definition: "",
    spanishEquivalent: "",
    civilLawEquivalent: "",
    spanishSpeakerAlert: "",
    audioUsPath: "",
    audioUkPath: "",
    usVariant: null,
    ukVariant: null,
    useItWith: [],
    inContext: null,
    quiz: null,
    comparativeLawNote: "",
    pronunciation: "",
  };
}

/** Apply lockTerm to every term unless the account may learn right now. */
export function termsForAccount(user: Actor, terms: Term[]): Term[] {
  return canLearn(user).ok ? terms : terms.map(lockTerm);
}
