import type { Locale } from "@/lib/i18n";

/**
 * Copy for the public landing pages (home, header, footer, pricing).
 *
 * The home page follows "Legal English 5 — Landing Page Implementation Brief
 * for Carlos v1.0 (7 Sep 2026)": section order and English wording are the
 * brief's, verbatim. Spanish is a faithful translation for the ES toggle.
 * Marketing owns this copy; product claims must stay within the approved
 * commercial model (change request v1.1, 9 Sep 2026).
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
    sample: string;
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
    annual: { name: string; discount: string; terms: string; note: string; cta: string };
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
    brandLine: "Legal English 5",
    title: "Legal English for real legal work.",
    lead: "Build practical Legal English vocabulary in context. Designed for Spanish-speaking lawyers, law students, and other legal professionals.",
    cta: "Start your 7-day free trial",
    sample: "Try a sample lesson",
    ctaNote: "7-day free trial. A valid credit card is required when you activate the trial. Unless you cancel before the trial ends, your subscription will automatically continue on the COP $90,000 monthly plan.",
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
    lead: "Legal English 5 is built around short, practical vocabulary learning with legally contextualized content. Designed for Spanish-speaking lawyers, law students, and other legal professionals.",
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
    lead: "One complete, learner-facing example from the editorially reviewed content.",
    source: "Editorially reviewed content",
  },
  launch: {
    eyebrow: "Launch content",
    title: "Start with focused Legal English for three core practice areas.",
    termsLabel: "Practice area",
    explore: "Explore the terms →",
    note: "Your subscription keeps access to published terms, quizzes, saved progress and review for as long as it stays active.",
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
      terms: "7-day free trial. A valid credit card is required when you activate the trial. Unless you cancel before the trial ends, your subscription will automatically continue on the COP $90,000 monthly plan.",
      cta: "Start your 7-day free trial",
      ctaNote: "Starting the trial on this form requires a valid credit card. Unless you cancel before the trial ends, the subscription continues on the COP $90,000 monthly plan.",
    },
    annual: {
      name: "Annual",
      discount: "50% discount",
      terms: "COP $540,000/year is a 50% discount versus twelve monthly payments (COP $1,080,000/year).",
      note: "After you activate the trial, select annual billing from your account before the trial ends to avoid the monthly charge.",
      cta: "Choose annual billing",
    },
    rule: "Prices in Colombian pesos (COP).",
    secure: "Secure checkout through Mercado Pago. Cancel anytime from your account.",
  },
  trust: {
    eyebrow: "Trust",
    title: "Created by Pilar Cruz — MPC LAW STUDIO",
    body: "Pilar Cruz, practising lawyer and Owner of MPC LAW STUDIO — Legal English Training, is responsible for the editorial quality of Legal English 5. Designed for Spanish-speaking lawyers, law students, and other legal professionals.",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    items: [
      ["Who is Legal English 5 for?", "Designed for Spanish-speaking lawyers, law students, and other legal professionals."],
      ["Is this a general English course?", "No. Legal English 5 is a specialized Legal English learning product focused on legally contextualized vocabulary and professional usage."],
      ["What does the subscription include?", "Access to published terms, quizzes, saved progress (New / Learning / Mastered) and review for as long as the subscription stays active. The trial starts when you activate it from Pricing or Sign up — a valid credit card is required."],
      ["Does it include pronunciation?", "Yes. Pronunciation audio is produced with approved voice technology and subject to editorial and technical quality control."],
      ["Does it explain differences between legal systems?", "When editorially applicable, a term may include a Civil Law Equivalent and material US/UK distinctions. Those components are conditional, not present on every term."],
      ["How does the free trial work?", "7-day free trial. A valid credit card is required when you activate the trial. Unless you cancel before the trial ends, your subscription will automatically continue on the COP $90,000 monthly plan."],
      ["How much does the annual plan cost?", "COP $540,000 per year, a 50% discount versus twelve monthly payments. After you activate the trial, select annual billing from your account before the trial ends to avoid the monthly charge."],
    ],
  },
  cta: {
    title: "Build your Legal English five minutes at a time.",
    button: "Start your 7-day free trial",
    note: "7-day free trial. A valid credit card is required when you activate the trial. Unless you cancel before the trial ends, your subscription will automatically continue on the COP $90,000 monthly plan.",
  },
  footer: {
    blurb: "Legal English 5 by MPC LAW STUDIO. Designed for Spanish-speaking lawyers, law students, and other legal professionals — five minutes at a time.",
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
    trust: "Payments by Mercado Pago · Data hosted on Supabase · We do not sell your personal data",
    madeIn: "MPC LAW STUDIO · Colombia",
    cookieText: "We only use essential cookies to keep you signed in and remember your language. No advertising trackers.",
    cookieAccept: "Got it",
    cookieMore: "Cookie Policy",
  },
};

const es: LandingCopy = {
  nav: { home: "Inicio", library: "Biblioteca de términos", how: "Cómo funciona", pricing: "Precios", about: "Nosotros", signIn: "Iniciar sesión", trial: "Empieza tu prueba gratis de 7 días", dashboard: "Mi panel", signOut: "Cerrar sesión" },
  hero: {
    brandLine: "Legal English 5",
    title: "Inglés jurídico para el trabajo legal real.",
    lead: "Construye vocabulario práctico de inglés jurídico en contexto. Diseñado para abogados, estudiantes de Derecho y otros profesionales jurídicos hispanohablantes.",
    cta: "Empieza tu prueba gratis de 7 días",
    sample: "Prueba una lección de muestra",
    ctaNote: "Prueba gratis durante 7 días. Se requiere una tarjeta de crédito válida al activar la prueba. Si no cancelas antes de que finalice, la suscripción continuará automáticamente en el plan mensual de COP $90.000.",
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
    lead: "Legal English 5 se basa en un aprendizaje de vocabulario breve y práctico, con contenido contextualizado jurídicamente. Diseñado para abogados, estudiantes de Derecho y otros profesionales jurídicos hispanohablantes.",
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
    lead: "Un ejemplo completo, tal como lo ve el estudiante, tomado del contenido revisado editorialmente.",
    source: "Contenido revisado editorialmente",
  },
  launch: {
    eyebrow: "Contenido de lanzamiento",
    title: "Empieza con inglés jurídico enfocado en tres áreas de práctica esenciales.",
    termsLabel: "Área de práctica",
    explore: "Explora los términos →",
    note: "La suscripción mantiene el acceso a los términos publicados, los quizzes, el progreso guardado y el repaso mientras permanezca activa.",
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
      terms: "Prueba gratis durante 7 días. Se requiere una tarjeta de crédito válida al activar la prueba. Si no cancelas antes de que finalice, la suscripción continuará automáticamente en el plan mensual de COP $90.000.",
      cta: "Empieza tu prueba gratis de 7 días",
      ctaNote: "Activar la prueba en este formulario requiere una tarjeta de crédito válida. Si no cancelas antes de que termine, la suscripción continúa en el plan mensual de COP $90.000.",
    },
    annual: {
      name: "Anual",
      discount: "50 % de descuento",
      terms: "COP $540.000/año equivale a un 50 % de descuento frente a doce pagos mensuales (COP $1.080.000/año).",
      note: "Después de activar la prueba, selecciona el plan anual desde tu cuenta antes de que finalice la prueba para evitar el cobro mensual.",
      cta: "Elegir facturación anual",
    },
    rule: "Precios en pesos colombianos (COP).",
    secure: "Pago seguro a través de Mercado Pago. Cancela cuando quieras desde tu cuenta.",
  },
  trust: {
    eyebrow: "Confianza",
    title: "Creado por Pilar Cruz — MPC LAW STUDIO",
    body: "Pilar Cruz, abogada en ejercicio y propietaria de MPC LAW STUDIO — Legal English Training, es responsable de la calidad editorial de Legal English 5. Diseñado para abogados, estudiantes de Derecho y otros profesionales jurídicos hispanohablantes.",
  },
  faq: {
    eyebrow: "Preguntas frecuentes",
    title: "Preguntas frecuentes",
    items: [
      ["¿Para quién es Legal English 5?", "Diseñado para abogados, estudiantes de Derecho y otros profesionales jurídicos hispanohablantes."],
      ["¿Es un curso de inglés general?", "No. Legal English 5 es un producto especializado de aprendizaje de inglés jurídico, centrado en vocabulario contextualizado jurídicamente y en su uso profesional."],
      ["¿Qué incluye la suscripción?", "Acceso a los términos publicados, quizzes, progreso guardado (Nuevo / En curso / Dominado) y repaso mientras la suscripción esté activa. La prueba empieza cuando la activas desde Precios o Registro: se requiere una tarjeta de crédito válida."],
      ["¿Incluye pronunciación?", "Sí. El audio de pronunciación se produce con tecnología de voz aprobada y control de calidad editorial y técnico."],
      ["¿Explica las diferencias entre sistemas jurídicos?", "Cuando es editorialmente aplicable, un término puede incluir un equivalente de derecho civil y distinciones relevantes entre EE. UU. y Reino Unido. Esos componentes son condicionales: no aparecen en todos los términos."],
      ["¿Cómo funciona la prueba gratis?", "Prueba gratis durante 7 días. Se requiere una tarjeta de crédito válida al activar la prueba. Si no cancelas antes de que finalice, la suscripción continuará automáticamente en el plan mensual de COP $90.000."],
      ["¿Cuánto cuesta el plan anual?", "COP $540.000 al año, un 50 % de descuento frente a doce pagos mensuales. Después de activar la prueba, selecciona el plan anual desde tu cuenta antes de que finalice para evitar el cobro mensual."],
    ],
  },
  cta: {
    title: "Construye tu inglés jurídico cinco minutos a la vez.",
    button: "Empieza tu prueba gratis de 7 días",
    note: "Prueba gratis durante 7 días. Se requiere una tarjeta de crédito válida al activar la prueba. Si no cancelas antes de que finalice, la suscripción continuará automáticamente en el plan mensual de COP $90.000.",
  },
  footer: {
    blurb: "Legal English 5 by MPC LAW STUDIO. Diseñado para abogados, estudiantes de Derecho y otros profesionales jurídicos hispanohablantes, cinco minutos a la vez.",
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
    trust: "Pagos con Mercado Pago · Datos alojados en Supabase · No vendemos tus datos personales",
    madeIn: "MPC LAW STUDIO · Colombia",
    cookieText: "Solo usamos cookies esenciales para mantener tu sesión y recordar tu idioma. Sin rastreadores publicitarios.",
    cookieAccept: "Entendido",
    cookieMore: "Política de cookies",
  },
};

export const landingCopy: Record<Locale, LandingCopy> = { en, es };
