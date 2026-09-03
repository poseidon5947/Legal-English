import { createHmac, timingSafeEqual } from "crypto";
import type { BillingEvent } from "./billing-state";
import type { Plan } from "./types";

// Mercado Pago Suscripciones: webhook authenticity + resource mapping.
// Reference: developers → Your integrations → Notifications → Webhooks.
// Manifest: `id:{data.id};request-id:{x-request-id};ts:{ts};` with data.id
// lower-cased and any missing pair removed, HMAC-SHA256 hex with the app's
// webhook secret, compared in constant time against `v1` of `x-signature`.

export const MP_API = "https://api.mercadopago.com";
export const SIGNATURE_MAX_AGE_MS = 10 * 60 * 1000;

export type SignatureCheck = { ok: true } | { ok: false; reason: string };

export function parseSignatureHeader(header: string | null): { ts: string; v1: string } | null {
  if (!header) return null;
  const parts = Object.fromEntries(
    header
      .split(",")
      .map((part) => part.trim().split("="))
      .filter((pair) => pair.length === 2)
      .map(([key, value]) => [key.trim(), value.trim()])
  ) as Record<string, string>;
  if (!parts.ts || !parts.v1) return null;
  return { ts: parts.ts, v1: parts.v1 };
}

export function buildManifest(dataId: string | null, requestId: string | null, ts: string) {
  const pairs: string[] = [];
  if (dataId) pairs.push(`id:${dataId.toLowerCase()}`);
  if (requestId) pairs.push(`request-id:${requestId}`);
  pairs.push(`ts:${ts}`);
  return `${pairs.join(";")};`;
}

export function verifySignature(input: {
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string | null;
  secret: string;
  now?: Date;
}): SignatureCheck {
  const parsed = parseSignatureHeader(input.signatureHeader);
  if (!parsed) return { ok: false, reason: "Missing or malformed x-signature header." };
  const tsNumber = Number(parsed.ts);
  if (!Number.isFinite(tsNumber)) return { ok: false, reason: "Signature timestamp is not numeric." };
  // MP sends ts in milliseconds; tolerate seconds too.
  const tsMs = tsNumber < 1e12 ? tsNumber * 1000 : tsNumber;
  const now = (input.now ?? new Date()).getTime();
  if (Math.abs(now - tsMs) > SIGNATURE_MAX_AGE_MS) return { ok: false, reason: "Signature timestamp outside the accepted window (replay guard)." };
  const expected = createHmac("sha256", input.secret).update(buildManifest(input.dataId, input.requestId, parsed.ts)).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(parsed.v1, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "Signature mismatch." };
  return { ok: true };
}

export function signForTest(secret: string, dataId: string | null, requestId: string | null, ts: string) {
  const v1 = createHmac("sha256", secret).update(buildManifest(dataId, requestId, ts)).digest("hex");
  return `ts=${ts},v1=${v1}`;
}

// ---------------------------------------------------------------------
// Resource → billing event. The notification body only carries an id; the
// handler fetches the resource from MP and reduces it here. Two topics
// matter for subscriptions:
//   subscription_preapproval          the subscription itself (status:
//                                     pending | authorized | paused | cancelled)
//   subscription_authorized_payment   one recurring charge / invoice
//                                     (status: scheduled | processed |
//                                     recycling | cancelled; recycling =
//                                     MP is retrying a rejected charge)
// ---------------------------------------------------------------------

export type Preapproval = {
  id: string;
  status: string;
  preapproval_plan_id?: string | null;
  external_reference?: string | null;
  payer_id?: number | string | null;
  payer_email?: string | null;
  next_payment_date?: string | null;
  last_modified?: string | null;
  date_created?: string | null;
  auto_recurring?: { frequency?: number; frequency_type?: string } | null;
};

export type AuthorizedPayment = {
  id: string | number;
  status: string;
  preapproval_id: string;
  external_reference?: string | null;
  date_created?: string | null;
  last_modified?: string | null;
  debit_date?: string | null;
  next_retry_date?: string | null;
  retry_attempt?: number | null;
  payment?: { id?: string | number; status?: string; status_detail?: string } | null;
};

export type PlanIds = { monthly?: string; annual?: string };

export function planFromPreapproval(preapproval: Preapproval, planIds: PlanIds): Plan | undefined {
  if (preapproval.preapproval_plan_id) {
    if (planIds.annual && preapproval.preapproval_plan_id === planIds.annual) return "annual";
    if (planIds.monthly && preapproval.preapproval_plan_id === planIds.monthly) return "monthly";
  }
  const recurring = preapproval.auto_recurring;
  if (recurring?.frequency_type === "months" && (recurring.frequency ?? 1) >= 12) return "annual";
  if (recurring?.frequency_type === "months") return "monthly";
  return undefined;
}

export type MappedEvent = { event: BillingEvent; preapprovalId: string } | { event: null; preapprovalId: string; reason: string };

export function mapPreapproval(preapproval: Preapproval, planIds: PlanIds): MappedEvent {
  const at = preapproval.last_modified ?? preapproval.date_created ?? undefined;
  const plan = planFromPreapproval(preapproval, planIds);
  switch (preapproval.status) {
    case "authorized":
      return {
        preapprovalId: preapproval.id,
        event: { type: "payment_approved", plan, periodEnd: preapproval.next_payment_date ?? undefined, providerReference: preapproval.id, at },
      };
    case "paused":
      // MP pauses a subscription once its own retry cycle is exhausted.
      return { preapprovalId: preapproval.id, event: { type: "retries_exhausted", at } };
    case "cancelled":
      return { preapprovalId: preapproval.id, event: { type: "cancelled", at } };
    case "pending":
    default:
      return { preapprovalId: preapproval.id, event: null, reason: `Preapproval status "${preapproval.status}" changes nothing about access.` };
  }
}

export function mapAuthorizedPayment(invoice: AuthorizedPayment, plan?: Plan): MappedEvent {
  const at = invoice.last_modified ?? invoice.date_created ?? undefined;
  const paymentId = invoice.payment?.id != null ? String(invoice.payment.id) : String(invoice.id);
  const paymentStatus = invoice.payment?.status;
  switch (invoice.status) {
    case "processed":
      if (paymentStatus === "approved" || paymentStatus === "accredited") {
        return {
          preapprovalId: invoice.preapproval_id,
          event: { type: "payment_approved", plan, paymentId, providerReference: invoice.preapproval_id, at },
        };
      }
      if (paymentStatus === "rejected" || paymentStatus === "cancelled") {
        return { preapprovalId: invoice.preapproval_id, event: { type: "payment_rejected", paymentId, at } };
      }
      return { preapprovalId: invoice.preapproval_id, event: null, reason: `Processed invoice with payment status "${paymentStatus}" is not conclusive.` };
    case "recycling":
      return { preapprovalId: invoice.preapproval_id, event: { type: "payment_rejected", paymentId, at } };
    case "cancelled":
      return { preapprovalId: invoice.preapproval_id, event: { type: "retries_exhausted", paymentId, at } };
    case "scheduled":
    default:
      return { preapprovalId: invoice.preapproval_id, event: null, reason: `Invoice status "${invoice.status}" changes nothing about access.` };
  }
}

export async function fetchResource<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${MP_API}${path}`, { headers: { authorization: `Bearer ${accessToken}` }, cache: "no-store" });
  if (!response.ok) throw new Error(`Mercado Pago ${path} responded ${response.status}.`);
  return (await response.json()) as T;
}
