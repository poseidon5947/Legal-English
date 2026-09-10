"use client";

import Link from "next/link";
import { Icon, IconName } from "@/components/ui-icons";
import { useLocale } from "@/components/locale-provider";
import { DEMO_ACCOUNTS } from "@/lib/types";
import { IMAGES } from "@/lib/media";
import type { Locale } from "@/lib/i18n";

type Step = { title: string; body: string; icon: IconName };

// Reviewer walkthrough for the Owner (Hito A/B acceptance). Kept in both
// languages so the client can read it in Spanish; every step maps to a
// criterion in the Solicitud de Cotización.
const COPY: Record<Locale, { back: string; eyebrow: string; title: string; lead: string; start: string; steps: Step[] }> = {
  en: {
    back: "Legal English 5",
    eyebrow: "FOR PILAR · ALPHA REVIEW",
    title: "What to test in twelve minutes",
    lead: "This is not a visual demo. Each step maps to a criterion in your Solicitud de Cotización.",
    start: "Start with Pilar",
    steps: [
      { title: "Open Pilar first", body: "Log in as Owner. Admin shows all 30 LC-001 terms from MCD v1.3.81: 10 Corporate Law, 10 Contracts, 10 Employment Law. Every row is Approved, has a quiz and the AudioUS you produced (AudioUK on EMP-009). Terms start unpublished: Approved is not Published.", icon: "settings" },
      { title: "Publish a term, then open Maria", body: "Publish CON-001 from Admin, log in as Maria and confirm it is the only term she sees. Learners only see Published terms; the library stays empty until you publish. Maria already has progress on CORP-005 and CON-001 for isolation tests.", icon: "clipboard" },
      { title: "Switch to Andres", body: "Log out and enter as the second Learner. Same published library, different stored progress (EMP-001, CON-010). Progress never crosses accounts.", icon: "user" },
      { title: "Create a new account", body: "Sign up with your own email. Check your email for a 6-digit code or a confirmation link. The seven-day trial is persisted on the server.", icon: "shield" },
      { title: "Expire the trial, then refresh", body: "On Access, fire the expired-trial event. Protected terms lock. Refresh the browser. They stay locked. That is the difference between a label and entitlement.", icon: "card" },
      { title: "Reimport v1.3.81", body: "In Admin → Excel import, upload the same MCD. Preflight must show 30 terms, 10/10/10, 18 four-option and 12 three-option quizzes, and zero duplicates on the second pass. A missing row is reported, not deleted.", icon: "award" },
    ],
  },
  es: {
    back: "Legal English 5",
    eyebrow: "PARA PILAR · REVISIÓN ALPHA",
    title: "Qué probar en doce minutos",
    lead: "No es una demo visual. Cada paso corresponde a un criterio de tu Solicitud de Cotización.",
    start: "Empezar con Pilar",
    steps: [
      { title: "Entra primero como Pilar", body: "Inicia sesión como Owner. Admin muestra los 30 términos LC-001 del MCD v1.3.81: 10 Corporate Law, 10 Contracts, 10 Employment Law. Cada fila está Approved, tiene quiz y el AudioUS que produjiste (AudioUK en EMP-009). Los términos empiezan sin publicar: Approved no es Published.", icon: "settings" },
      { title: "Publica un término y entra como Maria", body: "Publica CON-001 desde Admin, entra como Maria y confirma que es el único término que ve. Los Learners solo ven términos Published; la biblioteca queda vacía hasta que publiques. Maria ya tiene progreso en CORP-005 y CON-001 para las pruebas de aislamiento.", icon: "clipboard" },
      { title: "Cambia a Andres", body: "Cierra sesión y entra como el segundo Learner. Misma biblioteca publicada, progreso distinto (EMP-001, CON-010). El progreso nunca se cruza entre cuentas.", icon: "user" },
      { title: "Crea una cuenta nueva", body: "Regístrate con tu propio correo. Revisa el correo: trae un código de 6 dígitos o un enlace de confirmación. La prueba de siete días queda persistida en el servidor.", icon: "shield" },
      { title: "Vence la prueba y recarga", body: "En Acceso, dispara el evento de prueba vencida. Los términos protegidos se bloquean. Recarga el navegador: siguen bloqueados. Esa es la diferencia entre una etiqueta y un derecho de acceso.", icon: "card" },
      { title: "Reimporta v1.3.81", body: "En Admin → Importar Excel, sube el mismo MCD. La verificación previa debe mostrar 30 términos, 10/10/10, 18 quizzes de cuatro opciones y 12 de tres, y cero duplicados en la segunda pasada. Una fila faltante se reporta, no se borra.", icon: "award" },
    ],
  },
};

const portraits = [IMAGES.reviewOwner, IMAGES.reviewMaria, IMAGES.reviewAndres];

export default function ReviewPage() {
  const { locale } = useLocale();
  const copy = COPY[locale];
  return (
    <main id="main" className="review">
      <Link className="back-link" href="/">
        ← {copy.back}
      </Link>
      <header className="page-heading">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.lead}</p>
        </div>
        <Link className="primary" href="/login">
          {copy.start}
        </Link>
      </header>
      <div className="account-grid">
        {DEMO_ACCOUNTS.map((account, index) => (
          <article className="media-card" key={account.email}>
            <div className="card-media">
              <img src={portraits[index]} alt="" loading="lazy" decoding="async" />
            </div>
            <span>{account.role}</span>
            <strong>{account.email}</strong>
            <code>{account.password}</code>
          </article>
        ))}
      </div>
      <ol className="walkthrough">
        {copy.steps.map((step, index) => (
          <li key={step.title}>
            <div className="walkthrough-icon">
              <Icon name={step.icon} />
            </div>
            <div>
              <b>0{index + 1}</b>
              <h2>{step.title}</h2>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
