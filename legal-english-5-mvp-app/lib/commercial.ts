import type { Locale } from "@/lib/i18n";

/**
 * Owner-approved commercial lines from
 * Solicitud de Cambios Web v1.1 (9 Sep 2026). Public pages must reuse these
 * strings so trial, privacy, audience and contact never drift.
 */

export const SUPPORT_EMAIL = "support@legalenglish5.com";

export const AUDIENCE: Record<Locale, string> = {
  en: "Designed for Spanish-speaking lawyers, law students, and other legal professionals.",
  es: "Diseñado para abogados, estudiantes de Derecho y otros profesionales jurídicos hispanohablantes.",
};

export const TRIAL_DISCLOSURE: Record<Locale, string> = {
  en: "7-day free trial. A valid credit card is required when you activate the trial. Unless you cancel before the trial ends, your subscription will automatically continue on the COP $90,000 monthly plan.",
  es: "Prueba gratis durante 7 días. Se requiere una tarjeta de crédito válida al activar la prueba. Si no cancelas antes de que finalice, la suscripción continuará automáticamente en el plan mensual de COP $90.000.",
};

export const PRIVACY_PROCESSORS: Record<Locale, string> = {
  en: "We do not sell your personal data. We only share it with the providers needed to operate the service and process payments, as described in our Privacy Policy.",
  es: "No vendemos tus datos personales. Solo los compartimos con los proveedores necesarios para operar el servicio y procesar pagos, conforme a nuestra Política de privacidad.",
};

export const ANNUAL_HOWTO: Record<Locale, string> = {
  en: "Annual plan: COP $540,000 per year, a 50% discount versus twelve monthly payments. After you activate the trial, select annual billing from your account before the trial ends to avoid the monthly charge.",
  es: "Plan anual: COP $540.000 al año, equivalente a un descuento del 50 % frente a doce pagos mensuales. Después de activar la prueba, selecciona el plan anual desde tu cuenta antes de que finalice la prueba para evitar el cobro mensual.",
};

export const QUALITY_LINE: Record<Locale, string> = {
  en: "Content developed and editorially reviewed for Spanish-speaking legal professionals.",
  es: "Contenido desarrollado y revisado editorialmente para profesionales jurídicos hispanohablantes.",
};

export const AUDIO_LINE: Record<Locale, string> = {
  en: "Pronunciation audio produced with approved voice technology and subject to editorial and technical quality control.",
  es: "Audio de pronunciación producido mediante tecnología de voz aprobada y sometido a control de calidad editorial y técnico.",
};

export const SUBSCRIPTION_VALUE: Record<Locale, string> = {
  en: "Your subscription keeps access to published terms, quizzes, saved progress (New / Learning / Mastered) and review for as long as it stays active. The trial starts when you activate it from Pricing or Sign up; a valid credit card is required.",
  es: "La suscripción mantiene el acceso a los términos publicados, los quizzes, el progreso guardado (Nuevo / En curso / Dominado) y el repaso mientras permanezca activa. La prueba empieza cuando la activas desde Precios o Registro; se requiere una tarjeta de crédito válida.",
};
