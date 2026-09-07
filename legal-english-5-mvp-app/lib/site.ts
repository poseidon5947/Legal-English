/** Canonical public origin. Set NEXT_PUBLIC_SITE_URL on the VPS (e.g. https://legalenglish5.com). */
export const SITE_NAME = "Legal English 5";

/** Brand relationship shown market-wide (Landing Page Brief v1.0 §1). */
export const BRAND_OWNER = "MPC LAW STUDIO";
export const BRAND_LINE = `${SITE_NAME} by ${BRAND_OWNER}`;

/** Browser/SEO copy from the Landing Page Brief v1.0 §7 (Marketing copy; no unverified product claims). */
export const HOME_TITLE = "Legal English 5 | Practical Legal English for Spanish-Speaking Legal Professionals";
export const SITE_DESCRIPTION =
  "Build practical Legal English vocabulary in context with pronunciation, authentic legal collocations, legal usage and guidance designed for Spanish-speaking legal professionals.";

export function siteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      /* fall through to the local default */
    }
  }
  // Vercel previews/production without NEXT_PUBLIC_SITE_URL: use the deployment host.
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelHost) return new URL(`https://${vercelHost}`);
  return new URL(`http://localhost:${process.env.PORT || 3000}`);
}

/* ---- Structured data (schema.org) --------------------------------------- */

const ORGANIZATION_ID = "#organization";

/** Site-wide graph: who publishes the site and what the site is. Rendered once in the root layout. */
export function siteJsonLd() {
  const base = siteUrl().origin;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/${ORGANIZATION_ID}`,
        name: BRAND_OWNER,
        alternateName: "MPC Law Studio",
        url: base,
        logo: `${base}/home-assets/icons/le5-shield.png`,
        brand: { "@type": "Brand", name: SITE_NAME },
        areaServed: "CO",
        knowsLanguage: ["en", "es"],
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: ["en", "es"],
        publisher: { "@id": `${base}/${ORGANIZATION_ID}` },
      },
    ],
  };
}

/** The product as a Course (home page). Prices are the approved launch prices in COP (brief §3.8). */
export function courseJsonLd(options: { monthly: number; annual: number; currency: string; termCount: number; trialDays: number }) {
  const base = siteUrl().origin;
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${base}/#course`,
    name: `${BRAND_LINE} — Legal English for Spanish-speaking legal professionals`,
    description: SITE_DESCRIPTION,
    url: base,
    inLanguage: "en",
    provider: { "@id": `${base}/${ORGANIZATION_ID}` },
    educationalLevel: "Professional",
    audience: { "@type": "EducationalAudience", educationalRole: "professional", audienceType: "Spanish-speaking lawyers and legal professionals" },
    teaches: ["Legal English vocabulary", "Contracts", "Corporate Law", "Employment Law"],
    numberOfCredits: options.termCount,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT5M",
      courseSchedule: { "@type": "Schedule", repeatFrequency: "Daily", duration: "PT5M" },
    },
    offers: [
      {
        "@type": "Offer",
        name: "Monthly",
        price: String(options.monthly),
        priceCurrency: options.currency,
        url: `${base}/pricing`,
        description: `${options.trialDays}-day free trial; credit card required. Continues at ${options.currency} ${options.monthly.toLocaleString("en-US")}/month unless canceled before the trial ends.`,
      },
      { "@type": "Offer", name: "Annual", price: String(options.annual), priceCurrency: options.currency, url: `${base}/pricing` },
    ],
  };
}

/** FAQ rich results (home and pricing pages). */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** Public routes worth indexing. Learner/owner pages are behind sign-in and stay out. */
export const PUBLIC_ROUTES = ["/", "/pricing", "/about", "/help", "/login", "/signup", "/privacy", "/terms-of-service", "/status"] as const;

/**
 * Per-route metadata: own canonical URL (instead of inheriting the root "/")
 * and, for pages behind sign-in, an explicit noindex so crawlers that reach a
 * deep link do not index the redirect shell. Open Graph/Twitter titles follow
 * the page title so shared links do not all read like the home page.
 */
export const OG_IMAGE = { url: "/home-assets/og/og-default.jpg", width: 1200, height: 630, alt: "Legal English 5 by MPC LAW STUDIO — Legal English for real legal work" };

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
