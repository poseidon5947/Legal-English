"use client";

import { FormEvent, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ImportPreview, statusLabel, useApp } from "@/components/app-provider";
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
  const { session, terms, users, saveTerm, setPublished, setArchived, grantAccess, previewImport, commitImport, resetDemo } = useApp();
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
                <path d="M18 124 C44 96, 62 108, 82 76 S124 67, 146 51 190 38, 232 24 L232 132 L18 132Z" fill="#F4EDFF" />
                <path d="M18 124 C44 96, 62 108, 82 76 S124 67, 146 51 190 38, 232 24" fill="none" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" />
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
                        <i style={{ width: `${width}%`, background: item === "Contracts" ? "#7C3AED" : item === "Corporate Law" ? "#3B82F6" : "#32C998" }} />
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
                      if (result.ok) setPreview(null);
                    });
                  }}
                >
                  Confirm import
                </button>
              )}
            </div>
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
                <button className="danger" onClick={() => void setArchived(term.id, true)}>
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "overview" && (
        <p className="tiny muted">
          <button className="text-button" onClick={() => void resetDemo()}>
            Reset alpha data
          </button>
        </p>
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
              </label>
              <label>
                AudioUK path
                <input value={editing.audioUkPath} onChange={(e) => setEditing({ ...editing, audioUkPath: e.target.value })} placeholder={editing.id === "EMP-009" ? "Required for EMP-009" : "Optional unless applicable"} />
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
