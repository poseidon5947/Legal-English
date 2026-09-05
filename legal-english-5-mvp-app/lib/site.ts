/** Canonical public origin. Set NEXT_PUBLIC_SITE_URL on the VPS (e.g. https://legalenglish5.com). */
export const SITE_NAME = "Legal English 5";

export const SITE_DESCRIPTION =
  "Legal English for Spanish-speaking lawyers and law students. Five-minute lessons on Contracts, Corporate Law and Employment Law, each term reviewed by a practising lawyer.";

export function siteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      /* fall through to the local default */
    }
  }
  return new URL(`http://localhost:${process.env.PORT || 3000}`);
}

/** Public routes worth indexing. Learner/owner pages are behind sign-in and stay out. */
export const PUBLIC_ROUTES = ["/", "/pricing", "/about", "/login", "/signup", "/privacy", "/terms-of-service", "/status"] as const;
