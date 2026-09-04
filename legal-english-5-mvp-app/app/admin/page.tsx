"use client";

import { FormEvent, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useLocale } from "@/components/locale-provider";
import { adminText } from "@/lib/admin-copy";
import { subscriptionStatusLabel } from "@/lib/i18n";
import { AudioUploadResult, ImportPreview, useApp } from "@/components/app-provider";
import { CATEGORIES, emptyQuiz, emptyTerm, type Term, type UseItWithItem } from "@/lib/types";

function parseUseItWith(value: string, current: UseItWithItem[]): UseItWithItem[] {
  return value
    .split(",")
    .map((expression, index) => ({
      id: current[index]?.id || `UIW-EDIT-${index + 1}`,
      expression: expression.trim(),
      displayOrder: index + 1,
    }))
    .filter((item) => item.expression);
}

function withQuiz(term: Term, patch: Partial<Term["quiz"]> & { options?: string[] }): Term["quiz"] {
  const base = term.quiz || emptyQuiz(term.id || "new");
  const options = patch.options ?? base.options;
  return {
    ...base,
    ...patch,
    options,
    optionA: options[0] || "",
    optionB: options[1] || "",
    optionC: options[2] || "",
    optionD: options[3] || "",
  };
}

export default function AdminPage() {
  const { session, terms, users, saveTerm, setPublished, setArchived, deleteTerm, grantAccess, previewImport, commitImport, rollbackImport, resetDemo, uploadAudio, uploadAudioBatch, removeAudio } = useApp();
  const { locale } = useLocale();
  const a = (key: Parameters<typeof adminText>[1], vars?: Record<string, string | number>) => adminText(locale, key, vars);
  const [audioBusy, setAudioBusy] = useState<"us" | "uk" | "batch" | null>(null);
  const [audioResults, setAudioResults] = useState<AudioUploadResult[]>([]);
  const [lastRun, setLastRun] = useState<{ importRunId: string; inserted?: number; updated?: number; missing?: string[]; rolledBack?: boolean } | null>(null);
  const [tab, setTab] = useState<"overview" | "terms" | "users" | "import">("overview");
  const [editing, setEditing] = useState<Term | null>(null);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const published = terms.filter((term) => term.published && !term.archived).length;
  const drafts = terms.filter((term) => !term.published && !term.archived).length;
  const quizzes = terms.filter((term) => term.quiz).length;
  const visible = useMemo(() => terms.filter((term) => (tab === "terms" ? !term.archived : true)), [terms, tab]);

  if (session?.user.role !== "admin") {
    return (
      <AppShell>
        <div className="empty">
          <h1>{a("ownerOnlyTitle")}</h1>
          <p>{a("ownerOnlyBody")}</p>
        </div>
      </AppShell>
    );
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    const result = await saveTerm(editing);
    setMessage(result.ok ? a("termSaved") : result.message || a("couldNotSave"));
    if (result.ok) setEditing(null);
  }

  async function onUploadAudio(jurisdiction: "us" | "uk", file: File) {
    if (!editing?.id) {
      setMessage(a("saveBeforeAudio"));
      return;
    }
    setAudioBusy(jurisdiction);
    const result = await uploadAudio(editing.id, jurisdiction, file);
    setAudioBusy(null);
    setMessage(result.ok ? a("audioUploaded", { jur: jurisdiction.toUpperCase() }) : result.message || a("audioUploadFailed"));
    const fresh = (result as { terms?: Term[] }).terms?.find((term) => term.id === editing.id);
    if (result.ok && fresh) setEditing({ ...editing, audioUsPath: fresh.audioUsPath, audioUkPath: fresh.audioUkPath });
  }

  async function onRemoveAudio(jurisdiction: "us" | "uk") {
    if (!editing?.id) return;
    const result = await removeAudio(editing.id, jurisdiction);
    setMessage(result.ok ? a("audioRemoved", { jur: jurisdiction.toUpperCase() }) : result.message || a("audioRemoveFailed"));
    if (result.ok) setEditing({ ...editing, [jurisdiction === "us" ? "audioUsPath" : "audioUkPath"]: "" });
  }

  async function onUploadBatch(files: File[]) {
    setAudioBusy("batch");
    const result = await uploadAudioBatch(files);
    setAudioBusy(null);
    setAudioResults(result.results || []);
    setMessage(result.message || (result.ok ? a("batchDone") : a("batchFailed")));
  }

  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{a("eyebrow")}</span>
          <h1>{a("title")}</h1>
          <p>{a("lead")}</p>
        </div>
        {tab === "terms" && (
          <button className="primary" onClick={() => setEditing(emptyTerm())}>
            {a("newTerm")}
          </button>
        )}
      </div>
      <div className="tabs">
        {(
          [
            ["overview", a("tabOverview")],
            ["terms", a("tabTerms")],
            ["users", a("tabUsers")],
            ["import", a("tabImport")],
          ] as const
        ).map(([id, label]) => (
          <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {message && <p className="notice">{message}</p>}
      {tab === "overview" && (
        <>
          <div className="stat-grid four">
            <div className="stat">
              <strong>{terms.length}</strong>
              <span>{a("statLoaded")}</span>
            </div>
            <div className="stat">
              <strong>{published}</strong>
              <span>{a("statPublished")}</span>
            </div>
            <div className="stat">
              <strong>{drafts}</strong>
              <span>{a("statDrafts")}</span>
            </div>
            <div className="stat">
              <strong>
                {quizzes}/{terms.filter((term) => term.mcdStatus === "Approved").length || 30}
              </strong>
              <span>{a("statQuizzes")}</span>
            </div>
          </div>
          <p className="muted">
            {a("learnersSee", { n: published })}
          </p>
          <div className="chart-grid">
            <section className="chart-card">
              <h2>{a("usersGrowth")}</h2>
              <p>{a("usersGrowthBody")}</p>
              <svg viewBox="0 0 260 150" className="chart-svg funnel" aria-label="Users growth chart">
                <path d="M18 124 C44 96, 62 108, 82 76 S124 67, 146 51 190 38, 232 24 L232 132 L18 132Z" fill="#E0F1EB" />
                <path d="M18 124 C44 96, 62 108, 82 76 S124 67, 146 51 190 38, 232 24" fill="none" stroke="#006B5B" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </section>
            <section className="chart-card">
              <h2>{a("topCategories")}</h2>
              <p>{a("topCategoriesBody")}</p>
              <div className="bar-chart">
                {CATEGORIES.map((item) => {
                  const count = terms.filter((term) => term.category === item && term.published && !term.archived).length;
                  const width = published ? Math.round((count / published) * 100) : 0;
                  return (
                    <div key={item}>
                      <div className="bar-meta">
                        <span>{item}</span>
                        <b>{width}%</b>
                      </div>
                      <div className="bar-track">
                        <i style={{ width: `${width}%`, background: item === "Contracts" ? "#006B5B" : item === "Corporate Law" ? "#D8A852" : "#1F6A8A" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="chart-card">
              <h2>{a("recentActivity")}</h2>
              <p>{a("recentActivityBody")}</p>
              <div className="mark-list">
                <div className="mark-row">
                  <strong>{a("newUser")}</strong>
                  <small>{users[users.length - 1]?.email || "n/a"}</small>
                </div>
                <div className="mark-row">
                  <strong>{a("awaitingAudio")}</strong>
                  <small>{terms.filter((term) => term.mcdStatus === "Approved" && !term.audioUsPath).length}</small>
                </div>
                <div className="mark-row">
                  <strong>{a("publishedTerms")}</strong>
                  <small>{published}</small>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
      {tab === "users" && (
        <div className="admin-list">
          {users.map((user) => (
            <div className="admin-row" key={user.id}>
              <div>
                <strong>{user.name}</strong>
                <span>
                  {user.email} · {user.role === "admin" ? a("roleOwner") : a("roleLearner")} · {user.emailVerified ? a("verified") : a("unverified")}
                </span>
              </div>
              <div>
                <span className="status active">{subscriptionStatusLabel(locale, user.subscription.status)}</span>
                {user.role !== "admin" && <button onClick={() => void grantAccess(user.id)}>{a("grantAccess")}</button>}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "import" && (
        <section className="import-panel">
          <h2>{a("importTitle")}</h2>
          <p>{a("importBody")}</p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              void previewImport(file).then((result) => {
                setPreview(result.preview || null);
                setMessage(result.ok ? a("previewReady") : result.message || a("fileBlocking"));
              });
            }}
          />
          {preview && (
            <div className="preview">
              <p>
                {a("previewSummary", {
                  version: preview.workbookVersion || a("versionNa"),
                  terms: preview.counts.terms,
                  creates: preview.creates.length,
                  updates: preview.updates.length,
                  unchanged: preview.unchanged?.length || 0,
                  quizzes: preview.counts.quizzes,
                  three: preview.counts.quizzesThreeOptions || 0,
                  four: preview.counts.quizzesFourOptions || 0,
                })}
              </p>
              {preview.issues.length > 0 && (
                <ul className="errors">
                  {preview.issues.map((issue, index) => (
                    <li key={index}>
                      [{issue.severity}] {issue.sheet}
                      {issue.row ? ` ${a("row")} ${issue.row}` : ""}
                      {issue.id ? ` ${issue.id}` : ""}: {issue.message}
                    </li>
                  ))}
                </ul>
              )}
              {(preview.canCommit ?? preview.issues.every((issue) => issue.severity !== "blocking")) && (
                <button
                  className="primary"
                  onClick={() => {
                    void commitImport(preview.terms).then((result) => {
                      setMessage(result.ok ? a("importCommitted") : result.message || a("importFailed"));
                      if (result.ok) {
                        setPreview(null);
                        setLastRun(result.importRunId ? { importRunId: result.importRunId, inserted: result.inserted, updated: result.updated, missing: result.missing } : null);
                      }
                    });
                  }}
                >
                  {a("confirmImport")}
                </button>
              )}
            </div>
          )}
          {lastRun && (
            <div className="preview">
              <p>
                {a("lastCommit", { inserted: lastRun.inserted ?? 0, updated: lastRun.updated ?? 0 })}
                {lastRun.missing?.length ? a("missingKept", { n: lastRun.missing.length }) : ""}
                {lastRun.rolledBack ? a("rolledBack") : ""}
              </p>
              {!lastRun.rolledBack && (
                <button
                  className="danger"
                  onClick={() => {
                    void rollbackImport(lastRun.importRunId).then((result) => {
                      setMessage(result.ok ? a("rollbackDone") : result.message || a("rollbackFailed"));
                      if (result.ok) setLastRun({ ...lastRun, rolledBack: true });
                    });
                  }}
                >
                  {a("undoImport")}
                </button>
              )}
            </div>
          )}
        </section>
      )}
      {tab === "terms" && (
        <section className="import-panel">
          <h2>{a("bulkAudioTitle")}</h2>
          <p>
            {a("bulkAudioBody1")} <code>{"{TermID}_US.mp3"}</code> {a("bulkAudioBody2")} <code>{"{TermID}_UK.mp3"}</code> {a("bulkAudioBody3")} <code>CON-001_US.mp3</code>{" "}
            {a("bulkAudioBody2")} <code>EMP-009_UK.mp3</code>. {a("bulkAudioBody4")}
          </p>
          <input
            type="file"
            accept="audio/*,.mp3,.m4a,.wav,.ogg"
            multiple
            disabled={audioBusy === "batch"}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              if (files.length) void onUploadBatch(files);
            }}
          />
          <p className="muted tiny">
            {a("audioCount", { us: terms.filter((term) => term.audioUsPath).length, total: terms.length, uk: terms.find((term) => term.id === "EMP-009")?.audioUkPath ? a("present") : a("pending") })}
          </p>
          {audioResults.length > 0 && (
            <ul className="errors">
              {audioResults.map((item, index) => (
                <li key={index}>
                  [{item.status}] {item.file}: {item.message}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      {tab === "terms" && (
        <div className="admin-list">
          {visible.map((term) => (
            <div className="admin-row" key={term.id}>
              <div>
                <strong>{term.term}</strong>
                <span>
                  #{term.displayOrder || "—"} · {term.id} · {term.category} · {term.quiz ? a("quizOpts", { n: term.quiz.options.length }) : a("quizMissing")} · {term.audioUsPath ? "AudioUS" : a("noAudioUs")} · {term.mcdStatus}
                </span>
              </div>
              <div>
                <button
                  className={term.published ? "toggle on" : "toggle"}
                  onClick={() => {
                    void setPublished(term.id, !term.published).then((result) => {
                      if (!result.ok) setMessage(result.message || a("publishBlocked"));
                      else setMessage("");
                    });
                  }}
                >
                  {term.published ? a("published") : a("draft")}
                </button>
                <button onClick={() => setEditing(term)}>{a("edit")}</button>
                {term.archived ? (
                  <button onClick={() => void setArchived(term.id, false)}>{a("restore")}</button>
                ) : (
                  <button className="danger" onClick={() => void setArchived(term.id, true)}>
                    {a("archive")}
                  </button>
                )}
                {!term.published && (
                  <button
                    className="danger"
                    onClick={() => {
                      if (!window.confirm(a("deleteConfirm", { id: term.id }))) return;
                      void deleteTerm(term.id).then((result) => {
                        if (!result.ok) setMessage(result.message || a("deleteFailed"));
                        else setMessage(a("deleted", { id: term.id }));
                      });
                    }}
                  >
                    {a("delete")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "overview" && (
        <>
          <section className="import-panel">
            <h2>{a("backupTitle")}</h2>
            <p>
              {a("backupBody")}
            </p>
            <a className="primary inline" href="/api/admin/export">
              {a("exportJson")}
            </a>
            <p className="muted tiny">
              {a("backupNote")}
            </p>
          </section>
          <p className="tiny muted">
            <button className="text-button" onClick={() => void resetDemo()}>
              {a("resetAlpha")}
            </button>
          </p>
        </>
      )}
      {editing && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={(event) => void onSave(event)}>
            <header>
              <h2>{editing.id ? a("editTerm", { term: editing.term }) : a("newTermTitle")}</h2>
              <button type="button" onClick={() => setEditing(null)}>
                ×
              </button>
            </header>
            <div className="form-grid">
              <label>
                {a("fTermId")}
                <input value={editing.id} onChange={(e) => setEditing({ ...editing, id: e.target.value })} required placeholder="CORP-031" />
              </label>
              <label>
                {a("fTerm")}
                <input value={editing.term} onChange={(e) => setEditing({ ...editing, term: e.target.value })} required />
              </label>
              <label>
                {a("fSpanish")}
                <input value={editing.spanishEquivalent} onChange={(e) => setEditing({ ...editing, spanishEquivalent: e.target.value })} required />
              </label>
              <label>
                {a("fCivil")}
                <input value={editing.civilLawEquivalent} onChange={(e) => setEditing({ ...editing, civilLawEquivalent: e.target.value })} />
              </label>
              <label>
                {a("fCategory")}
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                  {CATEGORIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                {a("fJurisdiction")}
                <select value={editing.jurisdiction} onChange={(e) => setEditing({ ...editing, jurisdiction: e.target.value as Term["jurisdiction"] })}>
                  <option>US</option>
                  <option>UK</option>
                  <option>US/UK</option>
                </select>
              </label>
              <label className="full">
                {a("fDefinition")}
                <textarea value={editing.definition} onChange={(e) => setEditing({ ...editing, definition: e.target.value })} required />
              </label>
              <label className="full">
                {a("fAlert")}
                <textarea value={editing.spanishSpeakerAlert} onChange={(e) => setEditing({ ...editing, spanishSpeakerAlert: e.target.value })} />
              </label>
              <label>
                {a("fAudioUs")}
                <input value={editing.audioUsPath} onChange={(e) => setEditing({ ...editing, audioUsPath: e.target.value })} placeholder={a("fAudioUsPh")} />
                <input
                  type="file"
                  accept="audio/*"
                  disabled={audioBusy === "us"}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void onUploadAudio("us", file);
                  }}
                />
                {editing.audioUsPath && (
                  <button type="button" className="text-button" onClick={() => void onRemoveAudio("us")}>
                    {a("removeAudioUs")}
                  </button>
                )}
              </label>
              <label>
                {a("fAudioUk")}
                <input value={editing.audioUkPath} onChange={(e) => setEditing({ ...editing, audioUkPath: e.target.value })} placeholder={editing.id === "EMP-009" ? a("fAudioUkReq") : a("fAudioUkOpt")} />
                <input
                  type="file"
                  accept="audio/*"
                  disabled={audioBusy === "uk"}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void onUploadAudio("uk", file);
                  }}
                />
                {editing.audioUkPath && (
                  <button type="button" className="text-button" onClick={() => void onRemoveAudio("uk")}>
                    {a("removeAudioUk")}
                  </button>
                )}
              </label>
              <label className="full">
                {a("fUseItWith")}
                <input value={editing.useItWith.map((item) => item.expression).join(", ")} onChange={(e) => setEditing({ ...editing, useItWith: parseUseItWith(e.target.value, editing.useItWith) })} />
              </label>
              <label className="full">
                {a("fInContext")}
                <textarea
                  value={editing.inContext?.exampleText || ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      inContext: e.target.value.trim()
                        ? {
                            id: editing.inContext?.id || `CTX-EDIT-${editing.id || "new"}`,
                            exampleText: e.target.value,
                            jurisdiction: editing.inContext?.jurisdiction || editing.jurisdiction,
                            displayOrder: editing.inContext?.displayOrder || 1,
                          }
                        : null,
                    })
                  }
                />
              </label>
              <label className="full">
                {a("fQuizQuestion")}
                <input
                  value={editing.quiz?.question || ""}
                  onChange={(e) => setEditing({ ...editing, quiz: withQuiz(editing, { question: e.target.value }) })}
                />
              </label>
              {[0, 1, 2, 3].map((index) => (
                <label key={index}>
                  {a("fOption", { letter: String.fromCharCode(65 + index) })}
                  {index === 3 ? a("optional") : ""}
                  <input
                    value={editing.quiz?.options[index] || ""}
                    onChange={(e) => {
                      const options = [...(editing.quiz?.options || ["", "", "", ""])];
                      options[index] = e.target.value;
                      setEditing({ ...editing, quiz: withQuiz(editing, { options }) });
                    }}
                  />
                </label>
              ))}
              <label className="full">
                {a("fQuizExplanation")}
                <textarea
                  value={editing.quiz?.explanation || ""}
                  onChange={(e) => setEditing({ ...editing, quiz: withQuiz(editing, { explanation: e.target.value }) })}
                />
              </label>
            </div>
            <footer>
              <label className="check">
                <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
                {a("publishedCheck")}
              </label>
              <div>
                <button type="button" onClick={() => setEditing(null)}>
                  {a("cancel")}
                </button>
                <button className="primary" type="submit">
                  {a("saveTerm")}
                </button>
              </div>
            </footer>
          </form>
        </div>
      )}
    </AppShell>
  );
}
