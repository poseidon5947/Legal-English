"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";

/**
 * Public status page — approved copy "Estado del Sistema" (Textos Web, Part
 * III / IMP-16). Learner-relevant service labels only: no provider names,
 * environment labels, version strings, response times or raw JSON links.
 * /api/health still exposes the detailed payload for monitors.
 */

type State = "operational" | "degraded" | "down" | "sandbox";
type Health = {
  ok: boolean;
  status: State;
  time: string;
  checks: Array<{ id: string; state: State }>;
};

const copy = {
  en: {
    eyebrow: "SYSTEM STATUS",
    title: "Legal English 5 service status",
    lead: "Current availability of the services used by the website and learner workspace. This page refreshes every minute.",
    overall: {
      operational: "All systems operational",
      degraded: "Some systems affected",
      down: "Service interruption",
      sandbox: "All systems operational",
      loading: "Checking…",
      unreachable: "Status information is temporarily unavailable",
    },
    state: { operational: "Operational", degraded: "Affected", down: "Interrupted", sandbox: "Operational" },
    components: {
      app: ["Website", "Public pages and learner workspace"],
      database: ["Content and progress", "Terms, quizzes and saved progress"],
      auth: ["Account access", "Sign-in, email verification and password recovery"],
      email: ["Email service", "Verification and recovery messages"],
      billing: ["Billing", "Trials, subscriptions and payments"],
      media: ["Audio", "Pronunciation files"],
    } as Record<string, [string, string]>,
    checked: "Last checked",
    refresh: "Refresh now",
    report: "Report a problem",
  },
  es: {
    eyebrow: "ESTADO DEL SISTEMA",
    title: "Estado del servicio de Legal English 5",
    lead: "Disponibilidad actual de los servicios utilizados por el sitio web y el espacio del estudiante. Esta página se actualiza cada minuto.",
    overall: {
      operational: "Todos los sistemas operativos",
      degraded: "Algunos sistemas afectados",
      down: "Interrupción del servicio",
      sandbox: "Todos los sistemas operativos",
      loading: "Verificando…",
      unreachable: "La información de estado no está disponible temporalmente",
    },
    state: { operational: "Operativo", degraded: "Afectado", down: "Interrumpido", sandbox: "Operativo" },
    components: {
      app: ["Sitio web", "Páginas públicas y espacio del estudiante"],
      database: ["Contenido y progreso", "Términos, quizzes y progreso guardado"],
      auth: ["Acceso a la cuenta", "Inicio de sesión, verificación de correo y recuperación de contraseña"],
      email: ["Servicio de correo", "Mensajes de verificación y recuperación"],
      billing: ["Facturación", "Pruebas, suscripciones y pagos"],
      media: ["Audio", "Archivos de pronunciación"],
    } as Record<string, [string, string]>,
    checked: "Última verificación",
    refresh: "Actualizar ahora",
    report: "Reportar un problema",
  },
} as const;

const ORDER = ["app", "database", "auth", "email", "billing", "media"];

export default function StatusPage() {
  const { locale } = useLocale();
  const c = copy[locale];
  const [health, setHealth] = useState<Health | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      setHealth((await response.json()) as Health);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const overall: State | "loading" | "unreachable" = failed ? "unreachable" : health ? health.status : "loading";
  const tone = overall === "operational" || overall === "sandbox" ? "ok" : overall === "degraded" ? "warn" : overall === "loading" ? "idle" : "bad";
  const checks = ORDER.map((id) => health?.checks.find((check) => check.id === id) ?? { id, state: "operational" as State });

  return (
    <main id="main" className="landing home-reference" lang={locale}>
      <LandingHeader />
      <section className="landing-section status-page">
        <div className="landing-section-heading">
          <span className="eyebrow">{c.eyebrow}</span>
          <h1>{c.title}</h1>
          <p>{c.lead}</p>
        </div>

        <div className={`status-banner ${tone}`} role="status" aria-live="polite">
          <i aria-hidden="true" />
          <div>
            <strong>{c.overall[overall]}</strong>
            {health && (
              <small>
                {c.checked}: {new Date(health.time).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}
              </small>
            )}
          </div>
          <button type="button" className="ghost" onClick={() => void load()} disabled={busy}>
            {c.refresh}
          </button>
        </div>

        <ul className="status-list">
          {checks.map((check) => {
            const [name, detail] = c.components[check.id] ?? [check.id, ""];
            const stateTone = check.state === "operational" || check.state === "sandbox" ? "ok" : check.state === "degraded" ? "warn" : "bad";
            return (
              <li key={check.id} className={health ? "" : "pending"}>
                <div>
                  <strong>{name}</strong>
                  <p>{detail}</p>
                </div>
                <span className={`status-pill ${health ? stateTone : "idle"}`}>
                  <i aria-hidden="true" />
                  {health ? c.state[check.state] : "…"}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="status-actions">
          <Link className="primary inline" href="/help">
            {c.report}
          </Link>
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}
