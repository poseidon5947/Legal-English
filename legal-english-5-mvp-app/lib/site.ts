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

/**
 * Per-route metadata: own canonical URL (instead of inheriting the root "/")
 * and, for pages behind sign-in, an explicit noindex so crawlers that reach a
 * deep link do not index the redirect shell. Open Graph/Twitter titles follow
 * the page title so shared links do not all read like the home page.
 */
export const OG_IMAGE = { url: "/home-assets/og/og-default.jpg", width: 1200, height: 630, alt: "Legal English 5 — Master Legal English in 5-minute sessions" };

export function pageMetadata(options: { title: string; description: string; path: string; index?: boolean }) {
  const index = options.index ?? false;
  const full = `${options.title} · ${SITE_NAME}`;
  // Nested metadata objects are replaced (not deep-merged) by Next, so the
  // shared Open Graph fields are repeated here.
  return {
    title: options.title,
    description: options.description,
    alternates: { canonical: options.path },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "website" as const,
      siteName: SITE_NAME,
      locale: "en_US",
      alternateLocale: ["es_CO"],
      title: full,
      description: options.description,
      url: options.path,
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image" as const, title: full, description: options.description, images: [OG_IMAGE.url] },
  };
}
