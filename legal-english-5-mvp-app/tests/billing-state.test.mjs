import test from "node:test";
import assert from "node:assert/strict";
import { applyBillingEvent, freshTrial, normalizeEventType, PAST_DUE_GRACE_DAYS } from "../lib/billing-state.ts";
import { entitlementFor } from "../lib/entitlement.ts";
import { mapAuthorizedPayment, mapPreapproval, signForTest, verifySignature } from "../lib/mercadopago.ts";
import { parseAudioFilename, storagePathFor } from "../lib/audio-naming.ts";

const T0 = new Date("2026-09-10T10:00:00Z");
const day = (n) => new Date(T0.getTime() + n * 86400000);
const active = () => applyBillingEvent(freshTrial(T0), { type: "payment_approved", plan: "monthly", paymentId: "pay-1", at: T0.toISOString() }, T0).subscription;

test("approved payment activates and sets the paid period", () => {
  const sub = active();
  assert.equal(sub.status, "active");
  assert.equal(sub.plan, "monthly");
  assert.equal(new Date(sub.currentPeriodEnd).getTime(), day(30).getTime());
  assert.equal(entitlementFor(sub, day(1)).allowed, true);
});

test("a rejected charge keeps access during the grace window (past_due), then blocks", () => {
  const sub = applyBillingEvent(active(), { type: "payment_rejected", paymentId: "pay-2", at: day(30).toISOString() }, day(30)).subscription;
  assert.equal(sub.status, "past_due");
  assert.equal(new Date(sub.graceUntil).getTime(), day(30 + PAST_DUE_GRACE_DAYS).getTime());
  const during = entitlementFor(sub, day(32));
  assert.equal(during.allowed, true);
  assert.equal(during.label, "Payment pending");
  const after = entitlementFor(sub, day(36));
  assert.equal(after.allowed, false);
});

test("repeated rejections of the same cycle do not extend the grace window", () => {
  const first = applyBillingEvent(active(), { type: "payment_rejected", paymentId: "pay-2", at: day(30).toISOString() }, day(30)).subscription;
  const second = applyBillingEvent(first, { type: "payment_rejected", paymentId: "pay-3", at: day(32).toISOString() }, day(32)).subscription;
  assert.equal(second.graceUntil, first.graceUntil);
});

test("only exhausted retries produce payment_failed and block", () => {
  const pastDue = applyBillingEvent(active(), { type: "payment_rejected", at: day(30).toISOString() }, day(30)).subscription;
  const failed = applyBillingEvent(pastDue, { type: "retries_exhausted", at: day(34).toISOString() }, day(34)).subscription;
  assert.equal(failed.status, "payment_failed");
  assert.equal(entitlementFor(failed, day(34)).allowed, false);
});

test("an approved retry during grace restores active", () => {
  const pastDue = applyBillingEvent(active(), { type: "payment_rejected", at: day(30).toISOString() }, day(30)).subscription;
  const back = applyBillingEvent(pastDue, { type: "payment_approved", paymentId: "pay-4", at: day(31).toISOString() }, day(31)).subscription;
  assert.equal(back.status, "active");
  assert.equal(back.graceUntil, null);
});

test("cancellation keeps access until the end of the paid period, then blocks", () => {
  const sub = applyBillingEvent(active(), { type: "cancelled", at: day(10).toISOString() }, day(10)).subscription;
  assert.equal(sub.status, "cancelled");
  assert.equal(entitlementFor(sub, day(20)).allowed, true);
  assert.equal(entitlementFor(sub, day(31)).allowed, false);
});

test("stale (out-of-order) events are ignored", () => {
  const sub = active();
  const stale = applyBillingEvent(sub, { type: "cancelled", at: day(-1).toISOString() }, day(1));
  assert.equal(stale.applied, false);
  assert.equal(stale.subscription.status, "active");
});

test("a duplicate approved payment id is ignored", () => {
  const sub = active();
  const dup = applyBillingEvent(sub, { type: "payment_approved", paymentId: "pay-1", at: day(1).toISOString() }, day(1));
  assert.equal(dup.applied, false);
});

test("trial expiry blocks; period end blocks", () => {
  const trial = freshTrial(T0);
  assert.equal(entitlementFor(trial, day(6)).allowed, true);
  const expired = applyBillingEvent(trial, { type: "trial_expired", at: day(7).toISOString() }, day(7)).subscription;
  assert.equal(expired.status, "expired");
  assert.equal(entitlementFor(expired, day(7)).allowed, false);
  const ended = applyBillingEvent(active(), { type: "period_ended", at: day(30).toISOString() }, day(30)).subscription;
  assert.equal(entitlementFor(ended, day(30)).allowed, false);
});

test("legacy simulator event names still map", () => {
  assert.equal(normalizeEventType("success"), "payment_approved");
  assert.equal(normalizeEventType("failure"), "retries_exhausted");
  assert.equal(normalizeEventType("cancel"), "cancelled");
  assert.equal(normalizeEventType("nonsense"), null);
});

test("Mercado Pago signature verifies and rejects tampering/replay", () => {
  const secret = "test-secret";
  const now = new Date("2026-09-10T10:00:00Z");
  const ts = String(now.getTime());
  const header = signForTest(secret, "ABC123", "req-1", ts);
  assert.deepEqual(verifySignature({ signatureHeader: header, requestId: "req-1", dataId: "ABC123", secret, now }), { ok: true });
  assert.equal(verifySignature({ signatureHeader: header, requestId: "req-1", dataId: "ABC124", secret, now }).ok, false);
  assert.equal(verifySignature({ signatureHeader: header, requestId: "req-1", dataId: "ABC123", secret: "other", now }).ok, false);
  const later = new Date(now.getTime() + 11 * 60 * 1000);
  assert.equal(verifySignature({ signatureHeader: header, requestId: "req-1", dataId: "ABC123", secret, now: later }).ok, false);
});

test("Mercado Pago resources map to the documented states", () => {
  const planIds = { monthly: "plan-m", annual: "plan-a" };
  assert.equal(mapPreapproval({ id: "pre-1", status: "authorized", preapproval_plan_id: "plan-a" }, planIds).event.type, "payment_approved");
  assert.equal(mapPreapproval({ id: "pre-1", status: "authorized", preapproval_plan_id: "plan-a" }, planIds).event.plan, "annual");
  assert.equal(mapPreapproval({ id: "pre-1", status: "paused" }, planIds).event.type, "retries_exhausted");
  assert.equal(mapPreapproval({ id: "pre-1", status: "cancelled" }, planIds).event.type, "cancelled");
  assert.equal(mapPreapproval({ id: "pre-1", status: "pending" }, planIds).event, null);
  const approved = mapAuthorizedPayment({ id: 9, status: "processed", preapproval_id: "pre-1", payment: { id: 77, status: "approved" } }, "monthly");
  assert.equal(approved.event.type, "payment_approved");
  assert.equal(approved.event.paymentId, "77");
  assert.equal(mapAuthorizedPayment({ id: 9, status: "recycling", preapproval_id: "pre-1" }).event.type, "payment_rejected");
  assert.equal(mapAuthorizedPayment({ id: 9, status: "cancelled", preapproval_id: "pre-1" }).event.type, "retries_exhausted");
  assert.equal(mapAuthorizedPayment({ id: 9, status: "scheduled", preapproval_id: "pre-1" }).event, null);
});

test("audio filename convention {TermID}_US|UK.{ext}", () => {
  assert.deepEqual(parseAudioFilename("CON-001_US.mp3"), { ok: true, termId: "CON-001", jurisdiction: "us", extension: "mp3" });
  assert.deepEqual(parseAudioFilename("EMP-009_UK.M4A"), { ok: true, termId: "EMP-009", jurisdiction: "uk", extension: "m4a" });
  assert.equal(parseAudioFilename("con-001_us.mp3").ok, false);
  assert.equal(parseAudioFilename("CON-001.mp3").ok, false);
  assert.equal(parseAudioFilename("CON-001_US.exe").ok, false);
  assert.equal(storagePathFor("CON-001", "us", "mp3"), "CON-001/us.mp3");
});
