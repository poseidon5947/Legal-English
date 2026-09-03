import type { Entitlement, Subscription } from "./types";

export function entitlementFor(subscription: Subscription, date = new Date()): Entitlement {
  const trialValid = subscription.status === "trialing" && new Date(subscription.trialEndsAt) > date;
  const paid = subscription.status === "active";
  const exception =
    subscription.status === "exceptional_access" &&
    !!subscription.accessUntil &&
    new Date(subscription.accessUntil) > date;
  if (trialValid) {
    return {
      allowed: true,
      label: "Trial active",
      detail: `Your seven-day trial ends ${new Date(subscription.trialEndsAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}.`,
    };
  }
  if (paid) {
    const plan = subscription.plan === "annual" ? "annual" : "monthly";
    return {
      allowed: true,
      label: "Subscription active",
      detail: `Mercado Pago ${plan} plan is active. Access is granted by the server, not by this screen.`,
    };
  }
  if (exception) {
    return {
      allowed: true,
      label: "Exceptional access",
      detail: `Owner grant until ${new Date(subscription.accessUntil!).toLocaleDateString("en-GB")}.`,
    };
  }
  const labels: Record<string, string> = {
    payment_failed: "Payment failed",
    cancelled: "Subscription cancelled",
    expired: "Trial expired",
    trialing: "Trial expired",
  };
  return {
    allowed: false,
    label: labels[subscription.status] || "Access blocked",
    detail: "Protected terms stay locked until Mercado Pago restores a valid entitlement.",
  };
}

export function canReadProgress(actorId: string, actorRole: string, recordUserId: string) {
  return actorRole === "admin" || actorId === recordUserId;
}

export function canManageTerms(role: string) {
  return role === "admin";
}

export { canPublish } from "./publication";
