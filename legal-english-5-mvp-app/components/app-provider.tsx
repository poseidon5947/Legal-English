"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Entitlement, Mail, Plan, Progress, PublicUser, SessionPayload, SubscriptionStatus, Term } from "@/lib/types";

type Result = { ok: boolean; message?: string; code?: string; correct?: boolean; needsConfirmation?: boolean };
type Ctx = {
  ready: boolean;
  session: SessionPayload | null;
  terms: Term[];
  publishedTerms: Term[];
  progress: Record<string, Progress>;
  users: PublicUser[];
  inbox: Mail[];
  entitlement: Entitlement;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (name: string, email: string, password: string) => Promise<Result>;
  signOut: () => Promise<void>;
  verify: (email: string, code: string) => Promise<Result>;
  forgot: (email: string) => Promise<Result>;
  resetPassword: (email: string, code: string, password: string) => Promise<Result>;
  openTerm: (id: string) => Promise<void>;
  toggleFavourite: (id: string) => Promise<void>;
  submitQuiz: (id: string, option: string) => Promise<Result>;
  applyBilling: (event: "success" | "failure" | "cancel" | "expire_trial" | "reset", plan?: Plan) => Promise<void>;
  saveTerm: (term: Term) => Promise<Result>;
  setPublished: (id: string, published: boolean) => Promise<Result>;
  setArchived: (id: string, archived: boolean) => Promise<Result>;
  grantAccess: (id: string) => Promise<void>;
  previewImport: (file: File) => Promise<{ ok: boolean; preview?: ImportPreview; message?: string }>;
  commitImport: (terms: Term[]) => Promise<Result>;
  resetDemo: () => Promise<void>;
  updateProfile: (name: string) => Promise<Result>;
  changePassword: (currentPassword: string, nextPassword: string) => Promise<Result>;
  deleteAccount: () => Promise<Result>;
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

  function applyBootstrap(data: Bootstrap) {
    setSession(data.session ?? null);
    setTerms(data.terms || []);
    setProgressList(data.progress || []);
    setUsers(data.users || []);
    setInbox(data.inbox || []);
    if (data.entitlement) setEntitlement(data.entitlement);
    setReady(true);
  }

  async function hydrate() {
    const data = await fetch("/api/bootstrap", { cache: "no-store", credentials: "include" }).then((r) => r.json());
    applyBootstrap(data);
  }

  useEffect(() => { void hydrate(); }, []);

  const progress = useMemo(() => Object.fromEntries(progressList.map((item) => [item.termId, item])), [progressList]);

  const value: Ctx = {
    ready,
    session,
    terms,
    publishedTerms: terms.filter((term) => term.published && !term.archived),
    progress,
    users,
    inbox,
    entitlement,
    async signIn(email, password) {
      const data = await post("/api/auth", { action: "login", email, password });
      if (data.ok && data.session) applyBootstrap(data);
      else if (data.ok) await hydrate();
      return data;
    },
    async signUp(name, email, password) {
      const data = await post("/api/auth", { action: "signup", name, email, password });
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
      const data = await post("/api/learn", { action: "favourite", termId: id });
      if (data.progress) setProgressList(data.progress);
    },
    async submitQuiz(id, option) {
      const data = await post("/api/learn", { action: "quiz", termId: id, option });
      if (data.progress) setProgressList(data.progress);
      return data;
    },
    async applyBilling(event, plan) {
      const data = await post("/api/billing", { event, plan });
      if (data.ok) await hydrate();
    },
    async saveTerm(term) {
      const data = await post("/api/admin", { action: "save-term", term });
      if (data.terms) setTerms(data.terms);
      return data;
    },
    async setPublished(id, published) {
      const data = await post("/api/admin", { action: "publish", termId: id, published });
      if (data.terms) setTerms(data.terms);
      return data;
    },
    async setArchived(id, archived) {
      const data = await post("/api/admin", { action: "archive", termId: id, archived });
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
      return data;
    },
    async resetDemo() {
      await post("/api/auth", { action: "reset-store" });
      await hydrate();
    },
    async updateProfile(name) {
      const data = await post("/api/auth", { action: "update-profile", name });
      if (data.ok) applyBootstrap(data);
      return data;
    },
    async changePassword(currentPassword, nextPassword) {
      return post("/api/auth", { action: "change-password", currentPassword, nextPassword });
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
