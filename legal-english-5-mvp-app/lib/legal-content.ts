import type { Locale } from "./i18n";

// Plain-language draft policies, not certified legal text. Both pages say
// so explicitly, matching the Propuesta's own commitment that "la revisión
// jurídica final del texto del aviso es suya" — the Owner's final legal
// review governs before this goes live for real users.

export type LegalSection = { title: string; body: string };

/** Bump whenever either policy text changes; shown as "Last updated" on both pages. */
export const LEGAL_UPDATED_AT = "2026-09-09";

export const COOKIE_SECTIONS: Record<Locale, LegalSection[]> = {
  en: [
    {
      title: "Essential cookies only",
      body: "Legal English 5 uses essential cookies to keep you signed in and to remember the language you chose (English or Spanish). We do not use advertising, analytics or social-media trackers.",
    },
    {
      title: "What we store",
      body: "A session cookie issued by the authentication provider (Supabase) so you stay signed in, and a first-party preference cookie (le5_locale) that stores EN or ES. Both stay on this site; they are not sold.",
    },
    {
      title: "How long they last",
      body: "The language cookie lasts up to one year or until you change language or clear cookies. The session cookie lasts for the signed-in session and is removed when you sign out.",
    },
    {
      title: "Your choice",
      body: "You can block cookies in your browser. If you do, sign-in and the language preference may not work. For personal data we process beyond cookies, see the Privacy Policy. Contact support@legalenglish5.com.",
    },
  ],
  es: [
    {
      title: "Solo cookies esenciales",
      body: "Legal English 5 usa cookies esenciales para mantenerte conectado y recordar el idioma que elegiste (inglés o español). No usamos rastreadores de publicidad, analítica ni redes sociales.",
    },
    {
      title: "Qué guardamos",
      body: "Una cookie de sesión del proveedor de autenticación (Supabase) para que sigas conectado, y una cookie propia (le5_locale) que guarda EN o ES. Ambas permanecen en este sitio; no se venden.",
    },
    {
      title: "Cuánto duran",
      body: "La cookie de idioma dura hasta un año o hasta que cambies el idioma o borres las cookies. La cookie de sesión dura mientras estés conectado y se elimina al cerrar sesión.",
    },
    {
      title: "Tu elección",
      body: "Puedes bloquear las cookies en el navegador. Si lo haces, el inicio de sesión y la preferencia de idioma pueden dejar de funcionar. Para los datos personales más allá de las cookies, consulta la Política de privacidad. Contacto: support@legalenglish5.com.",
    },
  ],
};

export const PRIVACY_SECTIONS: Record<Locale, LegalSection[]> = {
  en: [
    {
      title: "What we collect",
      body: "Your name, email address, password (stored hashed, never in plain text), and your learning activity: which terms you've opened, quiz results, and progress state. We also keep subscription status — trial dates, plan, and payment state from Mercado Pago — but never your card number, which Mercado Pago handles directly and never shares with us.",
    },
    {
      title: "Why we collect it",
      body: "To run the service: authenticate you, keep your progress separate from every other Learner's, know when your trial or subscription grants access, and let the Owner operate the content and account side of the product.",
    },
    {
      title: "Legal basis",
      body: "Under Colombia's Ley 1581 de 2012 and Decreto 1377 de 2013, we process your data based on the consent you give at registration. You can withdraw that consent at any time by deleting your account.",
    },
    {
      title: "Where it lives",
      body: "We do not sell your personal data. We only share it with the providers needed to operate the service and process payments: Supabase (database, authentication and file storage) and Mercado Pago (payments). Your data is stored in a managed Postgres database (Supabase), access-controlled so that only your own account can read or write your own progress — enforced by the database itself, not just by the app's interface.",
    },
    {
      title: "Your rights",
      body: "You can access, correct or update your profile from Settings at any time. You can export your data or delete your account entirely — both remove your personal data (habeas data); shared content and other Learners' records are unaffected. If you'd rather not do this yourself, ask the Owner directly and she'll action it.",
    },
    {
      title: "How long we keep it",
      body: "For as long as your account exists. Deleting your account removes your profile and progress immediately; anything already backed up rolls off the standard backup retention window afterward.",
    },
  ],
  es: [
    {
      title: "Qué recolectamos",
      body: "Tu nombre, correo electrónico, contraseña (guardada cifrada, nunca en texto plano) y tu actividad de aprendizaje: qué términos abriste, resultados de quiz y tu estado de progreso. También guardamos el estado de tu suscripción — fechas de prueba, plan y estado de pago según Mercado Pago — pero nunca tu número de tarjeta, que Mercado Pago procesa directamente y nunca nos comparte.",
    },
    {
      title: "Para qué lo usamos",
      body: "Para operar el servicio: autenticarte, mantener tu progreso separado del de cualquier otro alumno, saber cuándo tu prueba o suscripción te da acceso, y permitir que la propietaria administre el contenido y las cuentas del producto.",
    },
    {
      title: "Base legal",
      body: "Conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia, tratamos tus datos con base en el consentimiento que das al registrarte. Puedes revocar ese consentimiento en cualquier momento eliminando tu cuenta.",
    },
    {
      title: "Dónde vive",
      body: "No vendemos tus datos personales. Solo los compartimos con los proveedores necesarios para operar el servicio y procesar pagos: Supabase (base de datos, autenticación y archivos) y Mercado Pago (pagos). Tus datos se guardan en una base de datos Postgres administrada (Supabase), con control de acceso para que solo tu propia cuenta pueda leer o escribir tu propio progreso — aplicado por la base de datos misma, no solo por la interfaz de la aplicación.",
    },
    {
      title: "Tus derechos",
      body: "Puedes acceder, corregir o actualizar tu perfil desde Configuración en cualquier momento. Puedes exportar tus datos o eliminar tu cuenta por completo — ambas acciones borran tus datos personales (habeas data); el contenido compartido y los registros de otros alumnos no se ven afectados. Si prefieres no hacerlo tú mismo, pídeselo directamente a la propietaria y ella lo gestiona.",
    },
    {
      title: "Cuánto tiempo lo conservamos",
      body: "Mientras tu cuenta exista. Eliminar tu cuenta borra tu perfil y progreso de inmediato; lo que ya estaba en un respaldo sale de circulación al vencer la ventana estándar de retención del respaldo.",
    },
  ],
};

export const TERMS_SECTIONS: Record<Locale, LegalSection[]> = {
  en: [
    {
      title: "The service",
      body: "Legal English 5 is a legal-English vocabulary platform: definitions, Spanish equivalents, usage examples, audio pronunciation and quizzes, drawn from the Master Content Database and organized by Contracts, Corporate Law and Employment Law.",
    },
    {
      title: "Your account",
      body: "One account per person, with accurate registration details. You're responsible for your password and for activity under your account. 7-day free trial: a valid credit card is required when you activate the trial from Pricing or Sign up. Unless you cancel before the trial ends, your subscription will automatically continue on the COP $90,000 monthly plan. The trial dates do not restart on refresh or re-login.",
    },
    {
      title: "Subscription and billing",
      body: "After the trial, continued access to protected content requires an active monthly (COP $90,000) or annual (COP $540,000) subscription through Mercado Pago. After you activate the trial, select annual billing from your account before the trial ends to avoid the monthly charge. Cancelling keeps your access open until the end of the period you already paid for, then it stops. A failed charge does not immediately cut off access already granted — Mercado Pago's own retry policy applies first.",
    },
    {
      title: "Content ownership",
      body: "The editorial content — terms, definitions, examples, quizzes — belongs to the Owner and is licensed to you personally, non-transferably, for the duration of your active access. It is not licensed for redistribution, resale, or bulk export outside your own learning use.",
    },
    {
      title: "Acceptable use",
      body: "No scraping, automated bulk downloading, or sharing your account credentials. Report content or security issues through Account → Help rather than working around them.",
    },
    {
      title: "Termination",
      body: "You can delete your account at any time from Settings. The Owner can suspend an account for a breach of these terms, in which case a prorated refund of unused subscription time may apply at her discretion.",
    },
    {
      title: "Not legal advice",
      body: "Legal English 5 is a language-learning tool. Nothing in it is legal advice, and it should not be relied on as a substitute for qualified counsel.",
    },
    {
      title: "Governing law",
      body: "These terms are governed by the laws of Colombia.",
    },
  ],
  es: [
    {
      title: "El servicio",
      body: "Legal English 5 es una plataforma de vocabulario jurídico en inglés: definiciones, equivalentes en español, ejemplos de uso, pronunciación en audio y quizzes, tomados de la Master Content Database y organizados en Contracts, Corporate Law y Employment Law.",
    },
    {
      title: "Tu cuenta",
      body: "Una cuenta por persona, con datos de registro correctos. Eres responsable de tu contraseña y de la actividad bajo tu cuenta. Prueba gratis durante 7 días: se requiere una tarjeta de crédito válida al activar la prueba desde Precios o Registro. Si no cancelas antes de que finalice, la suscripción continuará automáticamente en el plan mensual de COP $90.000. Las fechas de la prueba no se reinician al recargar ni al volver a entrar.",
    },
    {
      title: "Suscripción y cobro",
      body: "Después de la prueba, el acceso continuo al contenido protegido requiere una suscripción mensual (COP $90.000) o anual (COP $540.000) activa con Mercado Pago. Después de activar la prueba, selecciona el plan anual desde tu cuenta antes de que finalice para evitar el cobro mensual. Cancelar mantiene tu acceso abierto hasta el fin del periodo que ya pagaste; después se detiene. Un cobro fallido no corta de inmediato un acceso ya otorgado — primero aplica la política de reintentos propia de Mercado Pago.",
    },
    {
      title: "Propiedad del contenido",
      body: "El contenido editorial — términos, definiciones, ejemplos, quizzes — pertenece a la propietaria y se te licencia de forma personal e intransferible mientras tengas acceso activo. No se licencia para redistribución, reventa ni exportación masiva fuera de tu propio uso de aprendizaje.",
    },
    {
      title: "Uso aceptable",
      body: "No se permite scraping, descarga masiva automatizada, ni compartir tus credenciales de cuenta. Reporta problemas de contenido o seguridad desde Cuenta → Ayuda en lugar de evadirlos.",
    },
    {
      title: "Terminación",
      body: "Puedes eliminar tu cuenta en cualquier momento desde Configuración. La propietaria puede suspender una cuenta por incumplir estos términos; en ese caso, un reembolso proporcional del tiempo de suscripción no usado puede aplicar a su discreción.",
    },
    {
      title: "No es asesoría legal",
      body: "Legal English 5 es una herramienta de aprendizaje de idioma. Nada en ella constituye asesoría legal ni debe usarse como sustituto de un abogado calificado.",
    },
    {
      title: "Ley aplicable",
      body: "Estos términos se rigen por las leyes de Colombia.",
    },
  ],
};
