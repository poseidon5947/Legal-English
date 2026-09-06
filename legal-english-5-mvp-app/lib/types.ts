import type { Preferences } from "./preferences";
export type Role = "admin" | "learner";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "payment_failed"
  | "cancelled"
  | "expired"
  | "exceptional_access";
export type ProgressState = "new" | "learning" | "mastered";
export type Plan = "monthly" | "annual";
export type CanonicalCategory = (typeof CATEGORIES)[number];

export type UseItWithItem = {
  id: string;
  expression: string;
  displayOrder: number;
};

export type InContextItem = {
  id: string;
  exampleText: string;
  jurisdiction: string;
  displayOrder: number;
};

export type JurisdictionVariant = {
  id: string;
  variantTerm: string;
  definition: string;
  displayOrder: number;
};

export type Quiz = {
  id: string;
  question: string;
  options: string[];
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
  displayOrder: number;
  mcdStatus: string;
};

export type Term = {
  id: string;
  term: string;
  definition: string;
  spanishEquivalent: string;
  civilLawEquivalent: string;
  spanishSpeakerAlert: string;
  category: string;
  topic: string;
  displayOrder: number;
  jurisdictionUS: boolean;
  jurisdictionUK: boolean;
  jurisdiction: "US" | "UK" | "US/UK";
  audioUsPath: string;
  audioUkPath: string;
  usVariant: JurisdictionVariant | null;
  ukVariant: JurisdictionVariant | null;
  useItWith: UseItWithItem[];
  inContext: InContextItem | null;
  quiz: Quiz | null;
  mcdStatus: string;
  published: boolean;
  archived: boolean;
  sourceEditorialVersion: string;
  sourceLastReviewedAt: string;
  sourceWorkbookVersion: string;
  sourceContentHash: string;
  partOfSpeech: string;
  comparativeLawNote: string;
  pronunciation: string;
};

export type Subscription = {
  status: SubscriptionStatus;
  trialStartedAt: string;
  trialEndsAt: string;
  accessUntil: string | null;
  provider: "mercadopago" | "alpha";
  plan: Plan | null;
  providerReference: string | null;
  // End of the period already paid. Cancellation keeps access until here.
  currentPeriodEnd?: string | null;
  // past_due keeps access until here while Mercado Pago retries the charge.
  graceUntil?: string | null;
  // Reconciliation guards: a webhook for an older event or a payment id we
  // already applied is ignored instead of overwriting a good state.
  lastPaymentId?: string | null;
  lastEventAt?: string | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
  subscription: Subscription;
  disabledAt: string | null;
  privacyAcceptedAt: string | null;
  /** Profile photo. Alpha: `/api/account/avatar?v=<updatedAt>`; production: short-lived signed Storage URL. Null = initials. */
  avatarUrl?: string | null;
  /** Account-scoped preferences (see lib/preferences.ts). Absent on legacy rows = defaults. */
  preferences?: Preferences;
};

export type Progress = {
  userId: string;
  termId: string;
  favourite: boolean;
  state: ProgressState;
  attempts: number;
  updatedAt: string;
};

/**
 * One row per learner per calendar day (the learner's local day, "YYYY-MM-DD").
 * Progress rows only keep their latest state, so streaks, weekly activity and
 * answer accuracy are derived from these dated aggregates instead.
 */
export type StudyDay = {
  userId: string;
  day: string;
  opened: number;
  attempts: number;
  correct: number;
  saved: number;
};

export type TicketStatus = "open" | "acknowledged" | "resolved";

/** A learner's support report. Owner sees every ticket; a learner sees their own with its status. */
export type SupportTicket = {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  summary: string;
  detail: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
};

export type Mail = {
  id: string;
  to: string;
  subject: string;
  body: string;
  code?: string;
  createdAt: string;
};

/** One applied billing event, as shown in the learner's Billing History. */
export type BillingRecord = {
  id: string;
  userId: string;
  type: string;
  plan: Plan | null;
  paymentId: string | null;
  status: SubscriptionStatus;
  at: string;
  source: "simulator" | "webhook";
};

export type PublicUser = Omit<User, "passwordHash">;
export type SessionPayload = { user: PublicUser; subscription: Subscription };
export type Entitlement = { allowed: boolean; label: string; detail: string };

export const CATEGORIES = ["Corporate Law", "Contracts", "Employment Law"] as const;
export const DEMO_ACCOUNTS = [
  { email: "pilar@mpclaw.studio", password: "Pilar#Alpha26", role: "Owner" },
  { email: "maria@legalenglish5.test", password: "Maria#Alpha26", role: "Learner" },
  { email: "andres@legalenglish5.test", password: "Andres#Alpha26", role: "Learner" },
] as const;

export function emptyQuiz(termId = "new"): Quiz {
  return {
    id: `QUIZ-${termId}`,
    question: "",
    options: ["", "", ""],
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "A",
    explanation: "",
    displayOrder: 1,
    mcdStatus: "Draft",
  };
}

export function emptyTerm(): Term {
  return {
    id: "",
    term: "",
    definition: "",
    spanishEquivalent: "",
    civilLawEquivalent: "",
    spanishSpeakerAlert: "",
    category: "Corporate Law",
    topic: "Corporate Law",
    displayOrder: 0,
    jurisdictionUS: true,
    jurisdictionUK: false,
    jurisdiction: "US",
    audioUsPath: "",
    audioUkPath: "",
    usVariant: null,
    ukVariant: null,
    useItWith: [],
    inContext: null,
    quiz: null,
    mcdStatus: "Draft",
    published: false,
    archived: false,
    sourceEditorialVersion: "",
    sourceLastReviewedAt: "",
    sourceWorkbookVersion: "",
    sourceContentHash: "",
    partOfSpeech: "",
    comparativeLawNote: "",
    pronunciation: "",
  };
}

export function isCanonicalCategory(value: string): value is CanonicalCategory {
  return (CATEGORIES as readonly string[]).includes(value);
}
