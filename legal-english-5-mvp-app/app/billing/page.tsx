"use client";

import { AppShell } from "@/components/app-shell";
import { statusLabel, useApp } from "@/components/app-provider";
import { useLocale } from "@/components/locale-provider";
import { entitlementLabel } from "@/lib/i18n";
import { IMAGES } from "@/lib/media";

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
      <div className="billing-card">
        <div>
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
        </div>
        <div className="plans">
          <article className="media-card">
            <div className="card-media">
              <img src={IMAGES.planMonth} alt="" />
            </div>
            <span>{t("monthly")}</span>
            <strong>{t("priceNote")}</strong>
            <p>{t("monthlyBody")}</p>
            <button className="primary" onClick={() => void applyBilling("payment_approved", "monthly")}>
              {t("subscribeMonth")}
            </button>
          </article>
          <article className="media-card">
            <div className="card-media">
              <img src={IMAGES.planYear} alt="" />
            </div>
            <span>{t("annual")}</span>
            <strong>{t("priceNote")}</strong>
            <p>{t("annualBody")}</p>
            <button className="primary" onClick={() => void applyBilling("payment_approved", "annual")}>
              {t("subscribeYear")}
            </button>
          </article>
        </div>
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
