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
        name: "MPC Law Studio",
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

/** The product as a Course (home page). Prices are the public plan prices. */
export function courseJsonLd(options: { monthly: string; annual: string; termCount: number }) {
  const base = siteUrl().origin;
  const price = (label: string) => label.replace(/[^0-9.]/g, "");
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${base}/#course`,
    name: `${SITE_NAME} — Legal English for Spanish-speaking lawyers`,
    description: SITE_DESCRIPTION,
    url: base,
    inLanguage: "en",
    provider: { "@id": `${base}/${ORGANIZATION_ID}` },
    educationalLevel: "Professional",
    teaches: ["Legal English vocabulary", "Contracts", "Corporate Law", "Employment Law"],
    numberOfCredits: options.termCount,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT5M",
      courseSchedule: { "@type": "Schedule", repeatFrequency: "Daily", duration: "PT5M" },
    },
    offers: [
      { "@type": "Offer", name: "Free trial", price: "0", priceCurrency: "USD", category: "Free", url: `${base}/signup` },
      { "@type": "Offer", name: "Monthly", price: price(options.monthly), priceCurrency: "USD", url: `${base}/pricing` },
      { "@type": "Offer", name: "Annual", price: price(options.annual), priceCurrency: "USD", url: `${base}/pricing` },
    ],
  };
}

/** FAQ rich results for the pricing page. */
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
