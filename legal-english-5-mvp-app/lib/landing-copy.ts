import type { Locale } from "@/lib/i18n";

/** Copy for the public landing pages (home, header, footer, pricing cards). */
/** Display prices shared by the home cards and /pricing until the Owner sets COP prices (Propuesta, kickoff). */
export const PLAN_PRICES = ["$0", "$9.99", "$79.99"] as const;

export type LandingCopy = {
  nav: { home: string; library: string; how: string; pricing: string; about: string; signIn: string; trial: string };
  hero: {
    title1: string;
    title2: string;
    lead: string;
    cta: string;
    explore: string;
    benefits: readonly [string, string, string, string];
    slides: ReadonlyArray<{ caption: string; tag: string }>;
    trust: ReadonlyArray<readonly [string, string]>;
    reassurance: string;
  };
  categories: { eyebrow: string; title: string; lead: string; explore: string; items: ReadonlyArray<readonly [string, string]> };
  learn: {
    eyebrow: string;
    title: string;
    lead: string;
    tabs: readonly [string, string, string, string, string, string];
    pronunciation: string;
    definition: string;
    exampleLabel: string;
    example: string;
    quickQuiz: string;
    quizCount: string;
    question: string;
    options: readonly [string, string, string, string];
    check: string;
    viewFull: string;
  };
  workflow: { eyebrow: string; title: string; lead: string; photoCaption: string; photoTag: string; steps: ReadonlyArray<readonly [string, string]> };
  life: { eyebrow: string; title: string; lead: string; photos: readonly [string, string, string] };
  features: { eyebrow: string; title: string; items: ReadonlyArray<readonly [string, string]>; statusNew: string; statusLearning: string; statusMastered: string; statusPrefix: string; statusOr: string };
  proof: { eyebrow: string; title: string; quotes: ReadonlyArray<readonly [string, string, string]>; stats: ReadonlyArray<readonly [string, string]> };
  pricing: {
    eyebrow: string;
    title: string;
    lead: string;
    perYear: string;
    perMonth: string;
    bestValue: string;
    mostPopular: string;
    secure: string;
    plans: ReadonlyArray<{ name: string; body: string; period: string; features: readonly string[]; cta: string }>;
    include: string;
    includeItems: readonly [string, string, string, string];
    guaranteeTitle: string;
    guaranteeBody: string;
  };
  cta: { title: string; lead: string; button: string };
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
  nav: { home: "Home", library: "Terms Library", how: "How It Works", pricing: "Pricing", about: "About", signIn: "Sign In", trial: "Start 7-Day Free Trial" },
  hero: {
    title1: "Master Legal English",
    title2: "in 5-Minute Sessions.",
    lead:
      "The microlearning platform built for Spanish-speaking lawyers and law students. Learn essential legal terminology through clear explanations, contextual usage, functional equivalents, and progress tracking.",
    cta: "Start 7-Day Free Trial",
    explore: "Explore Terms Library",
    benefits: ["5-Minute Lessons", "Built for legal professionals", "Track your progress", "No credit card required"],
    reassurance: "No credit card · Cancel anytime · 30 terms at launch, more every month",
    trust: [
      ["One source of truth", "Every term comes from a single Master Content Database"],
      ["Lawyer-reviewed", "Approved by a practising lawyer before publication"],
      ["Spanish-speaker notes", "Civil-law equivalents and false-friend alerts on every term"],
      ["Secure checkout", "Subscriptions handled by Mercado Pago; cancel anytime"],
    ],
    slides: [
      { caption: "Reviewing a contract before signature", tag: "Contracts" },
      { caption: "Negotiating terms with the counterparty", tag: "Corporate Law" },
      { caption: "Law students preparing a case in English", tag: "Study group" },
      { caption: "A five-minute lesson between meetings", tag: "Microlearning" },
      { caption: "In-house team aligning on an employment matter", tag: "Employment Law" },
      { caption: "One vocabulary, two legal systems", tag: "Civil law · Common law" },
    ],
  },
  categories: {
    eyebrow: "Curriculum",
    title: "Explore Our Launch Categories",
    lead: "Focused learning paths designed for real legal practice.",
    explore: "Explore Terms →",
    items: [
      ["Contracts", "Master essential contract terms and clauses used in everyday practice."],
      ["Corporate Law", "Learn the language of companies, governance, and business transactions."],
      ["Employment Law", "Build confidence with employment terms and workplace terminology."],
    ],
  },
  learn: {
    eyebrow: "Inside a lesson",
    title: "See How You’ll Learn",
    lead: "Every term includes clear definitions, real-world context, and smart practice.",
    tabs: ["Definition", "Spanish Equivalent", "Civil Law Equivalent", "Spanish-Speaker Alert", "Use It With", "In Context"],
    pronunciation: "Pronunciation: /kənˌsɪdəˈreɪʃən/",
    definition:
      "Something of value exchanged between parties that induces each to enter into a contract. It is a fundamental element required for a valid, enforceable contract in common law.",
    exampleLabel: "EXAMPLE",
    example: "The promisor agreed to pay $10,000 as consideration for the sale of the equipment.",
    quickQuiz: "Quick Quiz",
    quizCount: "1 of 3",
    question: "What is consideration in contract law?",
    options: ["A legal duty imposed by statute", "A promise without any exchange", "Something of value exchanged between parties", "A contract term added later"],
    check: "Check Answer",
    viewFull: "View full quiz →",
  },
  workflow: {
    eyebrow: "Method",
    title: "How It Works",
    lead: "Learn smarter in four simple steps.",
    photoCaption: "Five minutes between classes or before a hearing is enough for one term.",
    photoTag: "Study anywhere",
    steps: [
      ["Discover Terms", "Browse or search key legal terms by category or topic."],
      ["Study in Context", "Review clear explanations, equivalents, and real-world examples."],
      ["Take Quiz", "Reinforce your knowledge with short, focused quizzes."],
      ["Track Mastery", "Monitor your progress and build lasting confidence."],
    ],
  },
  features: {
    eyebrow: "Platform",
    title: "Everything You Need to Succeed",
    items: [
      ["Smart Search & Filters", "Find terms quickly by keyword, category, or practice area."],
      ["Learn Anywhere", "Responsive experience on desktop, tablet, and mobile."],
      ["Personalized Progress", ""],
      ["All-Access Subscription", "Unlimited access to all terms, quizzes, and new content."],
    ],
    statusPrefix: "Terms are marked as",
    statusNew: "New",
    statusLearning: "Learning",
    statusOr: "or",
    statusMastered: "Mastered",
  },
  life: {
    eyebrow: "Made for real practice",
    title: "The vocabulary you meet in real files, not in textbooks",
    lead: "Every term comes from documents lawyers actually draft, negotiate and litigate: share purchase agreements, board minutes, employment contracts. You learn the word the way you will use it.",
    photos: ["Reading a closing checklist", "Corporate counsel before a board meeting", "Case law in the firm library"],
  },
  proof: {
    eyebrow: "From the studio",
    title: "Written by a lawyer who reads these documents every day",
    quotes: [
      [
        "Every term in Legal English 5 started as a real question from a Spanish-speaking client or colleague: what does this clause actually mean, and what is the closest concept in our civil-law system? We answer it once, review it, and only then publish it. Nothing here is paraphrased by software.",
        "MPC Law Studio",
        "Editorial team · Colombia",
      ],
    ],
    stats: [
      ["30+", "Published Terms"],
      ["3", "Legal Categories"],
      ["7-Day", "Free Trial"],
      ["For Lawyers", "& Law Students"],
    ],
  },
  pricing: {
    eyebrow: "Plans",
    title: "Simple, Transparent Pricing",
    lead: "Full access to all terms, quizzes, and features.",
    perYear: "/year",
    perMonth: "/month",
    bestValue: "Best Value",
    mostPopular: "Most Popular",
    secure: "Secure checkout. Cancel anytime. No hidden fees.",
    plans: [
      { name: "7-Day Free Trial", body: "Full access. No credit card.", period: "for 7 days", features: ["Access all lessons", "Practice quizzes", "Track your progress", "Cancel anytime"], cta: "Start Free Trial" },
      { name: "Monthly Plan", body: "Cancel anytime.", period: "/month", features: ["Everything in Free Trial", "Full library access", "Personalized progress", "Priority support"], cta: "Start Monthly Plan" },
      { name: "Annual Plan", body: "Best value. Save more.", period: "/year", features: ["Everything in Monthly", "Save over 30%", "Early access to new content", "Cancel anytime"], cta: "Start Annual Plan" },
    ],
    include: "All plans include:",
    includeItems: ["Full access", "All lessons", "Cancel anytime", "Secure payment"],
    guaranteeTitle: "30-Day Money-Back Guarantee",
    guaranteeBody: "Not satisfied? Get a full refund within 30 days of purchase.",
  },
  cta: {
    title: "Ready to Master Legal English?",
    lead: "Built with a practising lawyer for Spanish-speaking professionals. Seven days free, no card required, cancel anytime.",
    button: "Start Your 7-Day Free Trial",
  },
  footer: {
    blurb: "The microlearning platform for Spanish-speaking lawyers and law students. Learn legal English in 5-minute sessions that fit your schedule.",
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
    rights: "© 2026 Legal English 5. All rights reserved.",
    trust: "Payments by Mercado Pago · Data hosted on Supabase · Content from MCD v1.3.81",
    madeIn: "MPC Law Studio · Colombia",
    cookieText: "We only use essential cookies to keep you signed in and remember your language. No advertising trackers.",
    cookieAccept: "Got it",
    cookieMore: "Privacy notice",
  },
};

const es: LandingCopy = {
  nav: { home: "Inicio", library: "Biblioteca de términos", how: "Cómo funciona", pricing: "Precios", about: "Nosotros", signIn: "Iniciar sesión", trial: "Prueba gratis de 7 días" },
  hero: {
    title1: "Domina el inglés jurídico",
    title2: "en sesiones de 5 minutos.",
    lead:
      "La plataforma de microaprendizaje creada para abogados y estudiantes de derecho hispanohablantes. Aprende la terminología jurídica esencial con explicaciones claras, uso en contexto, equivalentes funcionales y seguimiento del progreso.",
    cta: "Empezar prueba gratis de 7 días",
    explore: "Explorar la biblioteca",
    benefits: ["Lecciones de 5 minutos", "Hecho para profesionales del derecho", "Sigue tu progreso", "Sin tarjeta de crédito"],
    reassurance: "Sin tarjeta · Cancela cuando quieras · 30 términos al lanzamiento y más cada mes",
    trust: [
      ["Una sola fuente de verdad", "Cada término proviene de una única Master Content Database"],
      ["Revisado por abogada", "Aprobado por una abogada en ejercicio antes de publicarse"],
      ["Notas para hispanohablantes", "Equivalentes de derecho civil y alertas de falsos amigos en cada término"],
      ["Pago seguro", "Suscripciones gestionadas por Mercado Pago; cancela cuando quieras"],
    ],
    slides: [
      { caption: "Revisando un contrato antes de firmar", tag: "Contratos" },
      { caption: "Negociando condiciones con la contraparte", tag: "Derecho corporativo" },
      { caption: "Estudiantes de derecho preparando un caso en inglés", tag: "Grupo de estudio" },
      { caption: "Una lección de cinco minutos entre reuniones", tag: "Microaprendizaje" },
      { caption: "Equipo interno alineado en un asunto laboral", tag: "Derecho laboral" },
      { caption: "Un vocabulario, dos sistemas jurídicos", tag: "Civil law · Common law" },
    ],
  },
  categories: {
    eyebrow: "Plan de estudio",
    title: "Explora las categorías de lanzamiento",
    lead: "Rutas de aprendizaje enfocadas en la práctica jurídica real.",
    explore: "Explorar términos →",
    items: [
      ["Contratos", "Domina los términos y cláusulas contractuales esenciales de la práctica diaria."],
      ["Derecho corporativo", "Aprende el lenguaje de las sociedades, el gobierno corporativo y las transacciones."],
      ["Derecho laboral", "Gana confianza con la terminología laboral y del entorno de trabajo."],
    ],
  },
  learn: {
    eyebrow: "Dentro de una lección",
    title: "Así aprenderás",
    lead: "Cada término incluye definiciones claras, contexto real y práctica inteligente.",
    tabs: ["Definición", "Equivalente en español", "Equivalente en derecho civil", "Alerta para hispanohablantes", "Se usa con", "En contexto"],
    pronunciation: "Pronunciación: /kənˌsɪdəˈreɪʃən/",
    definition:
      "Algo de valor que las partes intercambian y que induce a cada una a celebrar el contrato. Es un elemento esencial para que un contrato sea válido y exigible en el common law.",
    exampleLabel: "EJEMPLO",
    example: "The promisor agreed to pay $10,000 as consideration for the sale of the equipment.",
    quickQuiz: "Quiz rápido",
    quizCount: "1 de 3",
    question: "¿Qué es consideration en el derecho contractual?",
    options: ["Un deber legal impuesto por ley", "Una promesa sin intercambio alguno", "Algo de valor intercambiado entre las partes", "Una cláusula añadida después"],
    check: "Comprobar respuesta",
    viewFull: "Ver el quiz completo →",
  },
  workflow: {
    eyebrow: "Método",
    title: "Cómo funciona",
    lead: "Aprende mejor en cuatro pasos sencillos.",
    photoCaption: "Cinco minutos entre clases o antes de una audiencia bastan para un término.",
    photoTag: "Estudia donde estés",
    steps: [
      ["Descubre términos", "Explora o busca términos jurídicos clave por categoría o tema."],
      ["Estudia en contexto", "Revisa explicaciones claras, equivalentes y ejemplos reales."],
      ["Haz el quiz", "Refuerza lo aprendido con quizzes breves y enfocados."],
      ["Sigue tu dominio", "Mide tu progreso y gana confianza duradera."],
    ],
  },
  features: {
    eyebrow: "Plataforma",
    title: "Todo lo que necesitas para avanzar",
    items: [
      ["Búsqueda y filtros inteligentes", "Encuentra términos rápidamente por palabra clave, categoría o área de práctica."],
      ["Aprende donde quieras", "Experiencia adaptada a escritorio, tableta y móvil."],
      ["Progreso personalizado", ""],
      ["Suscripción con acceso total", "Acceso ilimitado a todos los términos, quizzes y contenido nuevo."],
    ],
    statusPrefix: "Los términos se marcan como",
    statusNew: "Nuevo",
    statusLearning: "Aprendiendo",
    statusOr: "o",
    statusMastered: "Dominado",
  },
  life: {
    eyebrow: "Hecho para la práctica real",
    title: "El vocabulario que aparece en expedientes reales, no en manuales",
    lead: "Cada término viene de documentos que los abogados redactan, negocian y litigan: contratos de compraventa de acciones, actas de junta, contratos laborales. Aprendes la palabra como la vas a usar.",
    photos: ["Revisando un checklist de cierre", "Abogada corporativa antes de una junta", "Jurisprudencia en la biblioteca del despacho"],
  },
  proof: {
    eyebrow: "Desde el estudio",
    title: "Escrito por una abogada que lee estos documentos cada día",
    quotes: [
      [
        "Cada término de Legal English 5 nació de una pregunta real de un cliente o colega hispanohablante: ¿qué significa realmente esta cláusula y cuál es el concepto más cercano en nuestro sistema de derecho civil? La respondemos una vez, la revisamos y solo entonces la publicamos. Nada aquí está parafraseado por software.",
        "MPC Law Studio",
        "Equipo editorial · Colombia",
      ],
    ],
    stats: [
      ["30+", "Términos publicados"],
      ["3", "Categorías jurídicas"],
      ["7 días", "de prueba gratis"],
      ["Para abogados", "y estudiantes de derecho"],
    ],
  },
  pricing: {
    eyebrow: "Planes",
    title: "Precios simples y transparentes",
    lead: "Acceso completo a todos los términos, quizzes y funciones.",
    perYear: "/año",
    perMonth: "/mes",
    bestValue: "Mejor valor",
    mostPopular: "Más popular",
    secure: "Pago seguro. Cancela cuando quieras. Sin cargos ocultos.",
    plans: [
      { name: "Prueba gratis de 7 días", body: "Acceso completo. Sin tarjeta.", period: "por 7 días", features: ["Acceso a todas las lecciones", "Quizzes de práctica", "Seguimiento del progreso", "Cancela cuando quieras"], cta: "Empezar prueba gratis" },
      { name: "Plan mensual", body: "Cancela cuando quieras.", period: "/mes", features: ["Todo lo de la prueba gratis", "Acceso a toda la biblioteca", "Progreso personalizado", "Soporte prioritario"], cta: "Elegir plan mensual" },
      { name: "Plan anual", body: "Mejor valor. Ahorra más.", period: "/año", features: ["Todo lo del plan mensual", "Ahorra más del 30 %", "Acceso anticipado a contenido nuevo", "Cancela cuando quieras"], cta: "Elegir plan anual" },
    ],
    include: "Todos los planes incluyen:",
    includeItems: ["Acceso completo", "Todas las lecciones", "Cancela cuando quieras", "Pago seguro"],
    guaranteeTitle: "Garantía de devolución de 30 días",
    guaranteeBody: "¿No te convence? Reembolso completo dentro de los 30 días posteriores a la compra.",
  },
  cta: {
    title: "¿Listo para dominar el inglés jurídico?",
    lead: "Creado con una abogada en ejercicio para profesionales hispanohablantes. Siete días gratis, sin tarjeta, cancela cuando quieras.",
    button: "Empieza tu prueba gratis de 7 días",
  },
  footer: {
    blurb: "La plataforma de microaprendizaje para abogados y estudiantes de derecho hispanohablantes. Aprende inglés jurídico en sesiones de 5 minutos que se ajustan a tu agenda.",
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
    rights: "© 2026 Legal English 5. Todos los derechos reservados.",
    trust: "Pagos con Mercado Pago · Datos alojados en Supabase · Contenido de la MCD v1.3.81",
    madeIn: "MPC Law Studio · Colombia",
    cookieText: "Solo usamos cookies esenciales para mantener tu sesión y recordar tu idioma. Sin rastreadores publicitarios.",
    cookieAccept: "Entendido",
    cookieMore: "Aviso de privacidad",
  },
};

export const landingCopy: Record<Locale, LandingCopy> = { en, es };
