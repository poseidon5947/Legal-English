"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";

type State = "operational" | "degraded" | "down" | "sandbox";
type Health = {
  ok: boolean;
  status: State;
  mode: "alpha" | "production";
  version: string;
  time: string;
  durationMs: number;
  checks: Array<{ id: string; state: State; latencyMs?: number; note?: string }>;
};

const copy = {
  en: {
    eyebrow: "System status",
    title: "Is Legal English 5 up?",
    lead: "Live checks against the services behind the product. This page refreshes itself every minute.",
    overall: {
      operational: "All systems operational",
      degraded: "Partial degradation",
      down: "Service disruption",
      sandbox: "All systems operational",
      loading: "Checking…",
      unreachable: "The status API is not responding",
    },
    state: { operational: "Operational", degraded: "Degraded", down: "Down", sandbox: "Sandbox" },
    components: {
      app: ["Web application", "Pages, sign-in screens and the learner workspace."],
      database: ["Database", "Terms, quizzes and your progress."],
      auth: ["Sign-in", "Sessions, email verification and password recovery."],
      email: ["Email delivery", "Verification codes and recovery messages."],
      billing: ["Billing", "Trials, subscriptions and payment webhooks."],
      media: ["Audio & media", "Pronunciation files for each term."],
    } as Record<string, [string, string]>,
    checked: "Last checked",
    latency: "response",
    mode: { alpha: "Alpha environment: external services run in sandbox mode.", production: "Production environment." },
    refresh: "Refresh now",
    report: "Report a problem",
    api: "Raw JSON for monitors",
  },
  es: {
    eyebrow: "Estado del sistema",
    title: "¿Legal English 5 está en línea?",
    lead: "Verificaciones en vivo de los servicios detrás del producto. Esta página se actualiza cada minuto.",
    overall: {
      operational: "Todos los sistemas operativos",
      degraded: "Degradación parcial",
      down: "Interrupción del servicio",
      sandbox: "Todos los sistemas operativos",
      loading: "Verificando…",
      unreachable: "La API de estado no responde",
    },
    state: { operational: "Operativo", degraded: "Degradado", down: "Caído", sandbox: "Sandbox" },
    components: {
      app: ["Aplicación web", "Páginas, pantallas de acceso y el espacio del estudiante."],
      database: ["Base de datos", "Términos, quizzes y tu progreso."],
      auth: ["Inicio de sesión", "Sesiones, verificación de correo y recuperación de contraseña."],
      email: ["Envío de correos", "Códigos de verificación y mensajes de recuperación."],
      billing: ["Facturación", "Pruebas, suscripciones y webhooks de pago."],
      media: ["Audio y medios", "Archivos de pronunciación de cada término."],
    } as Record<string, [string, string]>,
    checked: "Última verificación",
    latency: "respuesta",
    mode: { alpha: "Entorno alfa: los servicios externos funcionan en modo sandbox.", production: "Entorno de producción." },
    refresh: "Actualizar ahora",
    report: "Reportar un problema",
    api: "JSON para monitores",
  },
} as const;

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

  return (
    <main className="landing home-reference">
      <LandingHeader />
      <section className="landing-section status-page">
        <div className="landing-section-heading">
          <span className="eyebrow">{c.eyebrow}</span>
          <h2>{c.title}</h2>
          <p>{c.lead}</p>
        </div>

        <div className={`status-banner ${tone}`} role="status" aria-live="polite">
          <i aria-hidden="true" />
          <div>
            <strong>{c.overall[overall]}</strong>
            {health && (
              <small>
                {c.checked}: {new Date(health.time).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })} · {health.durationMs} ms · v{health.version}
              </small>
            )}
          </div>
          <button type="button" className="ghost" onClick={() => void load()} disabled={busy}>
            {c.refresh}
          </button>
        </div>

        <ul className="status-list">
          {(health?.checks ?? Object.keys(c.components).map((id): Health["checks"][number] => ({ id, state: "operational" }))).map((check) => {
            const [name, detail] = c.components[check.id] ?? [check.id, ""];
            const stateTone = check.state === "operational" ? "ok" : check.state === "sandbox" ? "sandbox" : check.state === "degraded" ? "warn" : "bad";
            return (
              <li key={check.id} className={health ? "" : "pending"}>
                <div>
                  <strong>{name}</strong>
                  <p>{detail}</p>
                  {check.note && <small>{check.note}</small>}
                </div>
                <span className={`status-pill ${health ? stateTone : "idle"}`}>
                  <i aria-hidden="true" />
                  {health ? c.state[check.state] : "…"}
                  {health && typeof check.latencyMs === "number" && <em>{check.latencyMs} ms</em>}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="status-mode">{health ? c.mode[health.mode] : ""}</p>
        <div className="status-actions">
          <Link className="primary inline" href="/account/help">
            {c.report}
          </Link>
          <a href="/api/health" target="_blank" rel="noreferrer">
            {c.api} ↗
          </a>
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}
