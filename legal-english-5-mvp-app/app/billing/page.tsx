"use client";

import { AppShell } from "@/components/app-shell";
import { useApp } from "@/components/app-provider";
import { useLocale } from "@/components/locale-provider";
import { entitlementDetail, entitlementLabel, subscriptionStatusLabel, type MessageKey } from "@/lib/i18n";
import { Icon, IconName } from "@/components/ui-icons";

const HISTORY_KEY: Record<string, MessageKey> = {
  payment_approved: "historyPaymentApproved",
  payment_rejected: "historyPaymentRejected",
  retries_exhausted: "historyRetriesExhausted",
  cancelled: "historyCancelled",
  period_ended: "historyPeriodEnded",
  trial_expired: "historyTrialExpired",
  reset: "historyReset",
};

export default function BillingPage() {
  const { entitlement, applyBilling, session, billingHistory } = useApp();
  const { locale, t } = useLocale();
  const subscription = session?.subscription;
  const hasMethod = Boolean(subscription?.providerReference);
  const accessValue = entitlement.allowed ? t("billingFullAccess") : t("billingBlocked");
  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("billingEyebrow")}</span>
          <h1>{t("billingTitle")}</h1>
          <p>{t("billingLead")}</p>
        </div>
      </div>
      <div className="billing-card account-billing-grid">
        <section className="billing-subscription-card">
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
          <button className="ghost" onClick={() => void applyBilling("payment_approved", "monthly")}>
            {t("subscribeMonth")}
          </button>
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
              <button onClick={() => void applyBilling("payment_approved", "monthly")}>{t("subscribeMonth")}</button>
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
          <p>{t("billingManageBody")}</p>
          <div>
            <button onClick={() => void applyBilling("cancelled")}>{t("cancellation")}</button>
            <button className="primary" onClick={() => void applyBilling("payment_approved", "annual")}>
              {t("subscribeYear")}
            </button>
          </div>
        </section>
      </div>
      <div className="simulator">
        <h3>{t("sandboxTitle")}</h3>
        <p className="muted">{t("sandboxLead")}</p>
        <button onClick={() => void applyBilling("payment_rejected")}>{t("paymentRejected")}</button>
        <button onClick={() => void applyBilling("retries_exhausted")}>{t("paymentFailed")}</button>
        <button onClick={() => void applyBilling("cancelled")}>{t("cancellation")}</button>
        <button onClick={() => void applyBilling("period_ended")}>{t("periodEnded")}</button>
        <button onClick={() => void applyBilling("trial_expired")}>{t("expireTrial")}</button>
        <button onClick={() => void applyBilling("reset")}>{t("resetTrial")}</button>
      </div>
    </AppShell>
  );
}
