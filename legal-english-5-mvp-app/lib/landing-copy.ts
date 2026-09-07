import type { Locale } from "@/lib/i18n";

/**
 * Copy for the public landing pages (home, header, footer, pricing).
 *
 * The home page follows "Legal English 5 — Landing Page Implementation Brief
 * for Carlos v1.0 (7 Sep 2026)": section order and English wording are the
 * brief's, verbatim. Spanish is a faithful translation for the ES toggle.
 * Marketing owns this copy; product claims must stay within the current MVP.
 */

/** Approved launch pricing (brief §3.8 / §5). Annual = 50% off twelve monthly payments. */
export const PLAN_PRICES = {
  currency: "COP",
  monthly: 90_000,
  annual: 540_000,
  monthlyLabel: "COP $90,000",
  annualLabel: "COP $540,000",
  trialDays: 7,
} as const;

/** Launch scope (brief §3.6): exactly 30 Terms, ten per canonical category. */
export const LAUNCH_TERMS = { total: 30, perCategory: 10 } as const;

export type LandingCopy = {
  nav: { home: string; library: string; how: string; pricing: string; about: string; signIn: string; trial: string; dashboard: string; signOut: string };
  hero: {
    brandLine: string;
    title: string;
    lead: string;
    cta: string;
    ctaNote: string;
    slides: ReadonlyArray<{ caption: string; tag: string }>;
  };
  problem: { title: string; lead: string; items: readonly [readonly [string, string], readonly [string, string], readonly [string, string]] };
  solution: { title: string; lead: string };
  components: { eyebrow: string; title: string; items: ReadonlyArray<readonly [string, string]> };
  example: { eyebrow: string; title: string; lead: string; source: string };
  launch: { eyebrow: string; title: string; termsLabel: string; explore: string; note: string; items: readonly [string, string, string] };
  builtFor: { eyebrow: string; title: string; photoTag: string; photoCaption: string; items: readonly [readonly [string, string], readonly [string, string], readonly [string, string]] };
  pricing: {
    eyebrow: string;
    title: string;
    perMonth: string;
    perYear: string;
    monthly: { name: string; trial: string; terms: string; cta: string; ctaNote: string };
    annual: { name: string; discount: string; terms: string; note: string };
    rule: string;
    secure: string;
  };
  trust: { eyebrow: string; title: string; body: string };
  faq: { eyebrow: string; title: string; items: ReadonlyArray<readonly [string, string]> };
  cta: { title: string; button: string; note: string };
  footer: {
    blurb: string;
    product: string;
    support: string;
    legal: string;
    contact: string;
    links: { library: string; categories: string; how: string; pricing: string; about: string; helpCenter: string; faqs: string; contactUs: string; billing: string; status: string; terms: string; privacy: string; cookies: string };
    reply: string;
    rights: string;
    trust: string;
    madeIn: string;
    cookieText: string;
    cookieAccept: string;
    cookieMore: string;
  };
};

const en: LandingCopy = {
  nav: { home: "Home", library: "Terms Library", how: "How It Works", pricing: "Pricing", about: "About", signIn: "Sign In", trial: "Start your 7-day free trial", dashboard: "My dashboard", signOut: "Sign out" },
  hero: {
    brandLine: "Legal English 5 by MPC LAW STUDIO",
    title: "Legal English for real legal work.",
    lead: "Build practical Legal English vocabulary in context — designed for Spanish-speaking lawyers and legal professionals.",
    cta: "Start your 7-day free trial",
    ctaNote: "Credit card required. COP $90,000/month after the trial unless canceled before it ends.",
    slides: [
      { caption: "Reviewing a contract before signature", tag: "Contracts" },
      { caption: "Negotiating terms with the counterparty", tag: "Corporate Law" },
      { caption: "Preparing a matter in English", tag: "Legal professionals" },
      { caption: "A five-minute lesson between meetings", tag: "Five-minute learning" },
      { caption: "In-house team aligning on an employment matter", tag: "Employment Law" },
      { caption: "One vocabulary, two legal systems", tag: "Civil Law · Common Law" },
    ],
  },
  problem: {
    title: "Knowing English is not the same as using Legal English.",
    lead: "Legal work depends on more than translating individual words. Lawyers need the right terminology, natural legal combinations, context and awareness of differences between legal systems.",
    items: [
      ["Legal terminology", "Learn what a term means in legal context, not only its dictionary translation."],
      ["Legal collocations", "See the words lawyers naturally use together in professional legal English."],
      ["Different legal systems", "Understand material Common Law / Civil Law and US / UK distinctions when relevant."],
    ],
  },
  solution: {
    title: "Learn Legal English in legal context — not as isolated vocabulary.",
    lead: "Legal English 5 is built around short, practical vocabulary learning with legally contextualized content for Spanish-speaking legal professionals.",
  },
  components: {
    eyebrow: "Term components",
    title: "What each term can include",
    items: [
      ["Definition", "Plain-English legal definition."],
      ["Pronunciation", "Audio pronunciation."],
      ["Use It With", "Authentic legal collocations and combinations."],
      ["In Context", "Legal usage in context."],
      ["Quick Quiz", "A focused knowledge check."],
      ["Spanish-Speaker Alert", "Spanish-speaker-specific guidance when applicable."],
      ["Civil Law Equivalent", "Comparative-law guidance when editorially applicable."],
      ["US / UK distinctions", "Jurisdiction distinctions when relevant."],
    ],
  },
  example: {
    eyebrow: "Product example",
    title: "See how a legal term works in context.",
    lead: "One complete, learner-facing example from the approved Master Content Database.",
    source: "Approved content · Master Content Database",
  },
  launch: {
    eyebrow: "Launch content",
    title: "Start with focused Legal English for three core practice areas.",
    termsLabel: "10 Terms",
    explore: "Explore the terms →",
    note: "Launch scope: 30 Terms — 10 Contracts, 10 Corporate Law and 10 Employment Law.",
    items: ["Contracts", "Corporate Law", "Employment Law"],
  },
  builtFor: {
    eyebrow: "Built for legal professionals",
    title: "Built for legal professionals — not general English learners.",
    photoTag: "Legal practice",
    photoCaption: "Terminology, usage and comparative-law guidance for professional legal work.",
    items: [
      ["Legal context", "Terminology is presented with professional legal usage in mind."],
      ["Spanish-speaker perspective", "Guidance addresses recurring issues when moving between Spanish and English legal language."],
      ["Short learning experience", "The product follows a five-minute learning philosophy designed to respect a professional’s limited time."],
    ],
  },
  pricing: {
    eyebrow: "Pricing and free trial",
    title: "Choose the plan that fits your learning routine.",
    perMonth: "/ month",
    perYear: "/ year",
    monthly: {
      name: "Monthly",
      trial: "7-day free trial",
      terms: "Credit card required at trial start. Unless canceled before the trial ends, the subscription automatically continues on the monthly paid plan.",
      cta: "Start your 7-day free trial",
      ctaNote: "Credit card required. Cancel before the trial ends to avoid the COP $90,000 monthly charge.",
    },
    annual: {
      name: "Annual",
      discount: "50% discount",
      terms: "COP $540,000/year is a 50% discount versus twelve monthly payments (COP $1,080,000/year).",
      note: "Available from your account once your trial is active.",
    },
    rule: "Prices in Colombian pesos (COP).",
    secure: "Secure checkout through Mercado Pago. Cancel anytime from your account.",
  },
  trust: {
    eyebrow: "Trust",
    title: "Created by MPC LAW STUDIO — Legal English Training",
    body: "MPC LAW STUDIO brings a specialized Legal English training perspective to a product designed for lawyers and legal professionals from Spanish-speaking Civil Law jurisdictions.",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    items: [
      ["Who is Legal English 5 for?", "Spanish-speaking lawyers and legal professionals who need practical Legal English for professional legal work."],
      ["Is this a general English course?", "No. Legal English 5 is a specialized Legal English learning product focused on legally contextualized vocabulary and professional usage."],
      ["What is included at launch?", "The MVP launches with exactly 30 Terms: 10 Contracts, 10 Corporate Law and 10 Employment Law Terms."],
      ["Does it include pronunciation?", "Yes. Pronunciation/audio is part of the approved learner-facing product proposition."],
      ["Does it explain differences between legal systems?", "When editorially applicable, the product may include a Civil Law Equivalent and material US/UK distinctions."],
      ["How does the free trial work?", "The free trial lasts 7 days and requires a valid credit card at trial start. Unless you cancel before the trial ends, the subscription automatically continues on the monthly paid plan at COP $90,000/month."],
      ["How much does the annual plan cost?", "The approved annual price is COP $540,000/year, a 50% discount compared with twelve monthly payments."],
    ],
  },
  cta: {
    title: "Build your Legal English five minutes at a time.",
    button: "Start your 7-day free trial",
    note: "Credit card required. COP $90,000/month after the trial unless canceled before it ends.",
  },
  footer: {
    blurb: "Legal English 5 by MPC LAW STUDIO. Specialized, practical Legal English for Spanish-speaking legal professionals — five minutes at a time.",
    product: "Product",
    support: "Support",
    legal: "Legal",
    contact: "Contact",
    links: {
      library: "Terms Library",
      categories: "Categories",
      how: "How It Works",
      pricing: "Pricing",
      about: "About",
      helpCenter: "Help Center",
      faqs: "FAQs",
      contactUs: "Contact Us",
      billing: "Billing",
      status: "System Status",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      cookies: "Cookie Policy",
    },
    reply: "We typically reply within one business day.",
    rights: "© 2026 Legal English 5 by MPC LAW STUDIO. All rights reserved.",
    trust: "Payments by Mercado Pago · Data hosted on Supabase · Content from the Master Content Database",
    madeIn: "MPC LAW STUDIO · Colombia",
    cookieText: "We only use essential cookies to keep you signed in and remember your language. No advertising trackers.",
    cookieAccept: "Got it",
    cookieMore: "Privacy notice",
  },
};

const es: LandingCopy = {
  nav: { home: "Inicio", library: "Biblioteca de términos", how: "Cómo funciona", pricing: "Precios", about: "Nosotros", signIn: "Iniciar sesión", trial: "Empieza tu prueba gratis de 7 días", dashboard: "Mi panel", signOut: "Cerrar sesión" },
  hero: {
    brandLine: "Legal English 5 by MPC LAW STUDIO",
    title: "Inglés jurídico para el trabajo legal real.",
    lead: "Construye vocabulario práctico de inglés jurídico en contexto, diseñado para abogados y profesionales del derecho hispanohablantes.",
    cta: "Empieza tu prueba gratis de 7 días",
    ctaNote: "Se requiere tarjeta de crédito. COP $90.000/mes después de la prueba, salvo que canceles antes de que termine.",
    slides: [
      { caption: "Revisando un contrato antes de firmar", tag: "Contratos" },
      { caption: "Negociando condiciones con la contraparte", tag: "Derecho corporativo" },
      { caption: "Preparando un asunto en inglés", tag: "Profesionales del derecho" },
      { caption: "Una lección de cinco minutos entre reuniones", tag: "Aprendizaje de cinco minutos" },
      { caption: "Equipo interno alineado en un asunto laboral", tag: "Derecho laboral" },
      { caption: "Un vocabulario, dos sistemas jurídicos", tag: "Civil Law · Common Law" },
    ],
  },
  problem: {
    title: "Saber inglés no es lo mismo que usar inglés jurídico.",
    lead: "El trabajo legal exige más que traducir palabras sueltas. Los abogados necesitan la terminología correcta, combinaciones jurídicas naturales, contexto y conciencia de las diferencias entre sistemas jurídicos.",
    items: [
      ["Terminología jurídica", "Aprende qué significa un término en contexto jurídico, no solo su traducción de diccionario."],
      ["Colocaciones jurídicas", "Descubre las palabras que los abogados combinan de forma natural en inglés jurídico profesional."],
      ["Sistemas jurídicos distintos", "Comprende las diferencias relevantes entre Common Law y Civil Law, y entre EE. UU. y Reino Unido, cuando aplican."],
    ],
  },
  solution: {
    title: "Aprende inglés jurídico en contexto legal, no como vocabulario aislado.",
    lead: "Legal English 5 se basa en un aprendizaje de vocabulario breve y práctico, con contenido contextualizado jurídicamente para profesionales del derecho hispanohablantes.",
  },
  components: {
    eyebrow: "Componentes del término",
    title: "Qué puede incluir cada término",
    items: [
      ["Definición", "Definición jurídica en inglés claro."],
      ["Pronunciación", "Pronunciación en audio."],
      ["Use It With", "Colocaciones y combinaciones jurídicas auténticas."],
      ["In Context", "Uso jurídico en contexto."],
      ["Quick Quiz", "Una comprobación breve de conocimientos."],
      ["Spanish-Speaker Alert", "Orientación específica para hispanohablantes cuando aplica."],
      ["Civil Law Equivalent", "Orientación de derecho comparado cuando es editorialmente aplicable."],
      ["Distinciones EE. UU. / Reino Unido", "Diferencias de jurisdicción cuando son relevantes."],
    ],
  },
  example: {
    eyebrow: "Ejemplo del producto",
    title: "Mira cómo funciona un término jurídico en contexto.",
    lead: "Un ejemplo completo, tal como lo ve el estudiante, tomado de la Master Content Database aprobada.",
    source: "Contenido aprobado · Master Content Database",
  },
  launch: {
    eyebrow: "Contenido de lanzamiento",
    title: "Empieza con inglés jurídico enfocado en tres áreas de práctica esenciales.",
    termsLabel: "10 términos",
    explore: "Explora los términos →",
    note: "Alcance de lanzamiento: 30 términos — 10 de Contratos, 10 de Derecho corporativo y 10 de Derecho laboral.",
    items: ["Contratos", "Derecho corporativo", "Derecho laboral"],
  },
  builtFor: {
    eyebrow: "Hecho para profesionales del derecho",
    title: "Hecho para profesionales del derecho, no para estudiantes de inglés general.",
    photoTag: "Práctica jurídica",
    photoCaption: "Terminología, uso y orientación de derecho comparado para el trabajo legal profesional.",
    items: [
      ["Contexto jurídico", "La terminología se presenta pensando en su uso jurídico profesional."],
      ["Perspectiva del hispanohablante", "La orientación aborda los problemas recurrentes al pasar del lenguaje jurídico en español al inglés."],
      ["Experiencia de aprendizaje breve", "El producto sigue una filosofía de aprendizaje de cinco minutos, diseñada para respetar el tiempo limitado de un profesional."],
    ],
  },
  pricing: {
    eyebrow: "Precios y prueba gratis",
    title: "Elige el plan que se ajusta a tu rutina de aprendizaje.",
    perMonth: "/ mes",
    perYear: "/ año",
    monthly: {
      name: "Mensual",
      trial: "Prueba gratis de 7 días",
      terms: "Se requiere tarjeta de crédito al iniciar la prueba. Salvo que canceles antes de que termine, la suscripción continúa automáticamente en el plan mensual de pago.",
      cta: "Empieza tu prueba gratis de 7 días",
      ctaNote: "Se requiere tarjeta de crédito. Cancela antes de que termine la prueba para evitar el cobro mensual de COP $90.000.",
    },
    annual: {
      name: "Anual",
      discount: "50 % de descuento",
      terms: "COP $540.000/año equivale a un 50 % de descuento frente a doce pagos mensuales (COP $1.080.000/año).",
      note: "Disponible desde tu cuenta una vez activa la prueba.",
    },
    rule: "Precios en pesos colombianos (COP).",
    secure: "Pago seguro a través de Mercado Pago. Cancela cuando quieras desde tu cuenta.",
  },
  trust: {
    eyebrow: "Confianza",
    title: "Creado por MPC LAW STUDIO — Legal English Training",
    body: "MPC LAW STUDIO aporta una perspectiva especializada en formación de inglés jurídico a un producto diseñado para abogados y profesionales del derecho de jurisdicciones de Civil Law hispanohablantes.",
  },
  faq: {
    eyebrow: "Preguntas frecuentes",
    title: "Preguntas frecuentes",
    items: [
      ["¿Para quién es Legal English 5?", "Para abogados y profesionales del derecho hispanohablantes que necesitan inglés jurídico práctico para el trabajo legal profesional."],
      ["¿Es un curso de inglés general?", "No. Legal English 5 es un producto especializado de aprendizaje de inglés jurídico, centrado en vocabulario contextualizado jurídicamente y en su uso profesional."],
      ["¿Qué incluye el lanzamiento?", "El MVP se lanza con exactamente 30 términos: 10 de Contratos, 10 de Derecho corporativo y 10 de Derecho laboral."],
      ["¿Incluye pronunciación?", "Sí. La pronunciación en audio forma parte de la propuesta aprobada del producto."],
      ["¿Explica las diferencias entre sistemas jurídicos?", "Cuando es editorialmente aplicable, el producto puede incluir un equivalente de derecho civil y distinciones relevantes entre EE. UU. y Reino Unido."],
      ["¿Cómo funciona la prueba gratis?", "La prueba gratis dura 7 días y requiere una tarjeta de crédito válida al inicio. Salvo que canceles antes de que termine, la suscripción continúa automáticamente en el plan mensual de pago de COP $90.000/mes."],
      ["¿Cuánto cuesta el plan anual?", "El precio anual aprobado es COP $540.000/año, un 50 % de descuento frente a doce pagos mensuales."],
    ],
  },
  cta: {
    title: "Construye tu inglés jurídico cinco minutos a la vez.",
    button: "Empieza tu prueba gratis de 7 días",
    note: "Se requiere tarjeta de crédito. COP $90.000/mes después de la prueba, salvo que canceles antes de que termine.",
  },
  footer: {
    blurb: "Legal English 5 by MPC LAW STUDIO. Inglés jurídico especializado y práctico para profesionales del derecho hispanohablantes, cinco minutos a la vez.",
    product: "Producto",
    support: "Soporte",
    legal: "Legal",
    contact: "Contacto",
    links: {
      library: "Biblioteca de términos",
      categories: "Categorías",
      how: "Cómo funciona",
      pricing: "Precios",
      about: "Nosotros",
      helpCenter: "Centro de ayuda",
      faqs: "Preguntas frecuentes",
      contactUs: "Contáctanos",
      billing: "Facturación",
      status: "Estado del sistema",
      terms: "Términos del servicio",
      privacy: "Política de privacidad",
      cookies: "Política de cookies",
    },
    reply: "Normalmente respondemos en un día hábil.",
    rights: "© 2026 Legal English 5 by MPC LAW STUDIO. Todos los derechos reservados.",
    trust: "Pagos con Mercado Pago · Datos alojados en Supabase · Contenido de la Master Content Database",
    madeIn: "MPC LAW STUDIO · Colombia",
    cookieText: "Solo usamos cookies esenciales para mantener tu sesión y recordar tu idioma. Sin rastreadores publicitarios.",
    cookieAccept: "Entendido",
    cookieMore: "Aviso de privacidad",
  },
};

export const landingCopy: Record<Locale, LandingCopy> = { en, es };
