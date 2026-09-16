/** Canonical public origin. Set NEXT_PUBLIC_SITE_URL on the VPS (e.g. https://legalenglish5.com). */
export const SITE_NAME = "Legal English 5";

/** Brand relationship shown market-wide (Landing Page Brief v1.0 §1). */
export const BRAND_OWNER = "MPC LAW STUDIO";
export const BRAND_LINE = `${SITE_NAME} by ${BRAND_OWNER}`;

/** Browser/SEO copy — "Textos Web e Instrucciones de Implementación" (14 Sep 2026), Part III SEO table (IMP-19). */
export const HOME_TITLE = "Legal English 5 | Professional Legal English in Context";
export const HOME_TITLE_ES = "Legal English 5 | Legal English profesional en contexto";
export const SITE_DESCRIPTION =
  "Build accurate, practical Legal English through focused lessons for Spanish-speaking lawyers, law students and legal professionals.";
export const SITE_DESCRIPTION_ES =
  "Desarrolla un Legal English preciso y práctico mediante lecciones enfocadas para abogados, estudiantes de Derecho y profesionales jurídicos hispanohablantes.";

/**
 * Approved page titles and meta descriptions (Part III SEO, EN verbatim; ES
 * equivalents). Titles are complete — they already carry the brand — so the
 * layouts pass them with `absolute`.
 */
export const SEO: Record<string, Record<"en" | "es", { title: string; description: string }>> = {
  "/terms": {
    en: { title: "Terms Library | Legal English 5", description: "Browse published Legal English terms across Contracts, Corporate Law and Employment Law." },
    es: { title: "Biblioteca de términos | Legal English 5", description: "Explora los términos de Legal English publicados en Contracts, Corporate Law y Employment Law." },
  },
  "/categories": {
    en: { title: "Legal English Areas | Legal English 5", description: "Explore Legal English terms in Contracts, Corporate Law and Employment Law." },
    es: { title: "Áreas de Legal English | Legal English 5", description: "Explora términos de Legal English en Contracts, Corporate Law y Employment Law." },
  },
  "/pricing": {
    en: { title: "Pricing and Free Trial | Legal English 5", description: "Compare monthly and annual Legal English 5 plans and review the 7-day free-trial terms." },
    es: { title: "Precios y prueba gratis | Legal English 5", description: "Compara los planes mensual y anual de Legal English 5 y revisa las condiciones de la prueba gratis de 7 días." },
  },
  "/about": {
    en: { title: "About Legal English 5 | MPC LAW STUDIO", description: "Learn how Legal English 5 content is developed and editorially reviewed for Spanish-speaking legal professionals." },
    es: { title: "Nosotros | Legal English 5 by MPC LAW STUDIO", description: "Conoce cómo se desarrolla y revisa editorialmente el contenido de Legal English 5 para profesionales jurídicos hispanohablantes." },
  },
  "/help": {
    en: { title: "Help and Support | Legal English 5", description: "Get help with sign-in, account access, billing, data requests and subscriptions." },
    es: { title: "Ayuda y soporte | Legal English 5", description: "Obtén ayuda con el inicio de sesión, el acceso a tu cuenta, la facturación, las solicitudes de datos y las suscripciones." },
  },
  "/status": {
    en: { title: "Service Status | Legal English 5", description: "Check the current availability of Legal English 5 services." },
    es: { title: "Estado del servicio | Legal English 5", description: "Consulta la disponibilidad actual de los servicios de Legal English 5." },
  },
  "/login": {
    en: { title: "Sign In | Legal English 5", description: "Sign in to continue from your saved Legal English 5 progress." },
    es: { title: "Iniciar sesión | Legal English 5", description: "Inicia sesión para continuar desde tu progreso guardado en Legal English 5." },
  },
  "/signup": {
    en: { title: "Create Account | Legal English 5", description: "Create a Legal English 5 account, then activate the 7-day free trial." },
    es: { title: "Crear cuenta | Legal English 5", description: "Crea una cuenta de Legal English 5 y luego activa la prueba gratis de 7 días." },
  },
  "/terms-of-service": {
    en: { title: "Terms of Service | Legal English 5", description: "Terms of Service for Legal English 5 by MPC LAW STUDIO, effective 11 September 2026." },
    es: { title: "Términos del Servicio | Legal English 5", description: "Términos del Servicio de Legal English 5 de MPC LAW STUDIO, vigentes desde el 11 de septiembre de 2026." },
  },
  "/privacy": {
    en: { title: "Personal Data Processing and Privacy Policy | Legal English 5", description: "How MPC LAW STUDIO processes personal data in Legal English 5 and how to exercise your rights." },
    es: { title: "Política de Tratamiento de Datos Personales y Privacidad | Legal English 5", description: "Cómo MPC LAW STUDIO trata los datos personales en Legal English 5 y cómo ejercer tus derechos." },
  },
  "/cookies": {
    en: { title: "Cookie Policy | Legal English 5", description: "Cookies and equivalent technologies used by Legal English 5: authentication, language preference and payment provider." },
    es: { title: "Política de Cookies | Legal English 5", description: "Cookies y tecnologías equivalentes que usa Legal English 5: autenticación, preferencia de idioma y proveedor de pagos." },
  },
};

/** Metadata for a public page from the approved SEO table, in the visitor's language. */
export function seoMetadata(path: keyof typeof SEO, locale: "en" | "es", index = true) {
  const entry = SEO[path][locale];
  const base = pageMetadata({ title: entry.title, description: entry.description, path, index, locale });
  return { ...base, title: { absolute: entry.title }, openGraph: { ...base.openGraph, title: entry.title }, twitter: { ...base.twitter, title: entry.title } };
}

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
        logo: `${base}/brand/le5-social-avatar-1200.png`,
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
