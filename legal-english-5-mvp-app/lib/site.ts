/** Canonical public origin. Set NEXT_PUBLIC_SITE_URL on the VPS (e.g. https://legalenglish5.com). */
export const SITE_NAME = "Legal English 5";

/** Brand relationship shown market-wide (Landing Page Brief v1.0 §1). */
export const BRAND_OWNER = "MPC LAW STUDIO";
export const BRAND_LINE = `${SITE_NAME} by ${BRAND_OWNER}`;

/** Browser/SEO copy from the Landing Page Brief v1.0 §7 (Marketing copy; no unverified product claims). */
export const HOME_TITLE = "Legal English 5 | Practical Legal English for Spanish-Speaking Legal Professionals";
export const HOME_TITLE_ES = "Legal English 5 | Inglés jurídico práctico para profesionales del derecho hispanohablantes";
export const SITE_DESCRIPTION =
  "Build practical Legal English vocabulary in context with pronunciation, authentic legal collocations, legal usage and guidance. Designed for Spanish-speaking lawyers, law students, and other legal professionals.";
export const SITE_DESCRIPTION_ES =
  "Construye vocabulario práctico de inglés jurídico en contexto, con pronunciación, colocaciones jurídicas y orientación de uso. Diseñado para abogados, estudiantes de Derecho y otros profesionales jurídicos hispanohablantes.";

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
        logo: `${base}/brand/mpc-icon-512.png`,
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
export function courseJsonLd(options: {
  monthly: number;
  annual: number;
  currency: string;
  trialDays: number;
  locale?: "en" | "es";
}) {
  const base = siteUrl().origin;
  const spanish = options.locale === "es";
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${base}/#course`,
    name: spanish ? `${SITE_NAME} — Inglés jurídico para profesionales del derecho hispanohablantes` : `${BRAND_LINE} — Legal English for Spanish-speaking legal professionals`,
    description: spanish ? SITE_DESCRIPTION_ES : SITE_DESCRIPTION,
    url: base,
    inLanguage: spanish ? "es" : "en",
    provider: { "@id": `${base}/${ORGANIZATION_ID}` },
    educationalLevel: "Professional",
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "professional",
      audienceType: spanish
        ? "Abogados, estudiantes de Derecho y otros profesionales jurídicos hispanohablantes"
        : "Spanish-speaking lawyers, law students, and other legal professionals",
    },
    teaches: ["Legal English vocabulary", "Contracts", "Corporate Law", "Employment Law"],
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT5M",
      courseSchedule: { "@type": "Schedule", repeatFrequency: "Daily", duration: "PT5M" },
    },
    offers: [
      {
        "@type": "Offer",
        name: spanish ? "Mensual" : "Monthly",
        price: String(options.monthly),
        priceCurrency: options.currency,
        url: `${base}/pricing`,
        description: spanish
          ? "Prueba gratis durante 7 días. Se requiere una tarjeta de crédito válida al activar la prueba. Si no cancelas antes de que finalice, la suscripción continuará automáticamente en el plan mensual de COP $90.000."
          : "7-day free trial. A valid credit card is required when you activate the trial. Unless you cancel before the trial ends, your subscription will automatically continue on the COP $90,000 monthly plan.",
      },
      {
        "@type": "Offer",
        name: spanish ? "Anual" : "Annual",
        price: String(options.annual),
        priceCurrency: options.currency,
        url: `${base}/pricing`,
        description: spanish
          ? "COP $540.000 al año, equivalente a un descuento del 50 % frente a doce pagos mensuales."
          : "COP $540,000 per year, a 50% discount versus twelve monthly payments.",
      },
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
export const PUBLIC_ROUTES = ["/", "/pricing", "/about", "/help", "/login", "/signup", "/privacy", "/terms-of-service", "/cookies", "/status"] as const;

/**
 * Per-route metadata: own canonical URL (instead of inheriting the root "/")
 * and, for pages behind sign-in, an explicit noindex so crawlers that reach a
 * deep link do not index the redirect shell. Open Graph/Twitter titles follow
 * the page title so shared links do not all read like the home page.
 */
export const OG_IMAGE = { url: "/home-assets/og/og-default.jpg", width: 1200, height: 630, alt: "Legal English 5 by MPC LAW STUDIO — Legal English for real legal work" };

export function pageMetadata(options: { title: string; description: string; path: string; index?: boolean; locale?: "en" | "es" }) {
  const index = options.index ?? false;
  const locale = options.locale ?? "en";
  const full = `${options.title} · ${SITE_NAME}`;
  return {
    title: options.title,
    description: options.description,
    alternates: {
      canonical: options.path,
      languages: {
        en: `${options.path === "/" ? "/" : options.path}?hl=en`,
        es: `${options.path === "/" ? "/" : options.path}?hl=es`,
        "x-default": options.path,
      },
    },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "website" as const,
      siteName: SITE_NAME,
      locale: locale === "es" ? "es_CO" : "en_US",
      alternateLocale: locale === "es" ? ["en_US"] : ["es_CO"],
      title: full,
      description: options.description,
      url: options.path,
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image" as const, title: full, description: options.description, images: [OG_IMAGE.url] },
  };
}
