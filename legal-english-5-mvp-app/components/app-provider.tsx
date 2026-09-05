"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { useToast } from "@/components/toaster";
import type { BillingEventType } from "@/lib/billing-state";
import { learnerText } from "@/lib/learner-copy";
import type { BillingRecord, Entitlement, Mail, Plan, Progress, PublicUser, SessionPayload, SubscriptionStatus, Term } from "@/lib/types";

export type AudioUploadResult = { file: string; termId?: string; jurisdiction?: "us" | "uk"; status: "stored" | "rejected"; message: string };

type Result = {
  ok: boolean;
  message?: string;
  code?: string;
  correct?: boolean;
  needsConfirmation?: boolean;
  inserted?: number;
  updated?: number;
  missing?: string[];
  importRunId?: string;
};
type Ctx = {
  ready: boolean;
  session: SessionPayload | null;
  terms: Term[];
  publishedTerms: Term[];
  progress: Record<string, Progress>;
  progressRows: Progress[];
  users: PublicUser[];
  inbox: Mail[];
  entitlement: Entitlement;
  billingHistory: BillingRecord[];
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (name: string, email: string, password: string, privacyAccepted: boolean) => Promise<Result>;
  signOut: () => Promise<void>;
  verify: (email: string, code: string) => Promise<Result>;
  forgot: (email: string) => Promise<Result>;
  resetPassword: (email: string, code: string, password: string) => Promise<Result>;
  openTerm: (id: string) => Promise<void>;
  toggleFavourite: (id: string) => Promise<void>;
  submitQuiz: (id: string, option: string) => Promise<Result>;
  applyBilling: (event: BillingEventType, plan?: Plan) => Promise<Result>;
  saveTerm: (term: Term) => Promise<Result>;
  uploadAudio: (termId: string, jurisdiction: "us" | "uk", file: File) => Promise<Result>;
  uploadAudioBatch: (files: File[]) => Promise<Result & { results?: AudioUploadResult[] }>;
  removeAudio: (termId: string, jurisdiction: "us" | "uk") => Promise<Result>;
  setPublished: (id: string, published: boolean) => Promise<Result>;
  setArchived: (id: string, archived: boolean) => Promise<Result>;
  deleteTerm: (id: string) => Promise<Result>;
  grantAccess: (id: string) => Promise<void>;
  previewImport: (file: File) => Promise<{ ok: boolean; preview?: ImportPreview; message?: string }>;
  commitImport: (terms: Term[]) => Promise<Result>;
  rollbackImport: (importRunId: string) => Promise<Result>;
  resetDemo: () => Promise<void>;
  updateProfile: (name: string) => Promise<Result>;
  uploadAvatar: (file: Blob) => Promise<Result>;
  removeAvatar: () => Promise<Result>;
  changePassword: (currentPassword: string, nextPassword: string) => Promise<Result>;
  deleteAccount: () => Promise<Result>;
  deactivateAccount: () => Promise<Result>;
  reactivateAccount: () => Promise<Result>;
  reportIssue: (summary: string, detail: string) => Promise<Result>;
};

export type ImportPreview = {
  issues: { sheet: string; row: number; id?: string; field?: string; message: string; severity: "blocking" | "warning" }[];
  creates: string[];
  updates: string[];
  unchanged?: string[];
  missing?: string[];
  terms: Term[];
  workbookVersion?: string;
  categoryCounts?: Record<string, number>;
  counts: Record<string, number>;
  canCommit?: boolean;
};

const Context = createContext<Ctx | null>(null);

type Bootstrap = {
  session?: SessionPayload | null;
  terms?: Term[];
  progress?: Progress[];
  users?: PublicUser[];
  inbox?: Mail[];
  entitlement?: Entitlement;
  billingHistory?: BillingRecord[];
};

async function post(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return response.json();
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [progressList, setProgressList] = useState<Progress[]>([]);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [inbox, setInbox] = useState<Mail[]>([]);
  const [entitlement, setEntitlement] = useState<Entitlement>({ allowed: false, label: "Sign in required", detail: "Log in to continue." });
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const { locale } = useLocale();
  const { notify } = useToast();
  const T = (key: Parameters<typeof learnerText>[1], vars?: Record<string, string | number>) => learnerText(locale, key, vars);

  function applyBootstrap(data: Bootstrap) {
    setSession(data.session ?? null);
    setTerms(data.terms || []);
    setProgressList(data.progress || []);
    setUsers(data.users || []);
    setInbox(data.inbox || []);
    if (data.entitlement) setEntitlement(data.entitlement);
    setBillingHistory(data.billingHistory || []);
    setReady(true);
  }

  async function hydrate() {
    const data = await fetch("/api/bootstrap", { cache: "no-store", credentials: "include" }).then((r) => r.json());
    applyBootstrap(data);
  }

  useEffect(() => { void hydrate(); }, []);

  // The Owner's bootstrap carries every learner's rows (for the console); the
  // learner views below must only ever reflect the signed-in user's own rows.
  const progressRows = useMemo(
    () => (session ? progressList.filter((item) => item.userId === session.user.id) : []),
    [progressList, session]
  );
  const progress = useMemo(() => Object.fromEntries(progressRows.map((item) => [item.termId, item])), [progressRows]);

  const value: Ctx = {
    ready,
    session,
    terms,
    publishedTerms: terms.filter((term) => term.published && !term.archived),
    progress,
    progressRows,
    users,
    inbox,
    entitlement,
    billingHistory,
    async signIn(email, password) {
      const data = await post("/api/auth", { action: "login", email, password });
      if (data.ok && data.session) applyBootstrap(data);
      else if (data.ok) await hydrate();
      if (data.ok && data.session?.user?.name) notify(T("toastWelcome", { name: String(data.session.user.name).split(" ")[0] }));
      return data;
    },
    async signUp(name, email, password, privacyAccepted) {
      const data = await post("/api/auth", { action: "signup", name, email, password, privacyAccepted });
      if (data.ok && data.session) applyBootstrap(data);
      else if (data.ok) await hydrate();
      return data;
    },
    async signOut() {
      await post("/api/auth", { action: "logout" });
      setSession(null);
      setTerms([]);
      setProgressList([]);
      setUsers([]);
      setInbox([]);
    },
    async verify(email, code) {
      const data = await post("/api/auth", { action: "verify", email, code });
      if (data.ok) await hydrate();
      return data;
    },
    forgot: (email) => post("/api/auth", { action: "forgot", email }),
    resetPassword: (email, code, password) => post("/api/auth", { action: "reset", email, code, password }),
    async openTerm(id) {
      const data = await post("/api/learn", { action: "open", termId: id });
      if (data.progress) setProgressList(data.progress);
    },
    async toggleFavourite(id) {
      const wasFavourite = Boolean(progress[id]?.favourite);
      const data = await post("/api/learn", { action: "favourite", termId: id });
      if (data.progress) {
        setProgressList(data.progress);
        notify(T(wasFavourite ? "toastFavRemoved" : "toastFavAdded"));
      } else if (data.message) {
        notify(data.message, "error");
      }
    },
    async submitQuiz(id, option) {
      const data = await post("/api/learn", { action: "quiz", termId: id, option });
      if (data.progress) setProgressList(data.progress);
      return data;
    },
    async applyBilling(event, plan) {
      const data = await post("/api/billing", { event, plan });
      if (data.ok) await hydrate();
      return data;
    },
    async uploadAudioBatch(files) {
      const form = new FormData();
      for (const file of files) form.append("files", file);
      const data = await fetch("/api/admin/audio", { method: "POST", body: form, credentials: "include" }).then((r) => r.json());
      if (data.terms) setTerms(data.terms);
      return data;
    },
    async removeAudio(termId, jurisdiction) {
      const data = await fetch("/api/admin/audio", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ termId, jurisdiction }),
      }).then((r) => r.json());
      if (data.terms) setTerms(data.terms);
      return data;
    },
    async saveTerm(term) {
      const data = await post("/api/admin", { action: "save-term", term });
      if (data.terms) setTerms(data.terms);
      return data;
    },
    async uploadAudio(termId, jurisdiction, file) {
      const form = new FormData();
      form.append("termId", termId);
      form.append("jurisdiction", jurisdiction);
      form.append("file", file);
      const data = await fetch("/api/admin/audio", { method: "POST", body: form, credentials: "include" }).then((r) => r.json());
      if (data.terms) setTerms(data.terms);
      return data;
    },
    async setPublished(id, published) {
      const data = await post("/api/admin", { action: "publish", termId: id, published });
      if (data.terms) setTerms(data.terms);
      if (data.ok) notify(T(published ? "toastPublished" : "toastUnpublished", { id }));
      else if (data.message) notify(data.message, "error");
      return data;
    },
    async setArchived(id, archived) {
      const data = await post("/api/admin", { action: "archive", termId: id, archived });
      if (data.terms) setTerms(data.terms);
      return data;
    },
    async deleteTerm(id) {
      const data = await post("/api/admin", { action: "delete-term", termId: id });
      if (data.terms) setTerms(data.terms);
      return data;
    },
    async grantAccess(id) {
      const data = await post("/api/admin", { action: "grant", userId: id });
      if (data.users) setUsers(data.users);
    },
    async previewImport(file) {
      const form = new FormData();
      form.append("file", file);
      const data = await fetch("/api/admin", { method: "POST", body: form, credentials: "include" }).then((r) => r.json());
      return data;
    },
    async commitImport(nextTerms) {
      const data = await post("/api/admin", { action: "commit-import", terms: nextTerms });
      if (data.terms) setTerms(data.terms);
      if (data.ok) notify(T("toastImported", { n: (data.inserted ?? 0) + (data.updated ?? 0) }));
      return data;
    },
    async rollbackImport(importRunId) {
      const data = await post("/api/admin", { action: "rollback-import", importRunId });
      if (data.terms) setTerms(data.terms);
      return data;
    },
    async resetDemo() {
      await post("/api/auth", { action: "reset-store" });
      await hydrate();
    },
    async updateProfile(name) {
      const data = await post("/api/auth", { action: "update-profile", name });
      if (data.ok) {
        applyBootstrap(data);
        notify(T("toastProfileSaved"));
      }
      return data;
    },
    async uploadAvatar(file) {
      const form = new FormData();
      form.append("file", file, (file as File).name || "avatar.webp");
      const data = await fetch("/api/account/avatar", { method: "POST", body: form, credentials: "include" })
        .then((r) => r.json())
        .catch(() => ({ ok: false, message: T("photoFailed") }));
      if (data.ok) {
        applyBootstrap(data);
        notify(T("toastPhotoSaved"));
      }
      return data;
    },
    async removeAvatar() {
      const data = await fetch("/api/account/avatar", { method: "DELETE", credentials: "include" })
        .then((r) => r.json())
        .catch(() => ({ ok: false, message: T("photoFailed") }));
      if (data.ok) {
        applyBootstrap(data);
        notify(T("toastPhotoRemoved"));
      }
      return data;
    },
    async changePassword(currentPassword, nextPassword) {
      const data = await post("/api/auth", { action: "change-password", currentPassword, nextPassword });
      if (data.ok) notify(T("toastPasswordChanged"));
      return data;
    },
    async deleteAccount() {
      const data = await post("/api/auth", { action: "delete-account" });
      if (data.ok) {
        setSession(null);
        setTerms([]);
        setProgressList([]);
        setUsers([]);
        setInbox([]);
      }
      return data;
    },
    async deactivateAccount() {
      const data = await post("/api/auth", { action: "deactivate-account" });
      if (data.ok) applyBootstrap(data);
      return data;
    },
    async reactivateAccount() {
      const data = await post("/api/auth", { action: "reactivate-account" });
      if (data.ok) applyBootstrap(data);
      return data;
    },
    async reportIssue(summary, detail) {
      const data = await post("/api/auth", { action: "report-issue", summary, detail });
      if (data.inbox) setInbox(data.inbox);
      return data;
    },
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error("AppProvider missing");
  return value;
}

export function statusLabel(status: SubscriptionStatus) {
  return status.replaceAll("_", " ");
}
