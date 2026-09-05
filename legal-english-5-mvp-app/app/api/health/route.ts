import { NextResponse } from "next/server";
import { DATA_MODE, store } from "@/lib/data-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type State = "operational" | "degraded" | "down" | "sandbox";
type Check = { id: string; state: State; latencyMs?: number; note?: string };

/**
 * Public, unauthenticated health check. Used by the /status page and suitable
 * for an uptime monitor on the VPS. Never returns secrets: only which
 * components answered and how the deployment is configured.
 */
export async function GET() {
  const started = Date.now();
  const checks: Check[] = [];

  // Application process
  checks.push({ id: "app", state: "operational" });

  // Data store: alpha JSON file or Supabase Postgres, whichever is configured.
  const dbStart = Date.now();
  try {
    const data = (await store.bootstrap(null)) as { terms?: unknown[] } | null;
    const ok = Array.isArray(data?.terms);
    checks.push({ id: "database", state: ok ? "operational" : "degraded", latencyMs: Date.now() - dbStart, note: DATA_MODE === "production" ? "Supabase Postgres" : "Alpha store" });
  } catch {
    checks.push({ id: "database", state: "down", latencyMs: Date.now() - dbStart });
  }

  // Authentication
  checks.push({ id: "auth", state: "operational", note: DATA_MODE === "production" ? "Supabase Auth" : "Alpha sessions" });

  // Email delivery (Supabase Auth SMTP via Resend in production; in-app inbox in alpha)
  checks.push({ id: "email", state: DATA_MODE === "production" ? "operational" : "sandbox", note: DATA_MODE === "production" ? "Resend via Supabase Auth" : "Alpha inbox" });

  // Payments
  const provider = process.env.PAYMENT_PROVIDER === "mercadopago" ? "mercadopago" : "simulator";
  const mpConfigured = Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN && process.env.MERCADOPAGO_WEBHOOK_SECRET);
  checks.push({
    id: "billing",
    state: provider === "mercadopago" ? (mpConfigured ? "operational" : "degraded") : "sandbox",
    note: provider === "mercadopago" ? "Mercado Pago Suscripciones" : "Billing simulator",
  });

  // Audio / media
  checks.push({ id: "media", state: "operational", note: DATA_MODE === "production" ? "Supabase Storage" : "Local files" });

  const worst: State = checks.some((c) => c.state === "down") ? "down" : checks.some((c) => c.state === "degraded") ? "degraded" : "operational";

  return NextResponse.json(
    {
      ok: worst !== "down",
      status: worst,
      mode: DATA_MODE,
      version: process.env.NEXT_PUBLIC_APP_VERSION || process.env.npm_package_version || "dev",
      time: new Date().toISOString(),
      durationMs: Date.now() - started,
      checks,
    },
    { status: worst === "down" ? 503 : 200, headers: { "cache-control": "no-store" } },
  );
}
