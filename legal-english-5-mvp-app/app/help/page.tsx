"use client";

import Link from "next/link";
import { useState } from "react";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/i18n";

const SUPPORT_EMAIL = "support@legalenglish.com";

type Copy = {
  eyebrow: string;
  title: string;
  lead: string;
  topics: { id?: string; title: string; body: string; cta?: { label: string; href: string } }[];
  contactTitle: string;
  contactBody: string;
  contactCta: string;
  reply: string;
  copy: string;
  mailSubject: string;
  mailHint: string;
  copied: string;
  copyFailed: string;
  signedInTitle: string;
  signedInBody: string;
  signedInCta: string;
};

/* Approved copy "Ayuda" (Textos Web, Part III / IMP-15), verbatim in both languages. */
const COPY: Record<Locale, Copy> = {
  en: {
    eyebrow: "HELP AND SUPPORT",
    title: "Help with access, billing or your account",
    lead: "You do not need to sign in to contact us. Start with the answers below or email support@legalenglish.com.",
    topics: [
      {
        title: "I forgot my password",
        body: "Open Sign In, select Forgot password?, and enter your email address. Enter the six-digit code with your new password. If the code expires, request a new one.",
        cta: { label: "Reset your password", href: "/login" },
      },
      {
        title: "I did not receive the verification code",
        body: "Check your spam and promotions folders. If the code does not arrive within a few minutes, request a new one. Only the most recent code is valid.",
      },
      {
        id: "billing",
        title: "My trial ended and I cannot open the lessons",
        body: "Protected lesson content requires an active trial or subscription. Open Billing in your account to select a plan. Access returns after payment is confirmed.",
        cta: { label: "See plans", href: "/pricing" },
      },
      {
        title: "I want to cancel or change my plan",
        body: "Open Account, then Billing. You keep access until the end of the paid period after cancellation. Follow the instructions in Billing to choose another available plan.",
      },
      {
        title: "I want a copy of my data or want to delete my account",
        body: "Use Account Preferences to request a copy of available account data. Use Account Security to deactivate or delete the account. Account deletion is separate from subscription cancellation and may permanently remove your profile and learning progress.",
      },
    ],
    contactTitle: "Still need help?",
    contactBody: "Email us and identify the page where the problem occurred. If you have an account, please use the email address associated with it.",
    contactCta: "Email support",
    reply: "We typically reply within one business day, Colombia time.",
    copy: "Copy address",
    mailSubject: "Legal English 5 — support request",
    mailHint: "If your email app did not open, write to the address below or use Copy address and paste it into your email.",
    copied: "Address copied",
    copyFailed: "Select the address below and copy it",
    signedInTitle: "Already signed in?",
    signedInBody: "The Help page inside your account lets you send a report linked to your account.",
    signedInCta: "Open Help in your account",
  },
  es: {
    eyebrow: "AYUDA Y SOPORTE",
    title: "Ayuda con el acceso, la facturación o tu cuenta",
    lead: "No necesitas iniciar sesión para contactarnos. Consulta las respuestas siguientes o escribe a support@legalenglish.com.",
    topics: [
      {
        title: "Olvidé mi contraseña",
        body: "Abre Iniciar sesión, selecciona ¿Olvidaste tu contraseña? y escribe tu correo. Ingresa el código de seis dígitos junto con tu nueva contraseña. Si el código caduca, solicita uno nuevo.",
        cta: { label: "Restablecer contraseña", href: "/login" },
      },
      {
        title: "No recibí el código de verificación",
        body: "Revisa las carpetas de spam y promociones. Si no llega en unos minutos, solicita un código nuevo. Solo el código más reciente es válido.",
      },
      {
        id: "billing",
        title: "Terminó mi prueba y no puedo abrir las lecciones",
        body: "El contenido protegido requiere una prueba o suscripción activa. Abre Facturación en tu cuenta para elegir un plan. El acceso regresa después de confirmarse el pago.",
        cta: { label: "Ver planes", href: "/pricing" },
      },
      {
        title: "Quiero cancelar o cambiar mi plan",
        body: "Abre Cuenta y luego Facturación. Después de cancelar, conservas el acceso hasta el final del periodo pagado. Sigue las instrucciones de Facturación para elegir otro plan disponible.",
      },
      {
        title: "Quiero una copia de mis datos o eliminar mi cuenta",
        body: "Utiliza Preferencias de la cuenta para solicitar una copia de los datos disponibles. Utiliza Seguridad de la cuenta para desactivar o eliminar la cuenta. La eliminación de la cuenta es distinta de la cancelación de la suscripción y puede borrar permanentemente tu perfil y progreso.",
      },
    ],
    contactTitle: "¿Aún necesitas ayuda?",
    contactBody: "Escríbenos e indica la página donde ocurrió el problema. Si tienes una cuenta, usa el correo asociado a ella.",
    contactCta: "Escribir a soporte",
    reply: "Normalmente respondemos en un día hábil, hora de Colombia.",
    copy: "Copiar dirección",
    mailSubject: "Legal English 5 — solicitud de soporte",
    mailHint: "Si tu aplicación de correo no se abrió, escribe a la dirección de abajo o usa Copiar dirección y pégala en tu correo.",
    copied: "Dirección copiada",
    copyFailed: "Selecciona la dirección de abajo y cópiala",
    signedInTitle: "¿Ya iniciaste sesión?",
    signedInBody: "La página de Ayuda dentro de tu cuenta permite enviar un reporte vinculado a tu cuenta.",
    signedInCta: "Abrir Ayuda en tu cuenta",
  },
};

export default function PublicHelpPage() {
  const { locale } = useLocale();
  const c = COPY[locale];
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const [mailHint, setMailHint] = useState(false);
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
            <article className="public-help-card" key={topic.title} id={topic.id}>
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
        <div className="public-help-contact" id="contact">
          <div>
            <h2>{c.contactTitle}</h2>
            <p>{c.contactBody}</p>
            {/* D15: the button and the visible address both open a new email to support; the
                address stays visible (and copyable) when no mail application is configured. */}
            <div className="public-help-actions">
              <a
                className="primary inline"
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(c.mailSubject)}`}
                onClick={() => {
                  // A mailto link is silent when the device has no mail application
                  // configured. If the page is still in the foreground two seconds
                  // later, show the address and the copy action as the way forward.
                  setMailHint(false);
                  const started = Date.now();
                  window.setTimeout(() => {
                    if (document.visibilityState === "visible" && Date.now() - started < 4000) setMailHint(true);
                  }, 2000);
                }}
              >
                {c.contactCta}
              </a>
              <button
                type="button"
                className="ghost inline"
                onClick={() => {
                  const reset = () => window.setTimeout(() => setCopied("idle"), 2400);
                  const fallback = () => {
                    // No clipboard permission / insecure context: select the visible address so the
                    // learner can copy it manually, and say so instead of failing silently.
                    const node = document.querySelector<HTMLElement>(".public-help-address a");
                    const selection = window.getSelection();
                    if (node && selection) {
                      const range = document.createRange();
                      range.selectNodeContents(node);
                      selection.removeAllRanges();
                      selection.addRange(range);
                    }
                    setCopied("failed");
                    reset();
                  };
                  if (!navigator.clipboard?.writeText) return fallback();
                  navigator.clipboard.writeText(SUPPORT_EMAIL).then(() => {
                    setCopied("done");
                    reset();
                  }, fallback);
                }}
                aria-live="polite"
              >
                {copied === "done" ? c.copied : copied === "failed" ? c.copyFailed : c.copy}
              </button>
            </div>
            {mailHint && (
              <p className="public-help-mail-hint" role="status">
                {c.mailHint}
              </p>
            )}
            <p className="muted tiny public-help-address">
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> · {c.reply}
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
