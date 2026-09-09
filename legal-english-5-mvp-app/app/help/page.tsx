"use client";

import Link from "next/link";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/i18n";

const SUPPORT_EMAIL = "support@legalenglish5.com";

type Copy = {
  eyebrow: string;
  title: string;
  lead: string;
  topics: { title: string; body: string; cta?: { label: string; href: string } }[];
  contactTitle: string;
  contactBody: string;
  contactCta: string;
  reply: string;
  signedInTitle: string;
  signedInBody: string;
  signedInCta: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    eyebrow: "Help & support",
    title: "Stuck signing in? Start here.",
    lead: "This page is public on purpose: you do not need an account to reach us. The most common sign-in, recovery and billing questions are answered below.",
    topics: [
      {
        title: "I forgot my password",
        body: "Open the sign-in page, choose “Forgot password?” and enter your email. We send a six-digit code; enter it with your new password. The code expires after a short time, so request a fresh one if it stops working.",
        cta: { label: "Reset your password", href: "/login" },
      },
      {
        title: "I never received the verification code",
        body: "Check spam and promotions folders first. Codes come from the Legal English 5 address; adding it to your contacts helps. If nothing arrives within a few minutes, sign in again and request a new code — only the most recent one is valid.",
      },
      {
        title: "My trial ended and I cannot open the lessons",
        body: "Term titles stay visible, but the definitions, examples, quizzes and audio need an active trial or subscription. Subscribe from the Billing page inside your account; access returns the moment the payment is confirmed.",
        cta: { label: "See plans", href: "/pricing" },
      },
      {
        title: "I want to cancel or change my plan",
        body: "Cancel any time from Account → Billing. You keep access until the end of the period you already paid for. To change plans, cancel the current one and subscribe to the other when it ends.",
      },
      {
        title: "I want a copy of my data, or to delete my account",
        body: "Both are self-service under Account → Preferences (download everything we store about you) and Account → Security (deactivate or delete). Deletion removes your profile, progress and photo permanently.",
      },
    ],
    contactTitle: "Still need a person?",
    contactBody: "Write to us with the email address on your account and, if you can, the page where the problem happened. We read every message.",
    contactCta: "Email support",
    reply: "We reply within one business day (Colombia time).",
    signedInTitle: "Already signed in?",
    signedInBody: "The in-app Help page lets you send a report attached to your account, so we can look straight at what happened.",
    signedInCta: "Open in-app Help",
  },
  es: {
    eyebrow: "Ayuda y soporte",
    title: "¿Problemas para entrar? Empieza aquí.",
    lead: "Esta página es pública a propósito: no necesitas una cuenta para contactarnos. Abajo están las dudas más comunes de acceso, recuperación y facturación.",
    topics: [
      {
        title: "Olvidé mi contraseña",
        body: "Abre la página de inicio de sesión, elige “¿Olvidaste tu contraseña?” y escribe tu correo. Enviamos un código de seis dígitos; ingrésalo junto con tu nueva contraseña. El código caduca pronto, así que pide uno nuevo si deja de funcionar.",
        cta: { label: "Restablecer contraseña", href: "/login" },
      },
      {
        title: "No recibí el código de verificación",
        body: "Revisa primero las carpetas de spam y promociones. Los códigos llegan desde la dirección de Legal English 5; agregarla a tus contactos ayuda. Si no llega nada en unos minutos, inicia sesión otra vez y pide un código nuevo: solo el más reciente es válido.",
      },
      {
        title: "Terminó mi prueba y no puedo abrir las lecciones",
        body: "Los títulos de los términos siguen visibles, pero las definiciones, ejemplos, quizzes y audio requieren una prueba o suscripción activa. Suscríbete desde Facturación dentro de tu cuenta; el acceso vuelve en cuanto se confirma el pago.",
        cta: { label: "Ver planes", href: "/pricing" },
      },
      {
        title: "Quiero cancelar o cambiar de plan",
        body: "Cancela cuando quieras desde Cuenta → Facturación. Conservas el acceso hasta el fin del periodo ya pagado. Para cambiar de plan, cancela el actual y suscríbete al otro cuando termine.",
      },
      {
        title: "Quiero una copia de mis datos o borrar mi cuenta",
        body: "Ambas opciones son autogestionadas en Cuenta → Preferencias (descargar todo lo que guardamos sobre ti) y Cuenta → Seguridad (desactivar o eliminar). La eliminación borra tu perfil, progreso y foto de forma permanente.",
      },
    ],
    contactTitle: "¿Aún necesitas hablar con alguien?",
    contactBody: "Escríbenos desde el correo de tu cuenta y, si puedes, indica la página donde ocurrió el problema. Leemos todos los mensajes.",
    contactCta: "Escribir a soporte",
    reply: "Respondemos en un día hábil (hora de Colombia).",
    signedInTitle: "¿Ya iniciaste sesión?",
    signedInBody: "La página de Ayuda dentro de la app permite enviar un reporte vinculado a tu cuenta, para revisar directamente lo que pasó.",
    signedInCta: "Abrir Ayuda en la app",
  },
};

export default function PublicHelpPage() {
  const { locale } = useLocale();
  const c = COPY[locale];
  return (
    <main id="main" className="landing home-reference">
      <LandingHeader />
      <section className="landing-section public-help">
        <div className="home-ref-heading">
          <span className="eyebrow">{c.eyebrow}</span>
          <h1>{c.title}</h1>
          <p>{c.lead}</p>
        </div>
        <div className="public-help-grid">
          {c.topics.map((topic) => (
            <article className="public-help-card" key={topic.title}>
              <h2>{topic.title}</h2>
              <p>{topic.body}</p>
              {topic.cta && (
                <Link className="ghost inline" href={topic.cta.href}>
                  {topic.cta.label}
                </Link>
              )}
            </article>
          ))}
        </div>
        <div className="public-help-contact">
          <div>
            <h2>{c.contactTitle}</h2>
            <p>{c.contactBody}</p>
            <a className="primary inline" href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Legal English 5 — support")}`}>
              {c.contactCta}
            </a>
            <p className="muted tiny">
              {SUPPORT_EMAIL} · {c.reply}
            </p>
          </div>
          <div>
            <h2>{c.signedInTitle}</h2>
            <p>{c.signedInBody}</p>
            <Link className="ghost inline" href="/account/help">
              {c.signedInCta}
            </Link>
          </div>
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}
