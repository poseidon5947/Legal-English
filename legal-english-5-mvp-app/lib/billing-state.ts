import type { Plan, Subscription } from "./types";

// Payment/access state machine promised in the Propuesta (Estados de cobro y
// acceso). One pure reducer feeds three callers: the alpha simulator, the
// Mercado Pago webhook and the periodic API reconciliation, so all three
// produce the same access result for the same event.
//
//   active         pago acreditado                   -> abierto
//   past_due       rechazo; Mercado Pago reintenta   -> se mantiene (gracia)
//   payment_failed reintentos agotados / API confirma -> bloqueado
//   cancelled      el usuario canceló                -> abierto hasta fin del periodo pagado
//   expired        venció trial o periodo sin renovar -> bloqueado

export const PAST_DUE_GRACE_DAYS = 5;
export const PERIOD_DAYS: Record<Plan, number> = { monthly: 30, annual: 365 };

export type BillingEvent =
  | { type: "payment_approved"; plan?: Plan; paymentId?: string; periodEnd?: string; providerReference?: string; at?: string }
  | { type: "payment_rejected"; paymentId?: string; at?: string }
  | { type: "retries_exhausted"; paymentId?: string; at?: string }
  | { type: "cancelled"; at?: string }
  | { type: "period_ended"; at?: string }
  | { type: "trial_expired"; at?: string }
  | { type: "reset"; at?: string };

export type BillingEventType = BillingEvent["type"];

// Names the alpha billing page and older callers still send.
const LEGACY_EVENTS: Record<string, BillingEventType> = {
  success: "payment_approved",
  failure: "retries_exhausted",
  cancel: "cancelled",
  expire_trial: "trial_expired",
};

export function normalizeEventType(value: string): BillingEventType | null {
  const known: BillingEventType[] = ["payment_approved", "payment_rejected", "retries_exhausted", "cancelled", "period_ended", "trial_expired", "reset"];
  if ((known as string[]).includes(value)) return value as BillingEventType;
  return LEGACY_EVENTS[value] ?? null;
}

function plusDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86400000).toISOString();
}

export function freshTrial(date = new Date()): Subscription {
  return {
    status: "trialing",
    trialStartedAt: date.toISOString(),
    trialEndsAt: plusDays(date, 7),
    accessUntil: null,
    provider: "mercadopago",
    plan: null,
    providerReference: null,
    currentPeriodEnd: null,
    graceUntil: null,
    lastPaymentId: null,
    lastEventAt: null,
  };
}

export type BillingTransition = { subscription: Subscription; applied: boolean; reason?: string };

export function applyBillingEvent(current: Subscription, event: BillingEvent, now = new Date()): BillingTransition {
  const at = event.at ? new Date(event.at) : now;
  if (Number.isNaN(at.getTime())) return { subscription: current, applied: false, reason: "Event timestamp is invalid." };
  const stamp = at.toISOString();

  if (event.type === "reset") {
    return { subscription: { ...freshTrial(at), lastEventAt: stamp }, applied: true };
  }

  if (current.lastEventAt && new Date(current.lastEventAt) > at) {
    return { subscription: current, applied: false, reason: `Stale event (${stamp}) older than last applied (${current.lastEventAt}); ignored.` };
  }
  const paymentId = "paymentId" in event ? event.paymentId : undefined;
  if (paymentId && current.lastPaymentId === paymentId && event.type === "payment_approved") {
    return { subscription: current, applied: false, reason: `Payment ${paymentId} already applied; duplicate ignored.` };
  }

  const base: Subscription = { ...current, lastEventAt: stamp };

  switch (event.type) {
    case "payment_approved": {
      const plan = event.plan ?? current.plan ?? "monthly";
      return {
        applied: true,
        subscription: {
          ...base,
          status: "active",
          plan,
          provider: "mercadopago",
          providerReference: event.providerReference ?? current.providerReference,
          currentPeriodEnd: event.periodEnd ?? plusDays(at, PERIOD_DAYS[plan]),
          graceUntil: null,
          accessUntil: null,
          lastPaymentId: paymentId ?? current.lastPaymentId ?? null,
        },
      };
    }
    case "payment_rejected": {
      // First rejection opens the grace window; later rejections of the same
      // charge cycle must not keep extending it.
      const graceStillOpen = current.status === "past_due" && current.graceUntil && new Date(current.graceUntil) > at;
      return {
        applied: true,
        subscription: {
          ...base,
          status: "past_due",
          graceUntil: graceStillOpen ? current.graceUntil : plusDays(at, PAST_DUE_GRACE_DAYS),
          lastPaymentId: paymentId ?? current.lastPaymentId ?? null,
        },
      };
    }
    case "retries_exhausted":
      return {
        applied: true,
        subscription: { ...base, status: "payment_failed", graceUntil: null, lastPaymentId: paymentId ?? current.lastPaymentId ?? null },
      };
    case "cancelled": {
      const periodEnd = current.currentPeriodEnd && new Date(current.currentPeriodEnd) > at ? current.currentPeriodEnd : null;
      return { applied: true, subscription: { ...base, status: "cancelled", accessUntil: periodEnd, graceUntil: null } };
    }
    case "period_ended":
      return { applied: true, subscription: { ...base, status: "expired", accessUntil: null, graceUntil: null } };
    case "trial_expired":
      if (current.status !== "trialing") return { subscription: current, applied: false, reason: "Only a trial can expire as a trial." };
      return { applied: true, subscription: { ...base, status: "expired", trialEndsAt: stamp } };
  }
}
