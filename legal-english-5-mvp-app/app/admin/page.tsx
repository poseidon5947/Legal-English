"use client";

import { FormEvent, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AudioUploadResult, ImportPreview, statusLabel, useApp } from "@/components/app-provider";
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
          <h1>Owner access required</h1>
          <p>This route is rejected for Learners on the server, not only hidden in the menu.</p>
        </div>
      </AppShell>
    );
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    const result = await saveTerm(editing);
    setMessage(result.ok ? "Term saved." : result.message || "Could not save.");
    if (result.ok) setEditing(null);
  }

  async function onUploadAudio(jurisdiction: "us" | "uk", file: File) {
    if (!editing?.id) {
      setMessage("Save the term once, so it has a TermID, before uploading audio.");
      return;
    }
    setAudioBusy(jurisdiction);
    const result = await uploadAudio(editing.id, jurisdiction, file);
    setAudioBusy(null);
    setMessage(result.ok ? `Audio${jurisdiction.toUpperCase()} uploaded.` : result.message || "Audio upload failed.");
    const fresh = (result as { terms?: Term[] }).terms?.find((term) => term.id === editing.id);
    if (result.ok && fresh) setEditing({ ...editing, audioUsPath: fresh.audioUsPath, audioUkPath: fresh.audioUkPath });
  }

  async function onRemoveAudio(jurisdiction: "us" | "uk") {
    if (!editing?.id) return;
    const result = await removeAudio(editing.id, jurisdiction);
    setMessage(result.ok ? `Audio${jurisdiction.toUpperCase()} removed. The publication gate applies again.` : result.message || "Could not remove audio.");
    if (result.ok) setEditing({ ...editing, [jurisdiction === "us" ? "audioUsPath" : "audioUkPath"]: "" });
  }

  async function onUploadBatch(files: File[]) {
    setAudioBusy("batch");
    const result = await uploadAudioBatch(files);
    setAudioBusy(null);
    setAudioResults(result.results || []);
    setMessage(result.message || (result.ok ? "Audio batch processed." : "Audio batch failed."));
  }

  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <span className="eyebrow">OWNER CONSOLE · NO CODE</span>
          <h1>Operate the studio</h1>
          <p>LC-001 from MCD v1.3.81 loads unpublished. Publish only with quiz + AudioUS (and AudioUK for EMP-009). Import does not rewrite the MCD.</p>
        </div>
        {tab === "terms" && (
          <button className="primary" onClick={() => setEditing(emptyTerm())}>
            + New term
          </button>
        )}
      </div>
      <div className="tabs">
        {(
          [
            ["overview", "Overview"],
            ["terms", "Terms"],
            ["users", "Users"],
            ["import", "Excel import"],
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
              <span>MCD terms loaded</span>
            </div>
            <div className="stat">
              <strong>{published}</strong>
              <span>Published</span>
            </div>
            <div className="stat">
              <strong>{drafts}</strong>
              <span>Drafts / future</span>
            </div>
            <div className="stat">
              <strong>
                {quizzes}/{terms.filter((term) => term.mcdStatus === "Approved").length || 30}
              </strong>
              <span>Quizzes on Approved terms</span>
            </div>
          </div>
          <p className="muted">
            Learners currently see {published} terms. Approved is not Published. AudioUS is 0/30 in v1.3.81, so publication stays blocked until you upload audio.
          </p>
          <div className="chart-grid">
            <section className="chart-card">
              <h2>Users growth</h2>
              <p>Alpha account activity by review session.</p>
              <svg viewBox="0 0 260 150" className="chart-svg funnel" aria-label="Users growth chart">
                <path d="M18 124 C44 96, 62 108, 82 76 S124 67, 146 51 190 38, 232 24 L232 132 L18 132Z" fill="#E0F1EB" />
                <path d="M18 124 C44 96, 62 108, 82 76 S124 67, 146 51 190 38, 232 24" fill="none" stroke="#006B5B" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </section>
            <section className="chart-card">
              <h2>Top categories</h2>
              <p>Published catalogue mix.</p>
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
              <h2>Recent activity</h2>
              <p>Operational signals for the owner.</p>
              <div className="mark-list">
                <div className="mark-row">
                  <strong>New user registered</strong>
                  <small>{users[users.length - 1]?.email || "n/a"}</small>
                </div>
                <div className="mark-row">
                  <strong>Terms awaiting audio</strong>
                  <small>{terms.filter((term) => term.mcdStatus === "Approved" && !term.audioUsPath).length}</small>
                </div>
                <div className="mark-row">
                  <strong>Published terms</strong>
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
                  {user.email} · {user.role === "admin" ? "Owner" : "Learner"} · {user.emailVerified ? "verified" : "unverified"}
                </span>
              </div>
              <div>
                <span className="status active">{statusLabel(user.subscription.status)}</span>
                {user.role !== "admin" && <button onClick={() => void grantAccess(user.id)}>Grant 30-day access</button>}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "import" && (
        <section className="import-panel">
          <h2>Mass import from the Master Content Database</h2>
          <p>Use MCD v1.3.81. The importer reads LC-001 only, keeps canonical IDs, accepts 3- or 4-option quizzes, and never publishes or deletes automatically.</p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              void previewImport(file).then((result) => {
                setPreview(result.preview || null);
                setMessage(result.ok ? "Preview ready. Review the rows, then confirm. Nothing is published on import." : result.message || "The file has blocking errors.");
              });
            }}
          />
          {preview && (
            <div className="preview">
              <p>
                {preview.workbookVersion || "version n/a"} · {preview.counts.terms} LC-001 terms · {preview.creates.length} new · {preview.updates.length} updates · {preview.unchanged?.length || 0} unchanged · {preview.counts.quizzes} quizzes ({preview.counts.quizzesThreeOptions || 0}×3 / {preview.counts.quizzesFourOptions || 0}×4)
              </p>
              {preview.issues.length > 0 && (
                <ul className="errors">
                  {preview.issues.map((issue, index) => (
                    <li key={index}>
                      [{issue.severity}] {issue.sheet}
                      {issue.row ? ` row ${issue.row}` : ""}
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
                      setMessage(result.ok ? "Import committed. Terms stay unpublished. Missing IDs were kept." : result.message || "Import failed.");
                      if (result.ok) {
                        setPreview(null);
                        setLastRun(result.importRunId ? { importRunId: result.importRunId, inserted: result.inserted, updated: result.updated, missing: result.missing } : null);
                      }
                    });
                  }}
                >
                  Confirm import
                </button>
              )}
            </div>
          )}
          {lastRun && (
            <div className="preview">
              <p>
                Last commit: {lastRun.inserted ?? 0} inserted · {lastRun.updated ?? 0} updated
                {lastRun.missing?.length ? ` · ${lastRun.missing.length} existing TermID(s) kept, not touched` : ""}
                {lastRun.rolledBack ? " · rolled back" : ""}
              </p>
              {!lastRun.rolledBack && (
                <button
                  className="danger"
                  onClick={() => {
                    void rollbackImport(lastRun.importRunId).then((result) => {
                      setMessage(result.ok ? "Import rolled back to its pre-commit state." : result.message || "Rollback failed.");
                      if (result.ok) setLastRun({ ...lastRun, rolledBack: true });
                    });
                  }}
                >
                  Undo this import
                </button>
              )}
            </div>
          )}
        </section>
      )}
      {tab === "terms" && (
        <section className="import-panel">
          <h2>Bulk audio upload</h2>
          <p>
            Name each file <code>{"{TermID}_US.mp3"}</code> or <code>{"{TermID}_UK.mp3"}</code> (also m4a, wav, ogg) — for example <code>CON-001_US.mp3</code> or{" "}
            <code>EMP-009_UK.mp3</code>. Files are associated by name; anything that does not match an existing TermID is rejected and listed below, never
            guessed. Uploading the same name again replaces the previous recording.
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
            AudioUS: {terms.filter((term) => term.audioUsPath).length}/{terms.length} · AudioUK (EMP-009): {terms.find((term) => term.id === "EMP-009")?.audioUkPath ? "present" : "pending"}
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
                  #{term.displayOrder || "—"} · {term.id} · {term.category} · {term.quiz ? `Quiz ${term.quiz.options.length} opts` : "Quiz missing"} · {term.audioUsPath ? "AudioUS" : "No AudioUS"} · {term.mcdStatus}
                </span>
              </div>
              <div>
                <button
                  className={term.published ? "toggle on" : "toggle"}
                  onClick={() => {
                    void setPublished(term.id, !term.published).then((result) => {
                      if (!result.ok) setMessage(result.message || "Publish blocked.");
                      else setMessage("");
                    });
                  }}
                >
                  {term.published ? "Published" : "Draft"}
                </button>
                <button onClick={() => setEditing(term)}>Edit</button>
                {term.archived ? (
                  <button onClick={() => void setArchived(term.id, false)}>Restore</button>
                ) : (
                  <button className="danger" onClick={() => void setArchived(term.id, true)}>
                    Archive
                  </button>
                )}
                {!term.published && (
                  <button
                    className="danger"
                    onClick={() => {
                      if (!window.confirm(`Permanently delete ${term.id}? This cannot be undone.`)) return;
                      void deleteTerm(term.id).then((result) => {
                        if (!result.ok) setMessage(result.message || "Delete failed.");
                        else setMessage(`${term.id} deleted.`);
                      });
                    }}
                  >
                    Delete
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
            <h2>Backup &amp; recovery</h2>
            <p>
              Export downloads terms, quizzes, users, subscriptions and progress as JSON — everything except audio files, which live in Storage and are
              covered by the daily database backup instead. Nothing is deleted or changed by exporting.
            </p>
            <a className="primary inline" href="/api/admin/export">
              Export data (JSON)
            </a>
            <p className="muted tiny">
              What&apos;s recovered and by whom: this export restores content/users/progress into a new environment by hand. Point-in-time database
              recovery (up to 24h RPO) is a Supabase Pro feature, requested from Supabase support, not from this panel — it does not restore Vercel,
              Mercado Pago or DNS configuration.
            </p>
          </section>
          <p className="tiny muted">
            <button className="text-button" onClick={() => void resetDemo()}>
              Reset alpha data
            </button>
          </p>
        </>
      )}
      {editing && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={(event) => void onSave(event)}>
            <header>
              <h2>{editing.id ? `Edit ${editing.term}` : "New term"}</h2>
              <button type="button" onClick={() => setEditing(null)}>
                ×
              </button>
            </header>
            <div className="form-grid">
              <label>
                TermID
                <input value={editing.id} onChange={(e) => setEditing({ ...editing, id: e.target.value })} required placeholder="CORP-031" />
              </label>
              <label>
                Term
                <input value={editing.term} onChange={(e) => setEditing({ ...editing, term: e.target.value })} required />
              </label>
              <label>
                Spanish equivalent
                <input value={editing.spanishEquivalent} onChange={(e) => setEditing({ ...editing, spanishEquivalent: e.target.value })} required />
              </label>
              <label>
                Civil Law Equivalent
                <input value={editing.civilLawEquivalent} onChange={(e) => setEditing({ ...editing, civilLawEquivalent: e.target.value })} />
              </label>
              <label>
                Category
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                  {CATEGORIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Jurisdiction
                <select value={editing.jurisdiction} onChange={(e) => setEditing({ ...editing, jurisdiction: e.target.value as Term["jurisdiction"] })}>
                  <option>US</option>
                  <option>UK</option>
                  <option>US/UK</option>
                </select>
              </label>
              <label className="full">
                Definition
                <textarea value={editing.definition} onChange={(e) => setEditing({ ...editing, definition: e.target.value })} required />
              </label>
              <label className="full">
                Spanish Speaker Alert
                <textarea value={editing.spanishSpeakerAlert} onChange={(e) => setEditing({ ...editing, spanishSpeakerAlert: e.target.value })} />
              </label>
              <label>
                AudioUS path
                <input value={editing.audioUsPath} onChange={(e) => setEditing({ ...editing, audioUsPath: e.target.value })} placeholder="Required to publish" />
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
                    Remove AudioUS
                  </button>
                )}
              </label>
              <label>
                AudioUK path
                <input value={editing.audioUkPath} onChange={(e) => setEditing({ ...editing, audioUkPath: e.target.value })} placeholder={editing.id === "EMP-009" ? "Required for EMP-009" : "Optional unless applicable"} />
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
                    Remove AudioUK
                  </button>
                )}
              </label>
              <label className="full">
                Use It With
                <input value={editing.useItWith.map((item) => item.expression).join(", ")} onChange={(e) => setEditing({ ...editing, useItWith: parseUseItWith(e.target.value, editing.useItWith) })} />
              </label>
              <label className="full">
                In Context
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
                Quiz question
                <input
                  value={editing.quiz?.question || ""}
                  onChange={(e) => setEditing({ ...editing, quiz: withQuiz(editing, { question: e.target.value }) })}
                />
              </label>
              {[0, 1, 2, 3].map((index) => (
                <label key={index}>
                  Option {String.fromCharCode(65 + index)}
                  {index === 3 ? " (optional)" : ""}
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
                Quiz explanation
                <textarea
                  value={editing.quiz?.explanation || ""}
                  onChange={(e) => setEditing({ ...editing, quiz: withQuiz(editing, { explanation: e.target.value }) })}
                />
              </label>
            </div>
            <footer>
              <label className="check">
                <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
                Published (blocked without quiz + AudioUS)
              </label>
              <div>
                <button type="button" onClick={() => setEditing(null)}>
                  Cancel
                </button>
                <button className="primary" type="submit">
                  Save term
                </button>
              </div>
            </footer>
          </form>
        </div>
      )}
    </AppShell>
  );
}
