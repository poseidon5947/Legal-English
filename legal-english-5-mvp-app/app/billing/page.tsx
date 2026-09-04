"use client";

import { AppShell } from "@/components/app-shell";
import { statusLabel, useApp } from "@/components/app-provider";
import { useLocale } from "@/components/locale-provider";
import { entitlementLabel } from "@/lib/i18n";
import { Icon, IconName } from "@/components/ui-icons";

export default function BillingPage() {
  const { entitlement, applyBilling, session } = useApp();
  const { locale, t } = useLocale();
  const subscription = session?.subscription;
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
          <h2>{subscription ? statusLabel(subscription.status) : t("noSession")}</h2>
          <p>{entitlement.detail}</p>
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
          <h2>Payment Method</h2>
          <div className="payment-row">
            <Icon name="card" />
            <div>
              <strong>Visa ending in 4242</strong>
              <span>Expires 04/27</span>
            </div>
            <button>Update</button>
          </div>
        </section>
        <section className="billing-panel-card">
          <h2>Billing History</h2>
          {["May 20, 2025", "Apr 20, 2025", "Mar 20, 2025"].map((date) => (
            <div className="billing-history-row" key={date}>
              <span>{date}</span>
              <b>Monthly Plan</b>
              <strong>$9.99</strong>
            </div>
          ))}
        </section>
        <section className="billing-panel-card">
          <h2>Your Access</h2>
          {[
            ["book", "Terms Library", "Full Access"],
            ["help", "Quizzes", "Unlimited"],
            ["trend", "Progress Tracking", "Full Access"],
            ["users", "Priority Support", "Included"],
          ].map(([icon, label, value]) => (
            <div className="access-row" key={label}>
              <Icon name={icon as IconName} />
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </section>
        <section className="billing-panel-card manage-card">
          <h2>Manage Subscription</h2>
          <p>Need a break? You can cancel anytime. You’ll keep access until the end of your billing period.</p>
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
