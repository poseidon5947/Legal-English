"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useApp } from "@/components/app-provider";
import { useLocale } from "@/components/locale-provider";
import { useToast } from "@/components/toaster";
import { entitlementDetail, entitlementLabel, subscriptionStatusLabel, type MessageKey } from "@/lib/i18n";
import { Icon, IconName } from "@/components/ui-icons";
import { Photo } from "@/components/photo";
import type { Plan } from "@/lib/types";

const HISTORY_KEY: Record<string, MessageKey> = {
  payment_approved: "historyPaymentApproved",
  payment_rejected: "historyPaymentRejected",
  retries_exhausted: "historyRetriesExhausted",
  cancelled: "historyCancelled",
  period_ended: "historyPeriodEnded",
  trial_expired: "historyTrialExpired",
  reset: "historyReset",
};

const SANDBOX = process.env.NEXT_PUBLIC_DATA_MODE !== "production";

function planOf(value: string | null): Plan | null {
  return value === "annual" || value === "monthly" ? value : null;
}

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingWorkspace />
    </Suspense>
  );
}

function BillingWorkspace() {
  const { entitlement, applyBilling, startCheckout, cancelSubscription, session, billingHistory, refresh } = useApp();
  const { locale, t } = useLocale();
  const { notify } = useToast();
  const params = useSearchParams();
  const chosenPlan = planOf(params.get("plan"));
  const returned = params.get("checkout"); // success | pending | failure (back_url from the hosted checkout)
  const subscription = session?.subscription;
  const hasMethod = Boolean(subscription?.providerReference);
  const active = subscription?.status === "active";
  const accessValue = entitlement.allowed ? t("billingFullAccess") : t("billingBlocked");

  // busy: which action is in flight; error: the last provider/server message, shown inline (not swallowed).
  const [busy, setBusy] = useState<"monthly" | "annual" | "cancel" | null>(null);
  const [error, setError] = useState("");

  // Back from the hosted checkout with "pending": the webhook may land a few
  // seconds after the redirect. Poll bootstrap briefly so the page catches up
  // without a manual reload.
  useEffect(() => {
    if (returned !== "pending" || active) return;
    let ticks = 0;
    const timer = window.setInterval(() => {
      ticks += 1;
      void refresh();
      if (ticks >= 12) window.clearInterval(timer);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [returned, active, refresh]);

  async function subscribe(plan: Plan) {
    if (busy) return;
    setBusy(plan);
    setError("");
    try {
      const result = await startCheckout(plan);
      if (!result.ok) {
        setError(result.message || t("billingUnavailable"));
        return;
      }
      if (result.external && result.url) {
        // Hosted Mercado Pago page: leave the app; back_url returns to /billing?checkout=…
        window.location.assign(result.url);
        return;
      }
      notify(t("billingCheckoutSuccess"));
    } finally {
      setBusy(null);
    }
  }

  async function cancel() {
    if (busy || !window.confirm(t("billingCancelConfirm"))) return;
    setBusy("cancel");
    setError("");
    try {
      const result = await cancelSubscription();
      if (result.ok) notify(t("billingCancelled"));
      else setError(result.message || t("couldNotContinue"));
    } finally {
      setBusy(null);
    }
  }

  const notice =
    returned === "success" || (returned === "pending" && active)
      ? { tone: "ok", text: t("billingCheckoutSuccess") }
      : returned === "pending"
        ? { tone: "info", text: t("billingCheckoutPending") }
        : returned === "failure"
          ? { tone: "error", text: t("billingCheckoutFailure") }
          : null;

  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("billingEyebrow")}</span>
          <h1>{t("billingTitle")}</h1>
          <p>{t("billingLead")}</p>
        </div>
      </div>

      {notice && (
        <p className={`billing-notice ${notice.tone}`} role="status">
          {notice.text}
        </p>
      )}
      {chosenPlan && !active && !notice && (
        <div className="billing-notice info billing-plan-intent" role="status">
          <span>{t("billingChosenPlan", { plan: t(chosenPlan) })}</span>
          <button className="primary inline" onClick={() => void subscribe(chosenPlan)} disabled={Boolean(busy)} aria-busy={busy === chosenPlan || undefined}>
            {busy === chosenPlan ? t("billingRedirecting") : t("billingContinueCheckout")}
          </button>
        </div>
      )}
      {error && (
        <p className="billing-notice error" role="alert">
          {error}
        </p>
      )}

      <div className="billing-card account-billing-grid">
        <section className="billing-subscription-card with-photo">
          <Photo className="billing-card-photo" src="/home-assets/photos/cta-courthouse.jpg" size="card" aria-hidden="true" priority />
          <span className={`status ${entitlement.allowed ? "active" : "blocked"}`}>{entitlementLabel(locale, entitlement.label)}</span>
          <h2>{subscription ? subscriptionStatusLabel(locale, subscription.status) : t("noSession")}</h2>
          <p>{entitlementDetail(locale, entitlement.detail)}</p>
          {subscription && (
            <dl className="dates">
              <div>
                <dt>{t("trialStarted")}</dt>
                <dd>{new Date(subscription.trialStartedAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt>{t("trialEnds")}</dt>
                <dd>{new Date(subscription.trialEndsAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt>{t("plan")}</dt>
                <dd>{subscription.plan ? t(subscription.plan) : t("noneYet")}</dd>
              </div>
              <div>
                <dt>{t("providerRef")}</dt>
                <dd>{subscription.providerReference || "—"}</dd>
              </div>
              {subscription.currentPeriodEnd && (
                <div>
                  <dt>{t("periodEnd")}</dt>
                  <dd>{new Date(subscription.currentPeriodEnd).toLocaleString()}</dd>
                </div>
              )}
              {subscription.status === "past_due" && subscription.graceUntil && (
                <div>
                  <dt>{t("graceEnd")}</dt>
                  <dd>{new Date(subscription.graceUntil).toLocaleString()}</dd>
                </div>
              )}
            </dl>
          )}
          {!active && (
            <button className="ghost" onClick={() => void subscribe("monthly")} disabled={Boolean(busy)} aria-busy={busy === "monthly" || undefined}>
              {busy === "monthly" ? t("billingRedirecting") : t("subscribeMonth")}
            </button>
          )}
        </section>
        <section className="billing-panel-card">
          <h2>{t("billingPaymentMethod")}</h2>
          <div className="payment-row">
            <Icon name="card" />
            <div>
              <strong>{hasMethod ? t("billingCardEnding") : t("billingNoMethod")}</strong>
              <span>{hasMethod ? `${subscription?.providerReference} · ${t("billingExpires")}` : t("billingNoMethodBody")}</span>
            </div>
            {hasMethod ? (
              <a href="https://www.mercadopago.com.co/subscriptions" target="_blank" rel="noreferrer">
                {t("billingUpdate")}
              </a>
            ) : (
              <button onClick={() => void subscribe("monthly")} disabled={Boolean(busy)} aria-busy={busy === "monthly" || undefined}>
                {t("subscribeMonth")}
              </button>
            )}
          </div>
        </section>
        <section className="billing-panel-card">
          <h2>{t("billingHistory")}</h2>
          {billingHistory.length === 0 && <p className="muted">{t("billingNoHistory")}</p>}
          {billingHistory.slice(0, 8).map((record) => (
            <div className="billing-history-row" key={record.id} title={record.paymentId || undefined}>
              <span>{new Date(record.at).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}</span>
              <b>{t(HISTORY_KEY[record.type] || "historyReset")}</b>
              <strong>{record.plan ? t(record.plan === "annual" ? "billingAnnualPlan" : "billingMonthlyPlan") : subscriptionStatusLabel(locale, record.status)}</strong>
            </div>
          ))}
        </section>
        <section className="billing-panel-card">
          <h2>{t("billingYourAccess")}</h2>
          {[
            ["book", t("billingTermsLibrary"), accessValue],
            ["help", t("billingQuizzes"), entitlement.allowed ? t("billingUnlimited") : t("billingBlocked")],
            ["trend", t("billingProgress"), t("billingFullAccess")],
            ["users", t("billingSupport"), t("billingIncluded")],
          ].map(([icon, label, value]) => (
            <div className={`access-row${value === t("billingBlocked") ? " blocked" : ""}`} key={label}>
              <Icon name={icon as IconName} />
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </section>
        <section className="billing-panel-card manage-card">
          <h2>{t("billingManage")}</h2>
          <p>{active ? t("billingManageBody") : t("billingNoMethodBody")}</p>
          {active && subscription?.plan === "monthly" && <p className="muted tiny">{t("billingChangePlanNote")}</p>}
          <div>
            {active ? (
              <button onClick={() => void cancel()} disabled={Boolean(busy)} aria-busy={busy === "cancel" || undefined}>
                {t("billingCancelSubscription")}
              </button>
            ) : (
              <button onClick={() => void subscribe("monthly")} disabled={Boolean(busy)} aria-busy={busy === "monthly" || undefined}>
                {t("subscribeMonth")}
              </button>
            )}
            {!active && (
              <button className="primary" onClick={() => void subscribe("annual")} disabled={Boolean(busy)} aria-busy={busy === "annual" || undefined}>
                {busy === "annual" ? t("billingRedirecting") : t("subscribeYear")}
              </button>
            )}
          </div>
        </section>
      </div>

      {SANDBOX && (
        <details className="simulator">
          <summary>
            <h3>{t("sandboxTitle")}</h3>
            <span className="simulator-badge">Sandbox</span>
          </summary>
          <p className="muted">{t("sandboxLead")}</p>
          <button onClick={() => void applyBilling("payment_rejected")}>{t("paymentRejected")}</button>
          <button onClick={() => void applyBilling("retries_exhausted")}>{t("paymentFailed")}</button>
          <button onClick={() => void applyBilling("cancelled")}>{t("cancellation")}</button>
          <button onClick={() => void applyBilling("period_ended")}>{t("periodEnded")}</button>
          <button onClick={() => void applyBilling("trial_expired")}>{t("expireTrial")}</button>
          <button onClick={() => void applyBilling("reset")}>{t("resetTrial")}</button>
        </details>
      )}
    </AppShell>
  );
}
