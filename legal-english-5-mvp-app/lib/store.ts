import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { cookies } from "next/headers";
import { join } from "path";
import { AUDIO_MIME, extensionOf, type AudioJurisdiction } from "./audio-naming";
import { applyBillingEvent, freshTrial, normalizeEventType, type BillingEvent } from "./billing-state";
import { ALPHA_SESSION_COOKIE, hashPassword, oneTimeCode, readSession, verifyPassword } from "./crypto";
import { entitlementFor } from "./entitlement";
import { canPublish, publicationBlockers } from "./publication";
import type { Mail, Plan, Progress, PublicUser, Subscription, Term, User } from "./types";

type ImportRun = {
  id: string;
  actorId: string;
  createdAt: string;
  touchedTermIds: string[];
  beforeTerms: Term[];
  missingTermIds: string[];
  inserted: number;
  updated: number;
  status: "committed" | "rolled_back";
  rolledBackAt: string | null;
};

type StoreData = { users: User[]; terms: Term[]; progress: Progress[]; inbox: Mail[]; importRuns?: ImportRun[] };

const DIR = join(process.cwd(), "data");
const FILE = join(DIR, "alpha-store.json");

function plusDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86400000).toISOString();
}

function trial(date = new Date()): Subscription {
  return freshTrial(date);
}

function publicUser(user: User): PublicUser {
  const { passwordHash: _omit, ...rest } = user;
  return rest;
}

function makeUser(
  partial: Omit<User, "passwordHash" | "createdAt" | "subscription" | "emailVerified" | "disabledAt" | "privacyAcceptedAt"> & {
    password: string;
    subscription?: Subscription;
    emailVerified?: boolean;
    privacyAccepted?: boolean;
  }
): User {
  return {
    id: partial.id,
    name: partial.name,
    email: partial.email,
    role: partial.role,
    passwordHash: hashPassword(partial.password),
    emailVerified: partial.emailVerified ?? true,
    createdAt: new Date().toISOString(),
    subscription: partial.subscription ?? trial(),
    disabledAt: null,
    privacyAcceptedAt: partial.privacyAccepted ? new Date().toISOString() : null,
  };
}

function initial(): StoreData {
  const now = new Date();
  const pilar = makeUser({
    id: "owner-pilar",
    name: "Pilar Cruz",
    email: "pilar@mpclaw.studio",
    role: "admin",
    password: "Pilar#Alpha26",
    subscription: { ...trial(now), status: "exceptional_access", accessUntil: plusDays(now, 3650) },
  });
  const maria = makeUser({
    id: "learner-maria",
    name: "Maria Restrepo",
    email: "maria@legalenglish5.test",
    role: "learner",
    password: "Maria#Alpha26",
  });
  const andres = makeUser({
    id: "learner-andres",
    name: "Andres Molina",
    email: "andres@legalenglish5.test",
    role: "learner",
    password: "Andres#Alpha26",
  });
  const seed = JSON.parse(readFileSync(join(DIR, "mcd-seed.json"), "utf8")) as { terms: Term[] };
  const terms = seed.terms.map((term) => ({ ...term, quiz: term.quiz ?? null }));
  const progress: Progress[] = [
    { userId: maria.id, termId: "CORP-005", favourite: true, state: "mastered", attempts: 1, updatedAt: now.toISOString() },
    { userId: maria.id, termId: "CON-001", favourite: false, state: "learning", attempts: 1, updatedAt: now.toISOString() },
    { userId: andres.id, termId: "EMP-001", favourite: true, state: "mastered", attempts: 2, updatedAt: now.toISOString() },
    { userId: andres.id, termId: "CON-010", favourite: false, state: "learning", attempts: 0, updatedAt: now.toISOString() },
  ];
  return {
    users: [pilar, maria, andres],
    terms,
    progress,
    inbox: [
      {
        id: "mail-welcome",
        to: pilar.email,
        subject: "Legal English 5 · Owner console is ready",
        body: "This Alpha Inbox will become Resend in production. Verification and recovery codes appear here during the review.",
        createdAt: now.toISOString(),
      },
    ],
  };
}

function load(): StoreData {
  if (!existsSync(FILE)) {
    if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
    const created = initial();
    writeFileSync(FILE, JSON.stringify(created, null, 2));
    return created;
  }
  return JSON.parse(readFileSync(FILE, "utf8")) as StoreData;
}

function save(data: StoreData) {
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function mail(data: StoreData, to: string, subject: string, body: string, code?: string) {
  data.inbox.unshift({ id: `mail-${Date.now()}`, to, subject, body, code, createdAt: new Date().toISOString() });
}

export async function resetStore() {
  const created = initial();
  save(created);
  return created;
}

export async function currentUserId() {
  const jar = await cookies();
  return readSession(jar.get(ALPHA_SESSION_COOKIE)?.value);
}

export async function getUser(id: string) {
  return load().users.find((user) => user.id === id) ?? null;
}

export async function authenticate(email: string, password: string) {
  const user = load().users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) return { ok: false as const, message: "Email or password is incorrect." };
  return { ok: true as const, user: publicUser(user) };
}

export async function register(name: string, email: string, password: string, privacyAccepted: boolean) {
  if (!privacyAccepted) {
    return { ok: false as const, message: "You must accept the data processing notice to continue." };
  }
  const data = load();
  if (data.users.some((user) => user.email.toLowerCase() === email.trim().toLowerCase())) {
    return { ok: false as const, message: "An account already uses this email." };
  }
  const code = oneTimeCode();
  const user = makeUser({
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: "learner",
    password,
    emailVerified: false,
    privacyAccepted: true,
  });
  data.users.push(user);
  mail(data, user.email, "Verify your Legal English 5 account", `Your verification code is ${code}. The seven-day trial has already started.`, code);
  save(data);
  return { ok: true as const, user: publicUser(user), code, sessionEstablished: true };
}

export async function verifyEmail(email: string, code: string) {
  const data = load();
  const user = data.users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
  const match = data.inbox.find((item) => item.to === user?.email && item.code === code.trim());
  if (!user || !match) return { ok: false as const, message: "That verification code is not valid." };
  data.users = data.users.map((item) => (item.id === user.id ? { ...item, emailVerified: true } : item));
  save(data);
  return { ok: true as const };
}

export async function requestReset(email: string) {
  const data = load();
  const user = data.users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return { ok: true as const };
  const code = oneTimeCode();
  mail(data, user.email, "Reset your Legal English 5 password", `Use code ${code} to choose a new password.`, code);
  save(data);
  return { ok: true as const };
}

export async function resetPassword(email: string, code: string, password: string) {
  const data = load();
  const user = data.users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
  const match = data.inbox.find((item) => item.to === user?.email && item.code === code.trim());
  if (!user || !match) return { ok: false as const, message: "Reset code is invalid." };
  data.users = data.users.map((item) => (item.id === user.id ? { ...item, passwordHash: hashPassword(password) } : item));
  save(data);
  return { ok: true as const };
}

export async function inboxFor(email: string) {
  return load().inbox.filter((item) => item.to === email).slice(0, 8);
}

export async function updateProfile(userId: string, name: string) {
  const data = load();
  const user = data.users.find((item) => item.id === userId);
  if (!user) return { ok: false as const, message: "Sign in required." };
  const next = name.trim();
  if (next.length < 2) return { ok: false as const, message: "Enter your full name." };
  user.name = next;
  save(data);
  return { ok: true as const, user: publicUser(user), entitlement: entitlementFor(user.subscription) };
}

export async function changeOwnPassword(userId: string, currentPassword: string, nextPassword: string) {
  const data = load();
  const user = data.users.find((item) => item.id === userId);
  if (!user) return { ok: false as const, message: "Sign in required." };
  if (!verifyPassword(currentPassword, user.passwordHash)) return { ok: false as const, message: "Current password is incorrect." };
  if (nextPassword.trim().length < 8) return { ok: false as const, message: "Use at least 8 characters." };
  user.passwordHash = hashPassword(nextPassword);
  save(data);
  return { ok: true as const };
}

export async function deleteAccount(userId: string) {
  const data = load();
  const user = data.users.find((item) => item.id === userId);
  if (!user) return { ok: false as const, message: "Sign in required." };
  const remainingAdmins = data.users.filter((item) => item.role === "admin" && item.id !== userId);
  if (user.role === "admin" && remainingAdmins.length === 0) {
    return { ok: false as const, message: "The last Owner account cannot be deleted." };
  }
  data.users = data.users.filter((item) => item.id !== userId);
  data.progress = data.progress.filter((item) => item.userId !== userId);
  save(data);
  return { ok: true as const };
}

export async function deactivateAccount(userId: string) {
  const data = load();
  const user = data.users.find((item) => item.id === userId);
  if (!user) return { ok: false as const, message: "Sign in required." };
  user.disabledAt = new Date().toISOString();
  save(data);
  return { ok: true as const };
}

export async function reactivateAccount(userId: string) {
  const data = load();
  const user = data.users.find((item) => item.id === userId);
  if (!user) return { ok: false as const, message: "Sign in required." };
  user.disabledAt = null;
  save(data);
  return { ok: true as const };
}

export async function reportIssue(userId: string, summary: string, detail: string) {
  const data = load();
  const user = data.users.find((item) => item.id === userId);
  if (!user) return { ok: false as const, message: "Sign in required." };
  const title = summary.trim();
  const body = detail.trim();
  if (title.length < 3 || body.length < 8) return { ok: false as const, message: "Add a short title and the steps to reproduce." };
  const owners = data.users.filter((item) => item.role === "admin");
  const payload = `${user.name} <${user.email}>\nRole: ${user.role}\n\n${body}`;
  for (const owner of owners) {
    mail(data, owner.email, `Incidence · ${title}`, payload);
  }
  mail(data, user.email, `Copy of your report · ${title}`, "The Owner received this incidence. You will get a reply on this account email.");
  save(data);
  return { ok: true as const, inbox: await inboxFor(user.email) };
}

export async function bootstrap(userId: string | null) {
  const data = load();
  const user = userId ? data.users.find((item) => item.id === userId) ?? null : null;
  if (!user) return { session: null, terms: [], progress: [], users: [], inbox: [], entitlement: entitlementFor(trial()) };
  const isAdmin = user.role === "admin";
  const terms = isAdmin ? data.terms : data.terms.filter((term) => term.published && !term.archived);
  const progress = isAdmin ? data.progress : data.progress.filter((item) => item.userId === user.id);
  return {
    session: { user: publicUser(user), subscription: user.subscription },
    terms,
    progress,
    users: isAdmin ? data.users.map(publicUser) : [],
    inbox: await inboxFor(user.email),
    entitlement: entitlementFor(user.subscription),
  };
}

export async function openTerm(userId: string, termId: string) {
  const data = load();
  const user = data.users.find((item) => item.id === userId);
  if (!user) return { ok: false as const, message: "Sign in required." };
  if (user.disabledAt) return { ok: false as const, message: "This account is deactivated." };
  if (!entitlementFor(user.subscription).allowed && user.role !== "admin") return { ok: false as const, message: "Access is not active." };
  const existing = data.progress.find((item) => item.userId === userId && item.termId === termId);
  if (!existing) {
    data.progress.push({ userId, termId, favourite: false, state: "learning", attempts: 0, updatedAt: new Date().toISOString() });
    save(data);
  } else if (existing.state === "new") {
    existing.state = "learning";
    existing.updatedAt = new Date().toISOString();
    save(data);
  }
  return { ok: true as const, progress: data.progress.filter((item) => item.userId === userId) };
}

export async function toggleFavourite(userId: string, termId: string) {
  const data = load();
  const current = data.progress.find((item) => item.userId === userId && item.termId === termId);
  if (current) current.favourite = !current.favourite;
  else data.progress.push({ userId, termId, favourite: true, state: "learning", attempts: 0, updatedAt: new Date().toISOString() });
  save(data);
  return data.progress.filter((item) => item.userId === userId);
}

export async function submitQuiz(userId: string, termId: string, option: string) {
  const data = load();
  const user = data.users.find((item) => item.id === userId);
  const term = data.terms.find((item) => item.id === termId);
  if (!user || !term?.quiz) return { ok: false as const, message: "Quiz unavailable." };
  if (user.disabledAt) return { ok: false as const, message: "This account is deactivated." };
  if (!entitlementFor(user.subscription).allowed && user.role !== "admin") return { ok: false as const, message: "Access is not active." };
  const correct = term.quiz.correctOption === option || term.quiz.options[term.quiz.correctOption.charCodeAt(0) - 65] === option;
  const current = data.progress.find((item) => item.userId === userId && item.termId === termId);
  const next: Progress = {
    userId,
    termId,
    favourite: current?.favourite ?? false,
    state: correct ? "mastered" : "learning",
    attempts: (current?.attempts ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  };
  data.progress = [...data.progress.filter((item) => !(item.userId === userId && item.termId === termId)), next];
  save(data);
  return { ok: true as const, correct, message: term.quiz.explanation, progress: data.progress.filter((item) => item.userId === userId) };
}

export async function applyBilling(userId: string, event: string, plan?: Plan) {
  const data = load();
  const user = data.users.find((item) => item.id === userId);
  if (!user) return { ok: false as const, message: "Sign in required." };
  const type = normalizeEventType(event);
  if (!type) return { ok: false as const, message: `Unknown billing event "${event}".` };
  // The alpha simulator stands in for the Mercado Pago webhook: same reducer,
  // same access outcome, only the event source differs.
  const stamp = Date.now();
  const billingEvent: BillingEvent =
    type === "payment_approved"
      ? { type, plan, paymentId: `mp_alpha_pay_${stamp}`, providerReference: user.subscription.providerReference ?? `mp_alpha_sub_${stamp}` }
      : type === "payment_rejected" || type === "retries_exhausted"
        ? { type, paymentId: `mp_alpha_pay_${stamp}` }
        : { type };
  const transition = applyBillingEvent(user.subscription, billingEvent);
  if (!transition.applied) return { ok: false as const, message: transition.reason || "Event ignored." };
  user.subscription = transition.subscription;
  save(data);
  return { ok: true as const, user: publicUser(user), entitlement: entitlementFor(user.subscription) };
}

export async function grantAccess(actorId: string, targetId: string) {
  const data = load();
  const actor = data.users.find((item) => item.id === actorId);
  if (actor?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  data.users = data.users.map((user) =>
    user.id === targetId
      ? { ...user, subscription: { ...user.subscription, status: "exceptional_access", accessUntil: plusDays(new Date(), 30) } }
      : user
  );
  save(data);
  return { ok: true as const, users: data.users.map(publicUser) };
}

export async function saveTerm(actorId: string, term: Term) {
  const data = load();
  if (data.users.find((item) => item.id === actorId)?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const updated = { ...term, id: term.id || `TERM-${Date.now()}` };
  if (updated.published) {
    const blockers = publicationBlockers(updated);
    if (blockers.length) return { ok: false as const, message: blockers[0] };
  }
  data.terms = [...data.terms.filter((item) => item.id !== updated.id), updated];
  save(data);
  return { ok: true as const, terms: data.terms };
}

export async function setPublished(actorId: string, termId: string, published: boolean) {
  const data = load();
  if (data.users.find((item) => item.id === actorId)?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const term = data.terms.find((item) => item.id === termId);
  if (!term) return { ok: false as const, message: "Term not found." };
  if (published && !canPublish(term)) return { ok: false as const, message: publicationBlockers(term)[0] };
  term.published = published;
  if (published) term.archived = false;
  save(data);
  return { ok: true as const, terms: data.terms };
}

export async function setArchived(actorId: string, termId: string, archived: boolean) {
  const data = load();
  if (data.users.find((item) => item.id === actorId)?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  data.terms = data.terms.map((term) => (term.id === termId ? { ...term, archived, published: archived ? false : term.published } : term));
  save(data);
  return { ok: true as const, terms: data.terms };
}

export async function deleteTerm(actorId: string, termId: string) {
  const data = load();
  if (data.users.find((item) => item.id === actorId)?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const term = data.terms.find((item) => item.id === termId);
  if (!term) return { ok: false as const, message: "Term not found." };
  if (term.published) return { ok: false as const, message: "Archive the term before deleting it." };
  data.terms = data.terms.filter((item) => item.id !== termId);
  data.progress = data.progress.filter((item) => item.termId !== termId);
  save(data);
  return { ok: true as const, terms: data.terms };
}

export async function replaceTerms(actorId: string, terms: Term[]) {
  const data = load();
  if (data.users.find((item) => item.id === actorId)?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const byId = new Map(data.terms.map((term) => [term.id, term]));
  const incomingIds = new Set(terms.map((term) => term.id));
  const missing = data.terms.filter((term) => !incomingIds.has(term.id)).map((term) => term.id);
  // Snapshot every touched TermID before writing so the run can be undone
  // exactly (Delivery Mapping §7: restore previous batch snapshot and show
  // equivalent counts/IDs).
  const touched = terms.map((term) => term.id);
  const before = data.terms.filter((term) => incomingIds.has(term.id)).map((term) => structuredClone(term));
  let inserted = 0;
  let updated = 0;
  for (const incoming of terms) {
    const current = byId.get(incoming.id);
    if (current) updated += 1;
    else inserted += 1;
    byId.set(incoming.id, {
      ...current,
      ...incoming,
      // App-owned fields survive a reimport: publication and uploaded audio.
      published: current?.published ?? false,
      audioUsPath: current?.audioUsPath || incoming.audioUsPath || "",
      audioUkPath: current?.audioUkPath || incoming.audioUkPath || "",
    });
  }
  data.terms = [...byId.values()].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const run: ImportRun = {
    id: `run-${Date.now()}`,
    actorId,
    createdAt: new Date().toISOString(),
    touchedTermIds: touched,
    beforeTerms: before,
    missingTermIds: missing,
    inserted,
    updated,
    status: "committed",
    rolledBackAt: null,
  };
  data.importRuns = [run, ...(data.importRuns ?? [])].slice(0, 20);
  save(data);
  return { ok: true as const, terms: data.terms, missing, inserted, updated, importRunId: run.id };
}

export async function rollbackImportRun(actorId: string, runId: string) {
  const data = load();
  if (data.users.find((item) => item.id === actorId)?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const run = (data.importRuns ?? []).find((item) => item.id === runId);
  if (!run) return { ok: false as const, message: `Import run ${runId} not found.` };
  if (run.status === "rolled_back") return { ok: false as const, message: "This import was already rolled back." };
  const restoredIds = new Set(run.beforeTerms.map((term) => term.id));
  const touched = new Set(run.touchedTermIds);
  // Terms the run created did not exist before it: remove them. Terms it
  // updated: put the snapshot back. Everything else is untouched.
  const kept = data.terms.filter((term) => !touched.has(term.id));
  data.terms = [...kept, ...run.beforeTerms.map((term) => structuredClone(term))].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const deletedIds = run.touchedTermIds.filter((id) => !restoredIds.has(id));
  data.progress = data.progress.filter((item) => !deletedIds.includes(item.termId));
  run.status = "rolled_back";
  run.rolledBackAt = new Date().toISOString();
  save(data);
  return { ok: true as const, terms: data.terms, restoredTerms: run.beforeTerms.length, deletedTerms: deletedIds.length };
}

export async function listImportRuns(actorId: string) {
  const data = load();
  if (data.users.find((item) => item.id === actorId)?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  return {
    ok: true as const,
    runs: (data.importRuns ?? []).map(({ beforeTerms: _omit, ...run }) => ({ ...run, snapshotSize: _omit.length })),
  };
}

// ---------------------------------------------------------------------
// Alpha audio storage: files live under data/audio/{TermID}/{us|uk}.{ext}
// and are served only through /api/media (session + entitlement checked).
// Production swaps this for Supabase Storage with signed URLs; the path
// convention and the Term fields are identical.
// ---------------------------------------------------------------------
const AUDIO_DIR = join(DIR, "audio");

function audioFilesFor(termId: string, jurisdiction: AudioJurisdiction) {
  const folder = join(AUDIO_DIR, termId);
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((name) => name.startsWith(`${jurisdiction}.`))
    .map((name) => join(folder, name));
}

export function audioFile(termId: string, jurisdiction: AudioJurisdiction) {
  const [file] = audioFilesFor(termId, jurisdiction);
  if (!file) return null;
  const extension = extensionOf(file);
  return { path: file, contentType: extension ? AUDIO_MIME[extension] : "application/octet-stream" };
}

export function mediaUrl(termId: string, jurisdiction: AudioJurisdiction) {
  return `/api/media/${termId}/${jurisdiction}`;
}

export async function saveAudio(actorId: string, termId: string, jurisdiction: AudioJurisdiction, bytes: Buffer, extension: string) {
  const data = load();
  if (data.users.find((item) => item.id === actorId)?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const term = data.terms.find((item) => item.id === termId);
  if (!term) return { ok: false as const, message: `TermID ${termId} does not exist; upload rejected.` };
  const folder = join(AUDIO_DIR, termId);
  mkdirSync(folder, { recursive: true });
  for (const previous of audioFilesFor(termId, jurisdiction)) rmSync(previous, { force: true });
  writeFileSync(join(folder, `${jurisdiction}.${extension}`), bytes);
  const url = mediaUrl(termId, jurisdiction);
  if (jurisdiction === "us") term.audioUsPath = url;
  else term.audioUkPath = url;
  save(data);
  return { ok: true as const, terms: data.terms, path: url };
}

export async function removeAudio(actorId: string, termId: string, jurisdiction: AudioJurisdiction) {
  const data = load();
  if (data.users.find((item) => item.id === actorId)?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  const term = data.terms.find((item) => item.id === termId);
  if (!term) return { ok: false as const, message: "Term not found." };
  for (const previous of audioFilesFor(termId, jurisdiction)) rmSync(previous, { force: true });
  if (jurisdiction === "us") term.audioUsPath = "";
  else term.audioUkPath = "";
  // Losing the asset re-applies the publication gate; a published Term
  // without AudioUS goes back to draft instead of playing silence.
  if (term.published && !canPublish(term)) term.published = false;
  save(data);
  return { ok: true as const, terms: data.terms };
}

export async function metrics() {
  const data = load();
  return {
    terms: data.terms.length,
    published: data.terms.filter((term) => term.published && !term.archived).length,
    drafts: data.terms.filter((term) => !term.published && !term.archived).length,
    quizzes: data.terms.filter((term) => term.quiz).length,
    learners: data.users.filter((user) => user.role === "learner").length,
    activeAccess: data.users.filter((user) => entitlementFor(user.subscription).allowed).length,
  };
}

export async function exportSnapshot(actorId: string) {
  const data = load();
  if (data.users.find((item) => item.id === actorId)?.role !== "admin") return { ok: false as const, message: "Owner access required." };
  return {
    ok: true as const,
    snapshot: {
      exportedAt: new Date().toISOString(),
      note: "Alpha export: snapshot of the local JSON store. Production mode exports the live database instead.",
      terms: data.terms,
      users: data.users.map(publicUser),
      progress: data.progress,
    },
  };
}
