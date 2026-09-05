"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useApp } from "@/components/app-provider";
import { useLocale } from "@/components/locale-provider";
import { Icon } from "@/components/ui-icons";

export default function HelpPage() {
  const { inbox, reportIssue, session } = useApp();
  const { t } = useLocale();
  const [summary, setSummary] = useState("");
  const [detail, setDetail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showInbox, setShowInbox] = useState(true);
  useEffect(() => {
    setShowInbox(window.localStorage.getItem("le5_help_notices") !== "off");
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const result = await reportIssue(summary, detail);
    if (result.ok) {
      setMessage(t("helpReportSent"));
      setSummary("");
      setDetail("");
    } else setError(result.message || t("couldNotContinue"));
  }

  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("helpEyebrow")}</span>
          <h1>{t("helpTitle")}</h1>
          <p>{t("helpLead")}</p>
        </div>
      </div>
      {message && <p className="notice">{message}</p>}
      {error && <p className="notice">{error}</p>}
      <div className="account-stack">
        <section className="account-card help-hero-card with-photo">
          <img className="help-hero-photo" src="/home-assets/photos/help-support.jpg" alt="" loading="lazy" />
          <div>
            <span className="eyebrow">{t("helpEyebrow")}</span>
            <h2>{t("helpTitle")}</h2>
            <p>{t("helpLead")}</p>
          </div>
          <Icon name="headset" />
        </section>
        <section className="account-card">
          <div className="settings-card-head">
            <Icon name="book" />
            <div>
              <h2>{t("helpLearn")}</h2>
              <p>{t("helpLearnBody")}</p>
            </div>
          </div>
          <Link href="/terms">{t("navTerms")}</Link>
        </section>
        <section className="account-card">
          <div className="settings-card-head">
            <Icon name="card" />
            <div>
              <h2>{t("helpAccess")}</h2>
              <p>{t("helpAccessBody")}</p>
            </div>
          </div>
          <Link href="/billing">{t("navBilling")}</Link>
        </section>
        {session?.user.role === "admin" && (
          <section className="account-card">
            <div className="settings-card-head">
              <Icon name="shield" />
              <div>
                <h2>{t("helpOwner")}</h2>
                <p>{t("helpOwnerBody")}</p>
              </div>
            </div>
            <Link href="/admin">{t("navAdmin")}</Link>
          </section>
        )}
        <section className="account-card" id="contact">
          <div className="settings-card-head">
            <Icon name="help" />
            <div>
              <h2>{t("helpReportTitle")}</h2>
              <p>{t("helpLead")}</p>
            </div>
          </div>
          <form onSubmit={(event) => void onSubmit(event)}>
            <label>
              {t("helpReportSummary")}
              <input value={summary} onChange={(e) => setSummary(e.target.value)} required />
            </label>
            <label>
              {t("helpReportDetail")}
              <textarea value={detail} onChange={(e) => setDetail(e.target.value)} required />
            </label>
            <button className="primary" type="submit">
              {t("helpReportSend")}
            </button>
          </form>
        </section>
        {showInbox && inbox.length > 0 && (
          <section className="account-card">
            <h2>{t("helpInbox")}</h2>
            <div className="inbox-list">
              {inbox.slice(0, 5).map((item, index) => (
                <article key={`${item.id}-${index}`}>
                  <strong>{item.subject}</strong>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
