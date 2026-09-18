import type { Locale } from "@/lib/i18n";

/**
 * Copy for the public landing pages (home, header, footer, pricing).
 *
 * Source of truth: "Legal English 5 — Textos Web e Instrucciones de
 * Implementación" (MPC LAW STUDIO, 14 Sep 2026), Part III (final EN / ES web
 * copy) and Part IV (interface terminology). Wording is the approved text,
 * verbatim, in both languages. Learner-facing copy says Area / Areas — never
 * Category — and carries no internal identifiers, versions or provider names.
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

/** Launch scope (brief §3.6): exactly 30 Terms, ten per Area. */
export const LAUNCH_TERMS = { total: 30, perCategory: 10 } as const;

export type LandingCopy = {
  nav: { home: string; library: string; areas: string; how: string; pricing: string; about: string; signIn: string; trial: string; dashboard: string; signOut: string; menu: string; account: string; language: string };
  hero: {
    brandLine: string;
    title: string;
    lead: string;
    audience: string;
    cta: string;
    sample: string;
    slides: ReadonlyArray<{ caption: string; tag: string }>;
    photoAlt: string;
  };
  example: { eyebrow: string; title: string; lead: string; label: string };
  launch: { eyebrow: string; title: string; termsLabel: string; explore: string; note: string; items: readonly [string, string, string] };
  benefits: { eyebrow: string; title: string; items: readonly [readonly [string, string], readonly [string, string], readonly [string, string]] };
  components: { title: string; items: ReadonlyArray<string> };
  trust: { eyebrow: string; title: string; body: string; cta: string };
  pricing: {
    eyebrow: string;
    title: string;
    intro: string;
    perMonth: string;
    perYear: string;
    monthly: { name: string; trial: string; terms: string; cta: string };
    annual: { name: string; discount: string; note: string; cta: string };
    payment: string;
  };
  faq: { eyebrow: string; title: string; items: ReadonlyArray<readonly [string, string]> };
  cta: { title: string; body: string; button: string };
  footer: {
    blurb: string;
    product: string;
    support: string;
    legal: string;
    contact: string;
    links: { library: string; categories: string; how: string; pricing: string; about: string; helpCenter: string; faqs: string; contactUs: string; billing: string; status: string; terms: string; privacy: string; cookies: string; sic: string };
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
  nav: {
    home: "Home",
    library: "Terms Library",
    areas: "Areas",
    how: "How It Works",
    pricing: "Pricing",
    about: "About",
    signIn: "Sign In",
    trial: "Start your 7-day free trial",
    dashboard: "My Dashboard",
    signOut: "Sign Out",
    menu: "Menu",
    account: "Account",
    language: "Language",
  },
  hero: {
    brandLine: "LEGAL ENGLISH 5",
    title: "Legal English for real legal work.",
    lead: "Build accurate, practical Legal English through focused five-minute lessons. Understand legal terms in context, learn the collocations lawyers use, and recognize relevant differences between Common Law and Civil Law.",
    audience: "Designed for Spanish-speaking lawyers, law students and other legal professionals.",
    cta: "Start your 7-day free trial",
    sample: "Explore a sample term",
    slides: [
      { caption: "Reviewing a contract before signature", tag: "Contracts" },
      { caption: "Negotiating terms with the counterparty", tag: "Corporate Law" },
      { caption: "Preparing a matter in English", tag: "Legal professionals" },
      { caption: "A five-minute lesson between meetings", tag: "Five-minute learning" },
      { caption: "In-house team aligning on an employment matter", tag: "Employment Law" },
      { caption: "One vocabulary, two legal systems", tag: "Civil Law · Common Law" },
    ],
    photoAlt: "Two legal professionals review documents together in a modern corporate office.",
  },
  example: {
    eyebrow: "PRODUCT EXAMPLE",
    title: "See how a legal term works in context.",
    lead: "Explore how a definition, pronunciation, Spanish equivalent, legal collocations, context and a focused quiz work together in one term.",
    label: "A look inside a term",
  },
  launch: {
    eyebrow: "LEGAL ENGLISH AREAS",
    title: "Start with three core Areas of legal practice.",
    termsLabel: "Area",
    explore: "Explore terms",
    note: "Choose an Area and learn at your own pace. Your active subscription includes terms, focused quizzes, saved progress and review.",
    items: ["Contracts", "Corporate Law", "Employment Law"],
  },
  benefits: {
    eyebrow: "BUILT FOR LEGAL PROFESSIONALS",
    title: "Learn Legal English in legal context, not as isolated vocabulary.",
    items: [
      ["Legal meaning in context", "Understand what a term means in legal documents and professional use, not only its dictionary translation."],
      ["Professional collocations", "Learn the words lawyers commonly use together in contracts and other legal materials."],
      ["Common Law and Civil Law distinctions", "Recognize relevant differences between legal systems and between US and UK usage when they affect meaning or professional use."],
    ],
  },
  components: {
    title: "What a term may include",
    items: [
      "Plain-English Definition",
      "Pronunciation",
      "Spanish Equivalent",
      "Civil Law Equivalent, when applicable",
      "Spanish-Speaker Alert, when applicable",
      "Legalese Watch, when applicable",
      "Do Not Confuse With, when applicable",
      "Use It With",
      "In Context",
      "Quick Quiz",
    ],
  },
  trust: {
    eyebrow: "EDITORIAL RESPONSIBILITY",
    title: "Developed for legal accuracy and professional use",
    body: "María del Pilar Cruz, a Colombian lawyer and owner of MPC LAW STUDIO — Legal English Training, is responsible for the editorial quality of Legal English 5. The content is developed for Spanish-speaking legal professionals and reviewed before publication.",
    cta: "Meet the editor and review our process",
  },
  pricing: {
    eyebrow: "PRICING AND FREE TRIAL",
    title: "Choose monthly or annual access.",
    intro: "Begin with a 7-day free trial. A valid credit card is required to activate it.",
    perMonth: "/ month",
    perYear: "/ year",
    monthly: {
      name: "Monthly",
      trial: "7-day free trial",
      terms: "Unless you cancel before the trial ends, your subscription will automatically continue on the COP $90,000 monthly plan.",
      cta: "Start your 7-day free trial",
    },
    annual: {
      name: "Annual",
      discount: "50% discount compared with twelve monthly payments",
      note: "After you activate the trial, select annual billing from your account before the trial ends to avoid the monthly charge.",
      cta: "Start your trial and choose annual billing",
    },
    payment: "Secure checkout through Mercado Pago. Cancel anytime from your account. Prices are in Colombian pesos (COP).",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    items: [
      ["Who is Legal English 5 for?", "Legal English 5 is designed for Spanish-speaking lawyers, law students and other legal professionals who need English for legal study or professional practice. Learners should have an intermediate level of English (B1 or higher)."],
      ["Is this a general English course?", "No. Legal English 5 focuses on legally contextualized terminology, professional usage, collocations and relevant differences between legal systems."],
      ["Can I learn at my own pace?", "Yes. Choose an Area, study in short sessions and continue from your saved progress. You can also search terms without changing your learning route."],
      ["What does the subscription include?", "An active subscription includes access to terms, pronunciation audio, focused quizzes, saved progress and review features."],
      ["Does every term include the same components?", "No. Every published term includes its required core content. Civil Law Equivalent, Spanish-Speaker Alert and other conditional components appear only when editorially relevant."],
      ["Does Legal English 5 explain differences between legal systems?", "Yes, when the distinction is relevant to meaning or professional use. A term may include a Civil Law Equivalent or a material US/UK distinction."],
      ["How does the free trial work?", "Activate a 7-day free trial with a valid credit card. Unless you cancel before the trial ends, your subscription will automatically continue on the COP $90,000 monthly plan."],
      ["How much does the annual plan cost?", "The annual plan costs COP $540,000, a 50% discount compared with twelve monthly payments. To choose it, select annual billing from your account before the trial ends."],
    ],
  },
  cta: {
    title: "Make five minutes count in your legal practice.",
    body: "Start with one term and build a consistent Legal English practice.",
    button: "Start your 7-day free trial",
  },
  footer: {
    blurb: "Professional Legal English for Spanish-speaking legal professionals. Developed and editorially reviewed by MPC LAW STUDIO.",
    product: "Product",
    support: "Support",
    legal: "Legal",
    contact: "Contact",
    links: {
      library: "Terms Library",
      categories: "Areas",
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
      sic: "Superintendence of Industry and Commerce (SIC)",
    },
    reply: "We typically reply within one business day.",
    rights: "© 2026 Legal English 5 by MPC LAW STUDIO. All rights reserved.",
    trust: "Payments processed through Mercado Pago. Personal data is handled as described in our Privacy Policy.",
    madeIn: "MPC LAW STUDIO · Colombia",
    cookieText: "We only use strictly necessary technologies: your sign-in session, your language preference and, during checkout, Mercado Pago's own cookies. No analytics or advertising trackers.",
    cookieAccept: "Got it",
    cookieMore: "Cookie Policy",
  },
};

const es: LandingCopy = {
  nav: {
    home: "Inicio",
    library: "Biblioteca de términos",
    areas: "Áreas",
    how: "Cómo funciona",
    pricing: "Precios",
    about: "Nosotros",
    signIn: "Iniciar sesión",
    trial: "Empieza tu prueba gratis de 7 días",
    dashboard: "Mi panel",
    signOut: "Cerrar sesión",
    menu: "Menú",
    account: "Cuenta",
    language: "Idioma",
  },
  hero: {
    brandLine: "LEGAL ENGLISH 5",
    title: "Legal English para el trabajo jurídico real.",
    lead: "Desarrolla un Legal English preciso y práctico mediante lecciones enfocadas de cinco minutos. Comprende los términos jurídicos en contexto, aprende las colocaciones que usan los abogados y reconoce las diferencias relevantes entre Common Law y Civil Law.",
    audience: "Diseñado para abogados, estudiantes de Derecho y otros profesionales jurídicos hispanohablantes.",
    cta: "Empieza tu prueba gratis de 7 días",
    sample: "Explora un término de muestra",
    slides: [
      { caption: "Revisando un contrato antes de firmar", tag: "Contracts" },
      { caption: "Negociando condiciones con la contraparte", tag: "Corporate Law" },
      { caption: "Preparando un asunto en inglés", tag: "Profesionales del derecho" },
      { caption: "Una lección de cinco minutos entre reuniones", tag: "Aprendizaje de cinco minutos" },
      { caption: "Equipo interno alineado en un asunto laboral", tag: "Employment Law" },
      { caption: "Un vocabulario, dos sistemas jurídicos", tag: "Civil Law · Common Law" },
    ],
    photoAlt: "Dos profesionales del derecho revisan documentos juntos en una oficina corporativa moderna.",
  },
  example: {
    eyebrow: "EJEMPLO DEL PRODUCTO",
    title: "Mira cómo funciona un término jurídico en contexto.",
    lead: "Descubre cómo la definición, la pronunciación, el equivalente en español, las colocaciones jurídicas, el contexto y un quiz breve se integran en un solo término.",
    label: "Vista previa de un término",
  },
  launch: {
    eyebrow: "ÁREAS DE LEGAL ENGLISH",
    title: "Empieza con tres Áreas esenciales de la práctica jurídica.",
    termsLabel: "Área",
    explore: "Explorar términos",
    note: "Elige un Área y aprende a tu propio ritmo. Tu suscripción activa incluye los términos, quizzes breves, progreso guardado y repaso.",
    items: ["Contracts", "Corporate Law", "Employment Law"],
  },
  benefits: {
    eyebrow: "DISEÑADO PARA PROFESIONALES DEL DERECHO",
    title: "Aprende Legal English en contexto jurídico, no como vocabulario aislado.",
    items: [
      ["Significado jurídico en contexto", "Comprende qué significa un término en documentos jurídicos y en el uso profesional, no solo su traducción de diccionario."],
      ["Colocaciones profesionales", "Aprende las palabras que los abogados suelen usar juntas en contratos y otros materiales jurídicos."],
      ["Diferencias entre Common Law y Civil Law", "Reconoce diferencias relevantes entre sistemas jurídicos y entre el uso estadounidense y británico cuando afectan el significado o el uso profesional."],
    ],
  },
  components: {
    title: "Qué puede incluir un término",
    items: [
      "Plain-English Definition",
      "Pronunciation",
      "Spanish Equivalent",
      "Civil Law Equivalent, cuando corresponda",
      "Spanish-Speaker Alert, cuando corresponda",
      "Legalese Watch, cuando corresponda",
      "Do Not Confuse With, cuando corresponda",
      "Use It With",
      "In Context",
      "Quick Quiz",
    ],
  },
  trust: {
    eyebrow: "RESPONSABILIDAD EDITORIAL",
    title: "Desarrollado con precisión jurídica y utilidad profesional",
    body: "María del Pilar Cruz, abogada colombiana y propietaria de MPC LAW STUDIO — Legal English Training, es responsable de la calidad editorial de Legal English 5. El contenido se desarrolla para profesionales jurídicos hispanohablantes y se revisa antes de su publicación.",
    cta: "Conoce a la editora y revisa nuestro proceso",
  },
  pricing: {
    eyebrow: "PRECIOS Y PRUEBA GRATIS",
    title: "Elige acceso mensual o anual.",
    intro: "Empieza con una prueba gratis de 7 días. Se requiere una tarjeta de crédito válida para activarla.",
    perMonth: "/ mes",
    perYear: "/ año",
    monthly: {
      name: "Mensual",
      trial: "Prueba gratis de 7 días",
      terms: "Si no cancelas antes de que finalice la prueba, la suscripción continuará automáticamente en el plan mensual de COP $90.000.",
      cta: "Empieza tu prueba gratis de 7 días",
    },
    annual: {
      name: "Anual",
      discount: "50 % de descuento frente a doce pagos mensuales",
      note: "Después de activar la prueba, selecciona la facturación anual desde tu cuenta antes de que finalice para evitar el cobro mensual.",
      cta: "Empieza la prueba y elige facturación anual",
    },
    payment: "Pago seguro a través de Mercado Pago. Cancela cuando quieras desde tu cuenta. Los precios están expresados en pesos colombianos (COP).",
  },
  faq: {
    eyebrow: "PREGUNTAS FRECUENTES",
    title: "Preguntas frecuentes",
    items: [
      ["¿Para quién es Legal English 5?", "Legal English 5 está diseñado para abogados, estudiantes de Derecho y otros profesionales jurídicos hispanohablantes que necesitan inglés para sus estudios o su práctica profesional. Los estudiantes deben tener un nivel intermedio de inglés (B1 o superior)."],
      ["¿Es un curso de inglés general?", "No. Legal English 5 se enfoca en terminología jurídicamente contextualizada, uso profesional, colocaciones y diferencias relevantes entre sistemas jurídicos."],
      ["¿Puedo aprender a mi propio ritmo?", "Sí. Elige un Área, estudia en sesiones cortas y continúa desde tu progreso guardado. También puedes buscar términos sin cambiar tu ruta de aprendizaje."],
      ["¿Qué incluye la suscripción?", "Una suscripción activa incluye acceso a los términos, audio de pronunciación, quizzes breves, progreso guardado y herramientas de repaso."],
      ["¿Todos los términos incluyen los mismos componentes?", "No. Cada término publicado incluye su contenido esencial obligatorio. Civil Law Equivalent, Spanish-Speaker Alert y otros componentes condicionales aparecen únicamente cuando son editorialmente relevantes."],
      ["¿Legal English 5 explica diferencias entre sistemas jurídicos?", "Sí, cuando la distinción es relevante para el significado o el uso profesional. Un término puede incluir un Civil Law Equivalent o una diferencia relevante entre el uso estadounidense y británico."],
      ["¿Cómo funciona la prueba gratis?", "Activa una prueba gratis de 7 días con una tarjeta de crédito válida. Si no cancelas antes de que finalice, la suscripción continuará automáticamente en el plan mensual de COP $90.000."],
      ["¿Cuánto cuesta el plan anual?", "El plan anual cuesta COP $540.000, un 50 % de descuento frente a doce pagos mensuales. Para elegirlo, selecciona la facturación anual desde tu cuenta antes de que termine la prueba."],
    ],
  },
  cta: {
    title: "Haz que cinco minutos cuenten en tu práctica jurídica.",
    body: "Empieza con un término y construye una práctica constante de Legal English.",
    button: "Empieza tu prueba gratis de 7 días",
  },
  footer: {
    blurb: "Legal English profesional para profesionales jurídicos hispanohablantes. Desarrollado y revisado editorialmente por MPC LAW STUDIO.",
    product: "Producto",
    support: "Soporte",
    legal: "Legal",
    contact: "Contacto",
    links: {
      library: "Biblioteca de términos",
      categories: "Áreas",
      how: "Cómo funciona",
      pricing: "Precios",
      about: "Nosotros",
      helpCenter: "Centro de ayuda",
      faqs: "Preguntas frecuentes",
      contactUs: "Contáctanos",
      billing: "Facturación",
      status: "Estado del sistema",
      terms: "Términos del Servicio",
      privacy: "Política de Tratamiento de Datos Personales y Privacidad",
      cookies: "Política de Cookies",
      sic: "Superintendencia de Industria y Comercio (SIC)",
    },
    reply: "Normalmente respondemos en un día hábil.",
    rights: "© 2026 Legal English 5 by MPC LAW STUDIO. Todos los derechos reservados.",
    trust: "Pagos procesados a través de Mercado Pago. Los datos personales se tratan según nuestra Política de Tratamiento de Datos Personales y Privacidad.",
    madeIn: "MPC LAW STUDIO · Colombia",
    cookieText: "Solo usamos tecnologías estrictamente necesarias: tu sesión de inicio, tu preferencia de idioma y, durante el pago, las cookies propias de Mercado Pago. Sin analítica ni rastreadores publicitarios.",
    cookieAccept: "Entendido",
    cookieMore: "Política de Cookies",
  },
};

export const landingCopy: Record<Locale, LandingCopy> = { en, es };
