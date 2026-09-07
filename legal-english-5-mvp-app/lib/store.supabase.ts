import { applyBillingEvent, freshTrial } from "./billing-state";
import { canLearn, canStudyTerm, lockTerm } from "./access";
import { normalizePreferences } from "./preferences";
import { acceptDay, type StudyDelta } from "./study-day";
import { entitlementFor } from "./entitlement";
import { cancelPreapproval, createPreapproval, mercadoPagoConfig } from "./mercadopago";
import { INSIGHTS_RETENTION_DAYS, summarizeInsights, type InsightEvent } from "./insights";
import { canPublish, publicationBlockers } from "./publication";
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from "./supabase/server";
import { siteUrl } from "./site";
import type { Preferences } from "./preferences";
import type { InContextItem, JurisdictionVariant, Mail, Plan, Progress, PublicUser, Quiz, StudyDay, SupportTicket, TicketStatus, Subscription, Term, UseItWithItem, BillingRecord } from "./types";

// Production data layer: Supabase Auth for identity, Postgres + RLS for
// everything else. Every exported function here has the exact name/shape as
// its counterpart in ./store.ts (the alpha/local-JSON implementation) so
// lib/data-store.ts can switch between them without touching call sites.

function plusDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86400000).toISOString();
}

function trial(date = new Date()): Subscription {
  return freshTrial(date);
}

function mapAuthError(message: string | undefined) {
  const text = message || "";
  if (/invalid login credentials/i.test(text)) return "Email or password is incorrect.";
  if (/already registered|user already exists/i.test(text)) return "An account already uses this email.";
  if (/email not confirmed/i.test(text)) return "Verify your email before signing in.";
  if (/token has expired|invalid otp|invalid token/i.test(text)) return "That code is not valid or has expired.";
  if (/password should be at least/i.test(text)) return "Use at least 8 characters.";
  return text || "That request could not be completed.";
}

type TermRow = Record<string, unknown> & { id: string; quiz_items?: QuizRow[] | QuizRow | null };
type QuizRow = Record<string, unknown> & { id: string; term_id: string };

function rowToQuiz(row: QuizRow | null | undefined): Quiz | null {
  if (!row) return null;
  const optionA = String(row.option_a ?? "");
  const optionB = String(row.option_b ?? "");
  const optionC = String(row.option_c ?? "");
  const optionD = String(row.option_d ?? "");
  return {
    id: String(row.id),
    question: String(row.prompt ?? ""),
    options: [optionA, optionB, optionC, optionD].filter(Boolean),
    optionA,
    optionB,
    optionC,
    optionD,
    correctOption: String(row.correct_option ?? "A"),
    explanation: String(row.explanation ?? ""),
    displayOrder: Number(row.display_order ?? 1),
    mcdStatus: String(row.mcd_status ?? "Approved"),
  };
}

function quizToRow(quiz: Quiz, termId: string) {
  return {
    id: quiz.id || `QUIZ-${termId}`,
    term_id: termId,
    prompt: quiz.question,
    option_a: quiz.optionA,
    option_b: quiz.optionB,
    option_c: quiz.optionC,
    option_d: quiz.optionD || null,
    correct_option: quiz.correctOption,
    explanation: quiz.explanation,
    display_order: quiz.displayOrder,
    mcd_status: quiz.mcdStatus,
  };
}

function deriveJurisdiction(us: boolean, uk: boolean): Term["jurisdiction"] {
  if (us && uk) return "US/UK";
  return uk ? "UK" : "US";
}

function rowToTerm(row: TermRow): Term {
  const metadata = (row.admin_metadata as Record<string, string>) ?? {};
  const quizRow = Array.isArray(row.quiz_items) ? row.quiz_items[0] : row.quiz_items;
  return {
    id: String(row.id),
    term: String(row.term ?? ""),
    definition: String(row.definition ?? ""),
    spanishEquivalent: String(row.spanish_equivalent ?? ""),
    civilLawEquivalent: String(row.civil_law_equivalent ?? ""),
    spanishSpeakerAlert: String(row.spanish_speaker_alert ?? ""),
    category: String(row.category ?? ""),
    topic: String(row.topic ?? ""),
    displayOrder: Number(row.display_order ?? 0),
    jurisdictionUS: Boolean(row.jurisdiction_us),
    jurisdictionUK: Boolean(row.jurisdiction_uk),
    jurisdiction: deriveJurisdiction(Boolean(row.jurisdiction_us), Boolean(row.jurisdiction_uk)),
    audioUsPath: String(row.audio_us_path ?? ""),
    audioUkPath: String(row.audio_uk_path ?? ""),
    usVariant: (row.us_variant as JurisdictionVariant | null) ?? null,
    ukVariant: (row.uk_variant as JurisdictionVariant | null) ?? null,
    useItWith: (row.use_it_with as UseItWithItem[] | null) ?? [],
    inContext: (row.in_context as InContextItem | null) ?? null,
    quiz: rowToQuiz(quizRow ?? null),
    mcdStatus: String(row.mcd_status ?? "Approved"),
    published: Boolean(row.published),
    archived: row.archived_at != null,
    sourceEditorialVersion: String(row.source_editorial_version ?? ""),
    sourceLastReviewedAt: String(row.source_last_reviewed_at ?? ""),
    sourceWorkbookVersion: String(row.source_workbook_version ?? ""),
    sourceContentHash: String(row.source_content_hash ?? ""),
    partOfSpeech: String(metadata.partOfSpeech ?? ""),
    comparativeLawNote: String(metadata.comparativeLawNote ?? ""),
    pronunciation: String(metadata.pronunciation ?? ""),
  };
}

function termToRow(term: Term) {
  return {
    id: term.id,
    term: term.term,
    definition: term.definition,
    spanish_equivalent: term.spanishEquivalent,
    civil_law_equivalent: term.civilLawEquivalent || null,
    spanish_speaker_alert: term.spanishSpeakerAlert || null,
    category: term.category,
    topic: term.topic || null,
    display_order: term.displayOrder,
    jurisdiction_us: term.jurisdictionUS,
    jurisdiction_uk: term.jurisdictionUK,
    audio_us_path: term.audioUsPath || null,
    audio_uk_path: term.audioUkPath || null,
    us_variant: term.usVariant,
    uk_variant: term.ukVariant,
    use_it_with: term.useItWith ?? [],
    in_context: term.inContext,
    mcd_status: term.mcdStatus || "Approved",
    published: term.published,
    archived_at: term.archived ? new Date().toISOString() : null,
    source_editorial_version: term.sourceEditorialVersion || null,
    source_last_reviewed_at: term.sourceLastReviewedAt || null,
    source_workbook_version: term.sourceWorkbookVersion || null,
    source_content_hash: term.sourceContentHash || null,
    admin_metadata: {
      partOfSpeech: term.partOfSpeech || "",
      comparativeLawNote: term.comparativeLawNote || "",
      pronunciation: term.pronunciation || "",
    },
    updated_at: new Date().toISOString(),
  };
}

export function rowToSubscription(row: Record<string, unknown> | null | undefined): Subscription {
  if (!row) return trial();
  return {
    status: (row.status as Subscription["status"]) ?? "trialing",
    trialStartedAt: String(row.trial_started_at ?? new Date().toISOString()),
    trialEndsAt: String(row.trial_ends_at ?? plusDays(new Date(), 7)),
    accessUntil: (row.access_until as string | null) ?? null,
    provider: (row.provider as Subscription["provider"]) ?? "mercadopago",
    plan: (row.plan as Plan | null) ?? null,
    providerReference: (row.provider_reference as string | null) ?? null,
    currentPeriodEnd: (row.current_period_end as string | null) ?? null,
    graceUntil: (row.grace_until as string | null) ?? null,
    lastPaymentId: (row.last_payment_id as string | null) ?? null,
    lastEventAt: (row.last_event_at as string | null) ?? null,
  };
}

export function subscriptionToRow(subscription: Subscription) {
  return {
    status: subscription.status,
    plan: subscription.plan,
    trial_started_at: subscription.trialStartedAt,
    trial_ends_at: subscription.trialEndsAt,
    access_until: subscription.accessUntil,
    provider: subscription.provider,
    provider_reference: subscription.providerReference,
    current_period_end: subscription.currentPeriodEnd ?? null,
    grace_until: subscription.graceUntil ?? null,
    last_payment_id: subscription.lastPaymentId ?? null,
    last_event_at: subscription.lastEventAt ?? null,
    updated_at: new Date().toISOString(),
  };
}

async function lookupEmailVerified(userId: string): Promise<boolean> {
  const admin = getSupabaseServiceRoleClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) return false;
  return Boolean(data.user.email_confirmed_at);
}

export const AVATAR_BUCKET = "avatars";
const AVATAR_URL_TTL_SECONDS = 60 * 60;

/** Signs private profile-photo object paths (`<userId>/avatar.<ext>`) so the browser can render them. */
async function signAvatars(paths: (string | null)[]): Promise<Map<string, string>> {
  const wanted = Array.from(new Set(paths.filter((p): p is string => Boolean(p))));
  if (!wanted.length) return new Map();
  const admin = getSupabaseServiceRoleClient();
  const { data } = await admin.storage.from(AVATAR_BUCKET).createSignedUrls(wanted, AVATAR_URL_TTL_SECONDS);
  return new Map((data ?? []).filter((entry) => entry.signedUrl).map((entry) => [String(entry.path), String(entry.signedUrl)]));
}

/**
 * `asAdmin` bypasses RLS via the service-role client. Only for the moment right
 * after signUp(): with "Confirm email" on, Supabase returns the new user but no
 * session until the code is verified, so the cookie client cannot see the row
 * the trigger just created (RLS "users read own profile" needs auth.uid()).
 */
export async function getUser(id: string, options: { asAdmin?: boolean } = {}): Promise<PublicUser | null> {
  const supabase = options.asAdmin ? getSupabaseServiceRoleClient() : await getSupabaseServerClient();
  const { data: profile } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  if (!profile) return null;
  const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", id).maybeSingle();
  const emailVerified = await lookupEmailVerified(id);
  const avatarPath = (profile.avatar_path as string | null) ?? null;
  const signed = await signAvatars([avatarPath]);
  return {
    avatarUrl: avatarPath ? signed.get(avatarPath) ?? null : null,
    id: String(profile.id),
    name: String(profile.full_name ?? ""),
    email: String(profile.email ?? ""),
    role: (profile.role as PublicUser["role"]) ?? "learner",
    emailVerified,
    createdAt: String(profile.created_at ?? new Date().toISOString()),
    subscription: rowToSubscription(sub),
    disabledAt: (profile.disabled_at as string | null) ?? null,
    privacyAcceptedAt: (profile.privacy_accepted_at as string | null) ?? null,
    preferences: normalizePreferences(profile.preferences as Partial<Preferences> | null),
  };
}

export async function updatePreferences(userId: string, patch: unknown) {
  const current = await getUser(userId);
  if (!current) return { ok: false as const, message: "Sign in required." };
  const preferences = normalizePreferences(current.preferences, patch);
  // Written under the learner's own session: "users update own name" covers
  // the row; the column was added by migration 007.
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("users").update({ preferences, updated_at: new Date().toISOString() }).eq("id", userId);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, user: { ...current, preferences } };
}

async function listUsers(): Promise<PublicUser[]> {
  const supabase = await getSupabaseServerClient();
  const [{ data: profiles }, { data: subs }] = await Promise.all([
    supabase.from("users").select("*"),
    supabase.from("subscriptions").select("*"),
  ]);
  const admin = getSupabaseServiceRoleClient();
  const { data: authList } = await admin.auth.admin.listUsers({ perPage: 200 });
  const confirmedById = new Map((authList?.users ?? []).map((u) => [u.id, Boolean(u.email_confirmed_at)]));
  const subById = new Map((subs ?? []).map((row) => [String(row.user_id), row]));
  const signed = await signAvatars((profiles ?? []).map((profile) => (profile.avatar_path as string | null) ?? null));
  return (profiles ?? []).map((profile) => ({
    avatarUrl: profile.avatar_path ? signed.get(String(profile.avatar_path)) ?? null : null,
    id: String(profile.id),
    name: String(profile.full_name ?? ""),
    email: String(profile.email ?? ""),
    role: (profile.role as PublicUser["role"]) ?? "learner",
    emailVerified: confirmedById.get(String(profile.id)) ?? false,
    createdAt: String(profile.created_at ?? new Date().toISOString()),
    subscription: rowToSubscription(subById.get(String(profile.id))),
    disabledAt: (profile.disabled_at as string | null) ?? null,
    privacyAcceptedAt: (profile.privacy_accepted_at as string | null) ?? null,
    preferences: normalizePreferences(profile.preferences as Partial<Preferences> | null),
  }));
}

export async function currentUserId(): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function authenticate(email: string, password: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error || !data.user) return { ok: false as const, message: mapAuthError(error?.message) };
  const user = await getUser(data.user.id);
  if (!user) return { ok: false as const, message: "Account profile is missing." };
  return { ok: true as const, user };
}

/** Revokes the Supabase session and lets the SSR client clear its auth cookies on this response. */
export async function signOut() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
}

export async function register(name: string, email: string, password: string, privacyAccepted: boolean) {
  if (!privacyAccepted) {
    return { ok: false as const, message: "You must accept the data processing notice to continue." };
  }
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    // handle_new_auth_user() (003_account_and_backup.sql) reads
    // privacy_accepted back out of this metadata to stamp
    // privacy_accepted_at, and refuses the signup row entirely if it's
    // missing — the app-level check above is the one a user actually
    // sees; that trigger check is a backstop against calling Supabase
    // Auth directly and skipping this function.
    // Free-tier Supabase with the default mailer cannot customise templates, so
    // the email may carry a link ({{ .ConfirmationURL }}) instead of the code the
    // UI asks for. Point that link at /auth/confirm, which finishes the flow.
    options: { data: { full_name: name.trim(), privacy_accepted: true }, emailRedirectTo: authCallbackUrl("signup") },
  });
  if (error || !data.user) return { ok: false as const, message: mapAuthError(error?.message) };
  // No session yet (email confirmation pending), so the row must be read as admin.
  const user = await getUser(data.user.id, { asAdmin: true });
  if (!user) return { ok: false as const, message: "Account was created but the profile row is missing. Check the on_auth_user_created trigger." };
  // A session exists here only when "Confirm email" is disabled in Supabase Auth.
  return { ok: true as const, user, code: undefined as string | undefined, sessionEstablished: Boolean(data.session) };
}

export async function verifyEmail(email: string, code: string) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: "signup" });
  if (error) return { ok: false as const, message: mapAuthError(error.message) };
  return { ok: true as const };
}

/** Where Supabase Auth email links land; the route handler there completes the flow. */
function authCallbackUrl(type: "signup" | "recovery") {
  return `${siteUrl().origin}/auth/confirm?type=${type}`;
}

export async function requestReset(email: string) {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: authCallbackUrl("recovery") });
  return { ok: true as const };
}

export async function resetPassword(email: string, code: string, password: string) {
  const supabase = await getSupabaseServerClient();
  const token = String(code ?? "").trim();
  if (token) {
    const { error: otpError } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token, type: "recovery" });
    if (otpError) return { ok: false as const, message: mapAuthError(otpError.message) };
  } else {
    // Link-based recovery: /auth/confirm already exchanged the link for a
    // session in this browser, so only the new password is needed.
    const { data } = await supabase.auth.getUser();
    if (!data.user) return { ok: false as const, message: "The recovery link has expired. Request a new one." };
  }
  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) return { ok: false as const, message: mapAuthError(updateError.message) };
  return { ok: true as const };
}

export async function inboxFor(_email: string): Promise<Mail[]> {
  // Real mail goes out through Supabase Auth's configured SMTP (Resend).
  // There is nothing to show in-app in production mode.
  return [];
}

export async function updateProfile(userId: string, name: string) {
  const next = name.trim();
  if (next.length < 2) return { ok: false as const, message: "Enter your full name." };
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("users").update({ full_name: next, updated_at: new Date().toISOString() }).eq("id", userId);
  if (error) return { ok: false as const, message: error.message };
  const user = await getUser(userId);
  if (!user) return { ok: false as const, message: "Sign in required." };
  return { ok: true as const, user, entitlement: entitlementFor(user.subscription) };
}

const AVATAR_CONTENT_TYPE: Record<string, string> = { webp: "image/webp", jpg: "image/jpeg", png: "image/png" };

export async function saveAvatar(userId: string, bytes: Buffer, extension: "webp" | "jpg" | "png") {
  const admin = getSupabaseServiceRoleClient();
  const { data: profile } = await admin.from("users").select("avatar_path").eq("id", userId).maybeSingle();
  if (!profile) return { ok: false as const, message: "Sign in required." };
  const path = `${userId}/avatar.${extension}`;
  const previous = (profile.avatar_path as string | null) ?? null;
  if (previous && previous !== path) await admin.storage.from(AVATAR_BUCKET).remove([previous]);
  const { error: uploadError } = await admin.storage
    .from(AVATAR_BUCKET)
    .upload(path, bytes, { contentType: AVATAR_CONTENT_TYPE[extension], upsert: true, cacheControl: "0" });
  if (uploadError) return { ok: false as const, message: uploadError.message };
  const { error } = await admin.from("users").update({ avatar_path: path, updated_at: new Date().toISOString() }).eq("id", userId);
  if (error) return { ok: false as const, message: error.message };
  const user = await getUser(userId);
  if (!user) return { ok: false as const, message: "Sign in required." };
  return { ok: true as const, user };
}

export async function removeAvatar(userId: string) {
  const admin = getSupabaseServiceRoleClient();
  const { data: profile } = await admin.from("users").select("avatar_path").eq("id", userId).maybeSingle();
  if (!profile) return { ok: false as const, message: "Sign in required." };
  const previous = (profile.avatar_path as string | null) ?? null;
  if (previous) await admin.storage.from(AVATAR_BUCKET).remove([previous]);
  const { error } = await admin.from("users").update({ avatar_path: null, updated_at: new Date().toISOString() }).eq("id", userId);
  if (error) return { ok: false as const, message: error.message };
  const user = await getUser(userId);
  if (!user) return { ok: false as const, message: "Sign in required." };
  return { ok: true as const, user };
}

export async function changeOwnPassword(userId: string, currentPassword: string, nextPassword: string) {
  const user = await getUser(userId);
  if (!user) return { ok: false as const, message: "Sign in required." };
  if (nextPassword.trim().length < 8) return { ok: false as const, message: "Use at least 8 characters." };
  const supabase = await getSupabaseServerClient();
  const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
  if (verifyError) return { ok: false as const, message: "Current password is incorrect." };
  const { error } = await supabase.auth.updateUser({ password: nextPassword });
  if (error) return { ok: false as const, message: mapAuthError(error.message) };
  return { ok: true as const };
}

export async function deleteAccount(userId: string) {
  const admin = getSupabaseServiceRoleClient();
  const { data: target } = await admin.from("users").select("role, avatar_path").eq("id", userId).maybeSingle();
  if (!target) return { ok: false as const, message: "Sign in required." };
  if (target.role === "admin") {
    const { count } = await admin.from("users").select("id", { count: "exact", head: true }).eq("role", "admin").neq("id", userId);
    if (!count) return { ok: false as const, message: "The last Owner account cannot be deleted." };
  }
  // Habeas data: the profile photo leaves Storage together with the row (cascade covers the tables, not the bucket).
  if (target.avatar_path) await admin.storage.from(AVATAR_BUCKET).remove([String(target.avatar_path)]);
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
}

export async function deactivateAccount(userId: string) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("users").update({ disabled_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", userId);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
}

export async function reactivateAccount(userId: string) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("users").update({ disabled_at: null, updated_at: new Date().toISOString() }).eq("id", userId);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
}

export async function reportIssue(userId: string, summary: string, detail: string) {
  const title = summary.trim();
  const body = detail.trim();
  if (title.length < 3 || body.length < 8) return { ok: false as const, message: "Add a short title and the steps to reproduce." };
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("support_tickets").insert({ reporter_id: userId, summary: title, detail: body });
  if (error) return { ok: false as const, message: error.message };
  const tickets = await listTickets(userId);
  return { ok: true as const, inbox: [] as Mail[], tickets: tickets.ok ? tickets.tickets : [] };
}

function rowToTicket(row: Record<string, unknown>, reporter?: { name: string; email: string }): SupportTicket {
  return {
    id: String(row.id),
    reporterId: String(row.reporter_id),
    reporterName: reporter?.name ?? "",
    reporterEmail: reporter?.email ?? "",
    summary: String(row.summary ?? ""),
    detail: String(row.detail ?? ""),
    status: (row.status as TicketStatus) ?? "open",
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.created_at ?? new Date().toISOString()),
  };
}

/** RLS decides the scope: the Owner gets every ticket, a learner only their own. */
export async function listTickets(actorId: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) return { ok: false as const, message: error.message };
  const reporterIds = Array.from(new Set((data ?? []).map((row) => String(row.reporter_id))));
  const { data: reporters } = reporterIds.length ? await supabase.from("users").select("id, full_name, email").in("id", reporterIds) : { data: [] };
  const byId = new Map((reporters ?? []).map((row) => [String(row.id), { name: String(row.full_name ?? ""), email: String(row.email ?? "") }]));
  void actorId;
  return { ok: true as const, tickets: (data ?? []).map((row) => rowToTicket(row, byId.get(String(row.reporter_id)))) };
}

export async function updateTicket(actorId: string, ticketId: string, status: TicketStatus) {
  const actor = await getUser(actorId);
  if (actor?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("support_tickets").update({ status, updated_at: new Date().toISOString() }).eq("id", ticketId);
  if (error) return { ok: false as const, message: error.message };
  return listTickets(actorId);
}

export const AUDIO_BUCKET = "term-audio";
const AUDIO_URL_TTL_SECONDS = 60 * 30;

function isStoragePath(value: string) {
  return Boolean(value) && !/^https?:\/\//.test(value);
}

/**
 * Turns stored audio object paths into short-lived signed URLs. Runs after
 * the caller's RLS-scoped term query already decided which terms they may
 * see — signing does not grant new access, it fulfils access already
 * granted. A term whose audio path is already a full URL (an admin who
 * typed one directly instead of uploading) passes through unchanged.
 */
async function withSignedAudio(terms: Term[]): Promise<Term[]> {
  const paths = Array.from(
    new Set(terms.flatMap((term) => [term.audioUsPath, term.audioUkPath]).filter(isStoragePath))
  );
  if (!paths.length) return terms;
  const admin = getSupabaseServiceRoleClient();
  const { data } = await admin.storage.from(AUDIO_BUCKET).createSignedUrls(paths, AUDIO_URL_TTL_SECONDS);
  const signedByPath = new Map((data ?? []).map((entry) => [entry.path, entry.signedUrl]));
  return terms.map((term) => ({
    ...term,
    audioUsPath: isStoragePath(term.audioUsPath) ? signedByPath.get(term.audioUsPath) || "" : term.audioUsPath,
    audioUkPath: isStoragePath(term.audioUkPath) ? signedByPath.get(term.audioUkPath) || "" : term.audioUkPath,
  }));
}

async function listTerms(includeUnpublished: boolean, withContent = true): Promise<Term[]> {
  const supabase = await getSupabaseServerClient();
  let query = supabase.from("terms").select("*, quiz_items(*)");
  if (!includeUnpublished) query = query.eq("published", true).is("archived_at", null);
  const { data } = await query;
  const terms = (data ?? []).map((row) => rowToTerm(row as TermRow)).sort((a, b) => a.displayOrder - b.displayOrder);
  // Without active access the account gets titles only — and no signed audio
  // URLs are minted for it (signing happens with the service role, so the
  // entitlement check has to happen here, before it).
  if (!withContent) return terms.map(lockTerm);
  return withSignedAudio(terms);
}

function rowToProgress(row: Record<string, unknown>): Progress {
  return {
    userId: String(row.user_id),
    termId: String(row.term_id),
    favourite: Boolean(row.favourite),
    state: (row.state as Progress["state"]) ?? "new",
    attempts: Number(row.attempts ?? 0),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function rowToStudyDay(row: Record<string, unknown>): StudyDay {
  return {
    userId: String(row.user_id),
    day: String(row.day).slice(0, 10),
    opened: Number(row.opened ?? 0),
    attempts: Number(row.attempts ?? 0),
    correct: Number(row.correct ?? 0),
    saved: Number(row.saved ?? 0),
  };
}

async function studyDaysFor(userId: string): Promise<StudyDay[]> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from("study_days").select("*").eq("user_id", userId).order("day", { ascending: false }).limit(400);
  return (data ?? []).map(rowToStudyDay);
}

/** Bump today's aggregate for the learner (their own RLS-scoped client writes the row). */
async function recordStudy(userId: string, day: unknown, delta: StudyDelta) {
  const supabase = await getSupabaseServerClient();
  const key = acceptDay(day);
  const { data: existing } = await supabase.from("study_days").select("*").eq("user_id", userId).eq("day", key).maybeSingle();
  const next = {
    user_id: userId,
    day: key,
    opened: Number(existing?.opened ?? 0) + (delta.opened ?? 0),
    attempts: Number(existing?.attempts ?? 0) + (delta.attempts ?? 0),
    correct: Number(existing?.correct ?? 0) + (delta.correct ?? 0),
    saved: Number(existing?.saved ?? 0) + (delta.saved ?? 0),
    updated_at: new Date().toISOString(),
  };
  if (existing) await supabase.from("study_days").update(next).eq("user_id", userId).eq("day", key);
  else await supabase.from("study_days").insert(next);
}

export async function bootstrap(userId: string | null) {
  if (!userId) return { session: null, terms: [], progress: [], users: [], inbox: [], entitlement: entitlementFor(trial()) };
  const user = await getUser(userId);
  if (!user) return { session: null, terms: [], progress: [], users: [], inbox: [], entitlement: entitlementFor(trial()) };
  const isAdmin = user.role === "admin";
  const supabase = await getSupabaseServerClient();
  const terms = await listTerms(isAdmin, isAdmin || canLearn(user).ok);
  let progressQuery = supabase.from("user_term_progress").select("*");
  if (!isAdmin) progressQuery = progressQuery.eq("user_id", userId);
  const { data: progressRows } = await progressQuery;
  return {
    session: { user, subscription: user.subscription },
    terms,
    progress: (progressRows ?? []).map(rowToProgress),
    studyDays: await studyDaysFor(userId),
    tickets: await listTickets(userId).then((result) => (result.ok ? result.tickets : [])),
    users: isAdmin ? await listUsers() : [],
    inbox: [] as Mail[],
    entitlement: entitlementFor(user.subscription),
    billingHistory: await billingHistoryFor(userId),
  };
}

/**
 * The learner's own applied webhook events from the billing_events ledger
 * (migration 004). Read with the service role because the ledger's RLS only
 * exposes it to the Owner; the filter by user_id keeps it per-account.
 */
async function billingHistoryFor(userId: string): Promise<BillingRecord[]> {
  const admin = getSupabaseServiceRoleClient();
  const { data } = await admin
    .from("billing_events")
    .select("id, event_type, resource_id, received_at, payload")
    .eq("user_id", userId)
    .eq("applied", true)
    .order("received_at", { ascending: false })
    .limit(24);
  const user = await getUser(userId);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    userId,
    type: String(row.event_type ?? ""),
    plan: row.event_type === "payment_approved" ? (user?.subscription.plan ?? null) : null,
    paymentId: row.resource_id ? String(row.resource_id) : null,
    status: user?.subscription.status ?? "expired",
    at: String(row.received_at),
    source: "webhook" as const,
  }));
}

/** The term as the caller's RLS-scoped client sees it (null = missing or not published for a learner). */
async function visibleTerm(termId: string) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from("terms").select("id, published, archived_at").eq("id", termId).maybeSingle();
  return data ? { published: Boolean(data.published), archived: Boolean(data.archived_at) } : null;
}

export async function openTerm(userId: string, termId: string, day?: unknown) {
  const user = await getUser(userId);
  const access = canStudyTerm(user, await visibleTerm(termId));
  if (!access.ok) return { ok: false as const, message: access.message };
  const supabase = await getSupabaseServerClient();
  const { data: existing } = await supabase.from("user_term_progress").select("*").eq("user_id", userId).eq("term_id", termId).maybeSingle();
  if (!existing) {
    await supabase.from("user_term_progress").insert({ user_id: userId, term_id: termId, favourite: false, state: "learning", attempts: 0 });
  } else if (existing.state === "new") {
    await supabase.from("user_term_progress").update({ state: "learning", updated_at: new Date().toISOString() }).eq("user_id", userId).eq("term_id", termId);
  }
  await recordStudy(userId, day, { opened: 1 });
  const { data: rows } = await supabase.from("user_term_progress").select("*").eq("user_id", userId);
  return { ok: true as const, progress: (rows ?? []).map(rowToProgress), studyDays: await studyDaysFor(userId) };
}

export async function toggleFavourite(userId: string, termId: string, day?: unknown) {
  const user = await getUser(userId);
  const access = canStudyTerm(user, await visibleTerm(termId));
  if (!access.ok) return { ok: false as const, message: access.message };
  const supabase = await getSupabaseServerClient();
  const { data: existing } = await supabase.from("user_term_progress").select("*").eq("user_id", userId).eq("term_id", termId).maybeSingle();
  const { error } = existing
    ? await supabase.from("user_term_progress").update({ favourite: !existing.favourite, updated_at: new Date().toISOString() }).eq("user_id", userId).eq("term_id", termId)
    : await supabase.from("user_term_progress").insert({ user_id: userId, term_id: termId, favourite: true, state: "learning", attempts: 0 });
  if (error) return { ok: false as const, message: error.message };
  if (!existing || !existing.favourite) await recordStudy(userId, day, { saved: 1 });
  const { data: rows } = await supabase.from("user_term_progress").select("*").eq("user_id", userId);
  return { ok: true as const, progress: (rows ?? []).map(rowToProgress), studyDays: await studyDaysFor(userId) };
}

export async function submitQuiz(userId: string, termId: string, option: string, day?: unknown) {
  const user = await getUser(userId);
  const supabase = await getSupabaseServerClient();
  const { data: termRow } = await supabase.from("terms").select("*, quiz_items(*)").eq("id", termId).maybeSingle();
  const term = termRow ? rowToTerm(termRow as TermRow) : null;
  const access = canStudyTerm(user, term);
  if (!access.ok) return { ok: false as const, message: access.message };
  if (!term?.quiz) return { ok: false as const, message: "Quiz unavailable." };
  const correct = term.quiz.correctOption === option || term.quiz.options[term.quiz.correctOption.charCodeAt(0) - 65] === option;
  const { data: existing } = await supabase.from("user_term_progress").select("*").eq("user_id", userId).eq("term_id", termId).maybeSingle();
  const attempts = Number(existing?.attempts ?? 0) + 1;
  const state = correct ? "mastered" : "learning";
  if (existing) {
    await supabase.from("user_term_progress").update({ state, attempts, updated_at: new Date().toISOString() }).eq("user_id", userId).eq("term_id", termId);
  } else {
    await supabase.from("user_term_progress").insert({ user_id: userId, term_id: termId, favourite: false, state, attempts });
  }
  await recordStudy(userId, day, { attempts: 1, correct: correct ? 1 : 0 });
  const { data: rows } = await supabase.from("user_term_progress").select("*").eq("user_id", userId);
  return { ok: true as const, correct, message: term.quiz.explanation, progress: (rows ?? []).map(rowToProgress), studyDays: await studyDaysFor(userId) };
}

export async function applyBilling(_userId: string, _event: string, _plan?: Plan) {
  // Deliberately not implemented against the client's own session: no
  // authenticated write policy exists on public.subscriptions (see
  // 001_initial_schema.sql), so a learner-triggered state change is not
  // just unimplemented, it is architecturally refused. Hito C's Mercado
  // Pago webhook handler is the only intended caller of a subscription
  // write, and it must use the service-role client after verifying the
  // webhook signature — never this function reached from an authenticated
  // request.
  return { ok: false as const, message: "Billing state changes must come from the Mercado Pago webhook, not the client." };
}

const PLAN_REASON: Record<Plan, string> = { monthly: "Legal English 5 — monthly plan", annual: "Legal English 5 — annual plan" };

export async function startCheckout(userId: string, plan: Plan, origin: string) {
  const config = mercadoPagoConfig();
  if (!config.ready) return { ok: false as const, message: "Payments are not enabled on this server yet. Your trial and any Owner-granted access continue to work." };
  const user = await getUser(userId);
  if (!user) return { ok: false as const, message: "Sign in required." };
  if (user.subscription.status === "active") return { ok: false as const, message: "This account already has an active subscription." };
  try {
    const created = await createPreapproval({
      accessToken: config.accessToken,
      planId: config.planIds[plan]!,
      payerEmail: user.email,
      externalReference: userId,
      reason: PLAN_REASON[plan],
      backUrl: `${origin}/billing?checkout=pending&plan=${plan}`,
    });
    // Remember the preapproval id now so the first webhook matches by
    // provider_reference even if external_reference is absent from the payload.
    const admin = getSupabaseServiceRoleClient();
    await admin.from("subscriptions").update({ provider_reference: created.id, provider: "mercadopago", plan, updated_at: new Date().toISOString() }).eq("user_id", userId);
    return { ok: true as const, url: created.initPoint, external: true };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : "Checkout could not be started." };
  }
}

export async function cancelSubscription(userId: string) {
  const config = mercadoPagoConfig();
  const user = await getUser(userId);
  if (!user) return { ok: false as const, message: "Sign in required." };
  const reference = user.subscription.providerReference;
  if (!reference || user.subscription.provider !== "mercadopago") return { ok: false as const, message: "There is no active Mercado Pago subscription to cancel." };
  if (!config.ready) return { ok: false as const, message: "Payments are not enabled on this server yet." };
  try {
    await cancelPreapproval(config.accessToken, reference);
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : "Cancellation failed at Mercado Pago." };
  }
  // Apply the same transition the webhook will confirm: access continues to
  // the end of the paid period. The webhook redelivery is idempotent.
  const transition = applyBillingEvent(user.subscription, { type: "cancelled" });
  if (transition.applied) {
    const admin = getSupabaseServiceRoleClient();
    const { error } = await admin.from("subscriptions").update(subscriptionToRow(transition.subscription)).eq("user_id", userId);
    if (error) return { ok: false as const, message: error.message };
  }
  return { ok: true as const };
}

export async function grantAccess(actorId: string, targetId: string) {
  const actor = await getUser(actorId);
  if (actor?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const admin = getSupabaseServiceRoleClient();
  const { error } = await admin
    .from("subscriptions")
    .update({ status: "exceptional_access", access_until: plusDays(new Date(), 30), updated_at: new Date().toISOString() })
    .eq("user_id", targetId);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, users: await listUsers() };
}

export async function saveTerm(actorId: string, term: Term) {
  const actor = await getUser(actorId);
  if (actor?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const id = term.id || `TERM-${Date.now()}`;
  const supabase = await getSupabaseServerClient();
  // Audio paths are owned by /api/admin/audio (see AUDIO_BUCKET above), not
  // this general-purpose editor. The term object the client is holding may
  // have a signed, expiring URL sitting in audioUsPath/audioUkPath (that's
  // what listTerms() hands the browser for playback) — persisting it here
  // would silently replace the stable storage path with a link that stops
  // working in 30 minutes. For an existing term, always keep whatever is
  // already in the database for those two columns; a brand new term has
  // nothing to clobber yet, so the incoming value (usually empty) is fine.
  const { data: existingRow } = await supabase.from("terms").select("audio_us_path, audio_uk_path").eq("id", id).maybeSingle();
  const audioUsPath = existingRow ? String(existingRow.audio_us_path ?? "") : term.audioUsPath;
  const audioUkPath = existingRow ? String(existingRow.audio_uk_path ?? "") : term.audioUkPath;
  const toSave = { ...term, id, audioUsPath, audioUkPath };
  if (toSave.published) {
    const blockers = publicationBlockers(toSave);
    if (blockers.length) return { ok: false as const, message: blockers[0] };
  }
  const { error: termError } = await supabase.from("terms").upsert(termToRow(toSave));
  if (termError) return { ok: false as const, message: termError.message };
  if (term.quiz) {
    const { error: quizError } = await supabase.from("quiz_items").upsert(quizToRow(term.quiz, id));
    if (quizError) return { ok: false as const, message: quizError.message };
  }
  return { ok: true as const, terms: await listTerms(true) };
}

export async function setPublished(actorId: string, termId: string, published: boolean) {
  const actor = await getUser(actorId);
  if (actor?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const supabase = await getSupabaseServerClient();
  const { data: row } = await supabase.from("terms").select("*, quiz_items(*)").eq("id", termId).maybeSingle();
  if (!row) return { ok: false as const, message: "Term not found." };
  const term = rowToTerm(row as TermRow);
  if (published && !canPublish(term)) return { ok: false as const, message: publicationBlockers(term)[0] };
  const { error } = await supabase
    .from("terms")
    .update({ published, archived_at: published ? null : row.archived_at, updated_at: new Date().toISOString() })
    .eq("id", termId);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, terms: await listTerms(true) };
}

export async function setArchived(actorId: string, termId: string, archived: boolean) {
  const actor = await getUser(actorId);
  if (actor?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("terms")
    .update({ archived_at: archived ? new Date().toISOString() : null, published: archived ? false : undefined, updated_at: new Date().toISOString() })
    .eq("id", termId);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, terms: await listTerms(true) };
}

export async function deleteTerm(actorId: string, termId: string) {
  const actor = await getUser(actorId);
  if (actor?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const supabase = await getSupabaseServerClient();
  const { data: row } = await supabase.from("terms").select("published").eq("id", termId).maybeSingle();
  if (!row) return { ok: false as const, message: "Term not found." };
  if (row.published) return { ok: false as const, message: "Archive the term before deleting it." };
  // quiz_items and user_term_progress cascade via FK; the "admins delete
  // terms" RLS policy also re-checks not published as a backstop.
  const { error } = await supabase.from("terms").delete().eq("id", termId);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, terms: await listTerms(true) };
}

export async function replaceTerms(actorId: string, terms: Term[]) {
  const actor = await getUser(actorId);
  if (actor?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const supabase = await getSupabaseServerClient();
  const current = await listTerms(true);
  const touchedIds = terms.map((term) => term.id);
  const incomingIds = new Set(touchedIds);
  const missing = current.filter((term) => !incomingIds.has(term.id)).map((term) => term.id);

  // Snapshot the exact pre-import DB rows for every touched TermID before
  // writing anything, so rollback_import_run() can restore them later —
  // MCD Delivery Mapping §7's "reconciliar los IDs y counts" evidence.
  const [{ data: beforeTerms }, { data: beforeQuizItems }] = await Promise.all([
    supabase.from("terms").select("*").in("id", touchedIds),
    supabase.from("quiz_items").select("*").in("term_id", touchedIds),
  ]);
  const { data: run, error: runError } = await supabase
    .from("import_runs")
    .insert({
      actor_id: actorId,
      touched_term_ids: touchedIds,
      before_terms: beforeTerms ?? [],
      before_quiz_items: beforeQuizItems ?? [],
      missing_term_ids: missing,
    })
    .select("id")
    .single();
  if (runError || !run) return { ok: false as const, message: runError?.message || "Could not record the import run." };

  // A single RPC call: both tables commit together or neither does. See
  // 002_import_and_audio.sql's import_terms_batch — this replaces a
  // per-row upsert loop that could previously leave a batch half-applied.
  const termsPayload = terms.map((term) => termToRow(term));
  const quizPayload = terms.filter((term) => term.quiz).map((term) => quizToRow(term.quiz!, term.id));
  const { data, error } = await supabase.rpc("import_terms_batch", {
    terms_payload: termsPayload,
    quiz_payload: quizPayload,
  });
  if (error) return { ok: false as const, message: error.message };

  const inserted = (data ?? []).filter((row: { action: string }) => row.action === "insert").length;
  const updated = (data ?? []).filter((row: { action: string }) => row.action === "update").length;
  await supabase.from("import_runs").update({ inserted_count: inserted, updated_count: updated }).eq("id", run.id);

  return { ok: true as const, terms: await listTerms(true), missing, inserted, updated, importRunId: run.id as string };
}

export async function rollbackImportRun(actorId: string, runId: string) {
  const actor = await getUser(actorId);
  if (actor?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("rollback_import_run", { run_id: runId });
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, terms: await listTerms(true), result: data as { restoredTerms: number; deletedTerms: number } };
}

/* ---- Visitor insights (anonymous page views + Web Vitals) ---------------- */

/**
 * Written through the service role: the beacon is sent by anonymous
 * visitors, so there is no user session to write under. RLS on the table
 * therefore only needs a read policy for the Owner (see 006_insights.sql).
 */
export async function recordInsights(events: InsightEvent[]) {
  if (!events.length) return { ok: true as const };
  const admin = getSupabaseServiceRoleClient();
  const rows = events.map((event) => ({
    kind: event.kind,
    path: event.path,
    locale: event.locale,
    device: event.device,
    sid: event.sid,
    name: event.name ?? null,
    value: event.value ?? null,
    at: event.at,
  }));
  const { error } = await admin.from("insights").insert(rows);
  if (error) return { ok: false as const, message: error.message };
  // Opportunistic retention sweep (cheap: indexed on `at`).
  const cutoff = new Date(Date.now() - INSIGHTS_RETENTION_DAYS * 86_400_000).toISOString();
  await admin.from("insights").delete().lt("at", cutoff);
  return { ok: true as const };
}

export async function insightSummary(actorId: string, days = 14) {
  const admin = getSupabaseServiceRoleClient();
  const { data: actor } = await admin.from("users").select("role").eq("id", actorId).maybeSingle();
  if (actor?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data, error } = await admin.from("insights").select("kind, path, locale, device, sid, name, value, at").gte("at", since).limit(50_000);
  if (error) return { ok: false as const, message: error.message };
  const events = (data ?? []).map((row) => ({
    kind: row.kind as InsightEvent["kind"],
    path: String(row.path),
    locale: row.locale as InsightEvent["locale"],
    device: row.device as InsightEvent["device"],
    sid: String(row.sid),
    name: (row.name ?? undefined) as InsightEvent["name"],
    value: row.value === null ? undefined : Number(row.value),
    at: new Date(String(row.at)).toISOString(),
  }));
  return { ok: true as const, summary: summarizeInsights(events, days) };
}

export async function metrics() {
  const supabase = await getSupabaseServerClient();
  const [{ count: terms }, { count: published }, { count: quizzes }, { count: learners }, { data: activeSubs }] = await Promise.all([
    supabase.from("terms").select("id", { count: "exact", head: true }),
    supabase.from("terms").select("id", { count: "exact", head: true }).eq("published", true).is("archived_at", null),
    supabase.from("quiz_items").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "learner"),
    supabase.from("subscriptions").select("status, trial_ends_at, access_until"),
  ]);
  const now = new Date();
  const activeAccess = (activeSubs ?? []).filter((row) => entitlementFor(rowToSubscription(row), now).allowed).length;
  return {
    terms: terms ?? 0,
    published: published ?? 0,
    drafts: (terms ?? 0) - (published ?? 0),
    quizzes: quizzes ?? 0,
    learners: learners ?? 0,
    activeAccess,
  };
}

/**
 * Panel export (RFP §4/§6: "respaldo, exportación... demostrados"). Covers
 * everything the Propuesta committed to — terms, quizzes, users, progress,
 * entitlement state. Does not include Storage binaries (audio files): those
 * are covered separately by Supabase's own daily backup, not this export.
 */
export async function exportSnapshot(actorId: string) {
  const actor = await getUser(actorId);
  if (actor?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const supabase = await getSupabaseServerClient();
  const [{ data: terms }, { data: quizItems }, { data: users }, { data: subscriptions }, { data: progress }] = await Promise.all([
    supabase.from("terms").select("*"),
    supabase.from("quiz_items").select("*"),
    supabase.from("users").select("id, email, full_name, role, disabled_at, created_at"),
    supabase.from("subscriptions").select("*"),
    supabase.from("user_term_progress").select("*"),
  ]);
  return {
    ok: true as const,
    snapshot: {
      exportedAt: new Date().toISOString(),
      note: "Audio files in Supabase Storage are not included here — they're covered by Supabase's own daily backup, not this export.",
      terms: terms ?? [],
      quizItems: quizItems ?? [],
      users: users ?? [],
      subscriptions: subscriptions ?? [],
      progress: progress ?? [],
    },
  };
}

export async function resetStore() {
  throw new Error("resetStore is an alpha-only convenience. Production data resets go through Supabase, not the app.");
}
