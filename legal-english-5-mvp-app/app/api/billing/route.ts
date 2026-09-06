import { json, requireUser } from "@/lib/api";
import { DATA_MODE, store } from "@/lib/data-store";

export const runtime = "nodejs";

/**
 * Learner-facing billing actions.
 *  - checkout  { plan }  → start a purchase (alpha: sandbox approves; production: Mercado Pago hosted checkout URL)
 *  - cancel              → cancel at the provider; access continues until the paid period ends
 *  - (alpha only) event simulator: { event, plan } drives the same state machine the webhook uses
 */
export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return json({ ok: false, message: "Sign in required." }, 401);
  const body = await request.json().catch(() => ({}));
  const action = String(body.action || "");
  if (action === "checkout") {
    const plan = body.plan === "annual" ? "annual" : body.plan === "monthly" ? "monthly" : null;
    if (!plan) return json({ ok: false, message: "Choose a monthly or annual plan." }, 400);
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const result = await store.startCheckout(user.id, plan, origin.replace(/\/$/, ""));
    return json(result, result.ok ? 200 : 400);
  }
  if (action === "cancel") {
    const result = await store.cancelSubscription(user.id);
    return json(result, result.ok ? 200 : 400);
  }
  // Sandbox simulator: only meaningful (and only allowed) in alpha mode.
  if (DATA_MODE !== "alpha") return json({ ok: false, message: "Billing state changes come from Mercado Pago, not from this screen." }, 403);
  return json(await store.applyBilling(user.id, body.event, body.plan));
}
