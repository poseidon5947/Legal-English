/**
 * Emails that must always be Owner (admin). Used by the signup trigger and
 * by a service-role promotion on login so an existing Learner row is upgraded
 * without a manual SQL step.
 *
 * P01 (Hallazgos Hito A, 10 Sep 2026): the live Owner account is
 * pilarcruz640@gmail.com. pilar@mpclaw.studio remains the alpha seed Owner.
 */
export const OWNER_EMAILS = ["pilarcruz640@gmail.com", "pilar@mpclaw.studio"] as const;

export function isOwnerEmail(email: string | null | undefined) {
  return OWNER_EMAILS.includes(String(email ?? "").trim().toLowerCase() as (typeof OWNER_EMAILS)[number]);
}
