export const IMAGES = {
  generatedHero: "/generated/hero-laptop-dashboard.png",
  landingOne: "/generated/learner-experience.png",
  landingTwo: "/generated/page-terms-library.png",
  landingThree: "/generated/page-progress.png",
  login: "/generated/page-sign-in.png",
  sidebar: "/generated/page-account-security.png",
  reviewOwner: "/generated/page-admin-overview.png",
  reviewMaria: "/generated/page-terms-library.png",
  reviewAndres: "/generated/page-progress.png",
  step1: "/generated/page-terms-library.png",
  step2: "/generated/page-term-detail.png",
  step3: "/generated/page-progress.png",
  step4: "/generated/page-account-billing.png",
  step5: "/generated/auth-billing-flow.png",
  step6: "/generated/admin-console.png",
  planMonth: "/generated/page-account-billing.png",
  planYear: "/generated/page-pricing-plans.png",
  heroPoster: "/generated/hero-laptop-dashboard.png",
  heroSlideA: "/generated/page-terms-library.png",
  heroSlideB: "/generated/page-term-detail.png",
  heroSlideC: "/generated/page-progress.png",
} as const;

export const HERO_VIDEO = "";

const TERM_BY_ID: Record<string, string> = {
  "CORP-003": "/generated/page-admin-overview.png",
  "CORP-006": "/generated/page-account-security.png",
  "CORP-013": "/generated/page-account-billing.png",
  "CORP-016": "/generated/page-sign-in.png",
  "CORP-018": "/generated/page-pricing-plans.png",
  "CORP-029": "/generated/admin-console.png",
};

const TERM_FALLBACKS = [
  "/generated/page-terms-library.png",
  "/generated/page-term-detail.png",
  "/generated/page-progress.png",
  "/generated/page-account-billing.png",
  "/generated/page-account-security.png",
  "/generated/page-admin-overview.png",
  "/generated/learner-experience.png",
  "/generated/auth-billing-flow.png",
];

export function cardImage(seed: string) {
  if (TERM_BY_ID[seed]) return TERM_BY_ID[seed];
  let hash = 0;
  for (const char of seed) hash = (hash + char.charCodeAt(0) * 17) % TERM_FALLBACKS.length;
  return TERM_FALLBACKS[Math.abs(hash) % TERM_FALLBACKS.length];
}
