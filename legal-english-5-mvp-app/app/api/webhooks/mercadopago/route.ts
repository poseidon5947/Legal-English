import { NextResponse } from "next/server";
import { applyBillingEvent } from "@/lib/billing-state";
import {
  fetchResource,
  mapAuthorizedPayment,
  mapPreapproval,
  planFromPreapproval,
  verifySignature,
  type AuthorizedPayment,
  type Preapproval,
} from "@/lib/mercadopago";
import { rowToSubscription, subscriptionToRow } from "@/lib/store.supabase";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Mercado Pago → entitlement. This is the only writer of public.subscriptions
// besides the Owner's exceptional-access grant; it runs with the service role
// after the signature check, never from a learner session.
//
// Order of operations, on purpose:
//   1. verify signature (401 on failure; MP does not retry 4xx)
//   2. record the notification id in the ledger (duplicate → 200, skip)
//   3. fetch the resource from MP — the body is a pointer, not the truth
//   4. reduce with applyBillingEvent (stale / duplicate payment → ignored)
//   5. persist, answer 200 within MP's 22-second window
//
// A single rejected charge maps to past_due (access kept, grace window);
// payment_failed only follows MP's own "paused"/"cancelled" invoice states,
// i.e. after its retry cycle — never from one isolated webhook.

const SUPPORTED_TOPICS = new Set(["subscription_preapproval", "subscription_authorized_payment"]);

function reply(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  if (process.env.PAYMENT_PROVIDER !== "mercadopago") {
    return reply(404, { ok: false, message: "PAYMENT_PROVIDER is not mercadopago; webhook disabled." });
  }
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!secret || !accessToken) return reply(500, { ok: false, message: "Mercado Pago credentials are not configured." });

  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const topicFromQuery = url.searchParams.get("type") ?? url.searchParams.get("topic");
  const body = (await request.json().catch(() => ({}))) as { id?: number | string; type?: string; action?: string; data?: { id?: string | number } };
  const resourceId = dataId ?? (body.data?.id != null ? String(body.data.id) : null);
  const topic = body.type ?? topicFromQuery ?? "";

  const signature = verifySignature({
    signatureHeader: request.headers.get("x-signature"),
    requestId: request.headers.get("x-request-id"),
    dataId,
    secret,
  });
  if (!signature.ok) return reply(401, { ok: false, message: signature.reason });
  if (!resourceId) return reply(400, { ok: false, message: "Notification carries no resource id." });
  if (!SUPPORTED_TOPICS.has(topic)) return reply(200, { ok: true, ignored: true, reason: `Topic "${topic}" is not a subscription event.` });

  const admin = getSupabaseServiceRoleClient();
  const notificationId = body.id != null ? String(body.id) : `${topic}:${resourceId}:${request.headers.get("x-request-id") ?? "no-request-id"}`;
  const ledger = await admin
    .from("billing_events")
    .insert({ notification_id: notificationId, topic, resource_id: resourceId, payload: body })
    .select("id")
    .single();
  if (ledger.error) {
    // 23505 = unique_violation: same notification delivered again.
    if (ledger.error.code === "23505") return reply(200, { ok: true, duplicate: true });
    return reply(500, { ok: false, message: ledger.error.message });
  }
  const ledgerId = ledger.data.id as number;
  const planIds = { monthly: process.env.MERCADOPAGO_PLAN_MONTHLY_ID, annual: process.env.MERCADOPAGO_PLAN_ANNUAL_ID };

  try {
    let mapped;
    let externalReference: string | null = null;
    if (topic === "subscription_preapproval") {
      const preapproval = await fetchResource<Preapproval>(`/preapproval/${resourceId}`, accessToken);
      externalReference = preapproval.external_reference ?? null;
      mapped = mapPreapproval(preapproval, planIds);
    } else {
      const invoice = await fetchResource<AuthorizedPayment>(`/authorized_payments/${resourceId}`, accessToken);
      const preapproval = await fetchResource<Preapproval>(`/preapproval/${invoice.preapproval_id}`, accessToken).catch(() => null);
      externalReference = preapproval?.external_reference ?? invoice.external_reference ?? null;
      mapped = mapAuthorizedPayment(invoice, preapproval ? planFromPreapproval(preapproval, planIds) : undefined);
    }

    // The subscription row is found by the preapproval id we stored when the
    // checkout was created, or — for the very first notification, before the
    // reference is on file — by external_reference, which the checkout sets
    // to the learner's user id.
    let subscriptionRow = (await admin.from("subscriptions").select("*").eq("provider_reference", mapped.preapprovalId).maybeSingle()).data;
    if (!subscriptionRow && externalReference) {
      subscriptionRow = (await admin.from("subscriptions").select("*").eq("user_id", externalReference).maybeSingle()).data;
    }
    if (!subscriptionRow) {
      await admin.from("billing_events").update({ preapproval_id: mapped.preapprovalId, applied: false, reason: "No subscription matches this preapproval." }).eq("id", ledgerId);
      return reply(200, { ok: true, applied: false, reason: "No matching subscription; recorded for reconciliation." });
    }
    const userId = String(subscriptionRow.user_id);

    if (!mapped.event) {
      await admin.from("billing_events").update({ preapproval_id: mapped.preapprovalId, user_id: userId, applied: false, reason: mapped.reason }).eq("id", ledgerId);
      return reply(200, { ok: true, applied: false, reason: mapped.reason });
    }

    const transition = applyBillingEvent(rowToSubscription(subscriptionRow), mapped.event);
    if (transition.applied) {
      const { error } = await admin
        .from("subscriptions")
        .update(subscriptionToRow({ ...transition.subscription, providerReference: transition.subscription.providerReference ?? mapped.preapprovalId }))
        .eq("user_id", userId);
      if (error) throw new Error(error.message);
    }
    await admin
      .from("billing_events")
      .update({ preapproval_id: mapped.preapprovalId, user_id: userId, event_type: mapped.event.type, applied: transition.applied, reason: transition.reason ?? null })
      .eq("id", ledgerId);
    return reply(200, { ok: true, applied: transition.applied, status: transition.subscription.status, reason: transition.reason });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    await admin.from("billing_events").update({ applied: false, reason: message }).eq("id", ledgerId);
    // 5xx makes Mercado Pago redeliver later; the ledger row is released so
    // the retry is not mistaken for a duplicate.
    await admin.from("billing_events").delete().eq("id", ledgerId);
    return reply(500, { ok: false, message });
  }
}
