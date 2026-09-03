import * as alphaStore from "./store";
import * as productionStore from "./store.supabase";
import type { Mail, Plan, Progress, PublicUser, Term } from "./types";

// "alpha" = local JSON file, no external services (default, matches
// .env.example, always runnable with `npm run dev` and no credentials).
// "production" = Supabase Auth + Postgres/RLS. Every API route imports
// `store` from here instead of "./store" directly, so this is the one place
// that decides which backend answers a request.
export const DATA_MODE: "alpha" | "production" = process.env.NEXT_PUBLIC_DATA_MODE === "production" ? "production" : "alpha";

// The two implementations are intentionally not structurally identical in
// every return type (e.g. applyBilling's alpha simulator vs. the production
// version, which always refuses — see store.supabase.ts). This interface
// captures the args and the {ok,message} control-flow contract every route
// actually relies on; payload shapes beyond that are typed loosely on
// purpose rather than forcing two different backends into one rigid shape.
export interface Store {
  currentUserId(): Promise<string | null>;
  getUser(id: string): Promise<PublicUser | null>;
  authenticate(email: string, password: string): Promise<{ ok: true; user: PublicUser } | { ok: false; message: string }>;
  register(
    name: string,
    email: string,
    password: string,
    privacyAccepted: boolean
  ): Promise<{ ok: true; user: PublicUser; code?: string; sessionEstablished: boolean } | { ok: false; message: string }>;
  verifyEmail(email: string, code: string): Promise<{ ok: boolean; message?: string }>;
  requestReset(email: string): Promise<{ ok: true }>;
  resetPassword(email: string, code: string, password: string): Promise<{ ok: boolean; message?: string }>;
  inboxFor(email: string): Promise<Mail[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateProfile(userId: string, name: string): Promise<any>;
  changeOwnPassword(userId: string, currentPassword: string, nextPassword: string): Promise<{ ok: boolean; message?: string }>;
  deleteAccount(userId: string): Promise<{ ok: boolean; message?: string }>;
  deactivateAccount(userId: string): Promise<{ ok: boolean; message?: string }>;
  reactivateAccount(userId: string): Promise<{ ok: boolean; message?: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reportIssue(userId: string, summary: string, detail: string): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bootstrap(userId: string | null): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openTerm(userId: string, termId: string): Promise<any>;
  toggleFavourite(userId: string, termId: string): Promise<Progress[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submitQuiz(userId: string, termId: string, option: string): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applyBilling(userId: string, event: string, plan?: Plan): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  grantAccess(actorId: string, targetId: string): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveTerm(actorId: string, term: Term): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setPublished(actorId: string, termId: string, published: boolean): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setArchived(actorId: string, termId: string, archived: boolean): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteTerm(actorId: string, termId: string): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replaceTerms(actorId: string, terms: Term[]): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rollbackImportRun(actorId: string, runId: string): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metrics(): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exportSnapshot(actorId: string): Promise<any>;
  resetStore(): Promise<unknown>;
}

export const store: Store = (DATA_MODE === "production" ? productionStore : alphaStore) as unknown as Store;
