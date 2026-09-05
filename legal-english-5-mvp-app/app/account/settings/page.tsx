"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useApp } from "@/components/app-provider";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/i18n";
import { learnerText } from "@/lib/learner-copy";
import { Icon } from "@/components/ui-icons";

const NOTIFY_KEY = "le5_help_notices";
const PRIVACY_KEY = "le5_privacy_prefs";

type PrivacyPrefs = { visibility: "limited" | "team"; dataUsage: boolean; dataSharing: boolean };
const DEFAULT_PRIVACY: PrivacyPrefs = { visibility: "limited", dataUsage: true, dataSharing: false };

export default function SettingsPage() {
  const { locale, setLocale, t } = useLocale();
  const { session, changePassword } = useApp();
  const [notices, setNotices] = useState(true);
  const [privacy, setPrivacy] = useState<PrivacyPrefs>(DEFAULT_PRIVACY);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  useEffect(() => {
    setNotices(window.localStorage.getItem(NOTIFY_KEY) !== "off");
    try {
      const stored = window.localStorage.getItem(PRIVACY_KEY);
      if (stored) setPrivacy({ ...DEFAULT_PRIVACY, ...(JSON.parse(stored) as Partial<PrivacyPrefs>) });
    } catch {
      /* ignore malformed local preference */
    }
    // Deep links from the Account tabs (#security, #preferences, #notifications).
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "start" });
  }, []);
  function toggleNotices() {
    const next = !notices;
    setNotices(next);
    window.localStorage.setItem(NOTIFY_KEY, next ? "on" : "off");
  }
  function updatePrivacy(patch: Partial<PrivacyPrefs>) {
    const next = { ...privacy, ...patch };
    setPrivacy(next);
    window.localStorage.setItem(PRIVACY_KEY, JSON.stringify(next));
  }
  function savePassword(event: FormEvent) {
    event.preventDefault();
    void changePassword(currentPassword, nextPassword).then((result) => {
      setPasswordMessage(result.ok ? learnerText(locale, "passwordChanged") : result.message || t("couldNotContinue"));
      if (result.ok) {
        setCurrentPassword("");
        setNextPassword("");
        setPasswordOpen(false);
      }
    });
  }
  const verified = Boolean(session?.user.emailVerified);
  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("settingsEyebrow")}</span>
          <h1>{t("settingsTitle")}</h1>
          <p>{t("settingsLead")}</p>
        </div>
      </div>
      <div className="account-stack">
        <section className="account-card security-card" id="security">
          <div className="settings-card-head">
            <Icon name="mail" />
            <div>
              <h2>{t("settingsEmailTitle")}</h2>
              <p>{t("settingsEmailBody")}</p>
            </div>
            <span className={`status ${verified ? "active" : "blocked"}`}>{verified ? t("settingsVerified") : learnerText(locale, "unverified")}</span>
          </div>
          <p className="muted">{session?.user.email}</p>
          <Link className="ghost inline" href="/account/help">
            {t("settingsChangeEmail")}
          </Link>
        </section>
        <section className="account-card security-card">
          <div className="settings-card-head">
            <Icon name="lock" />
            <div>
              <h2>{t("settingsPasswordTitle")}</h2>
              <p>{t("settingsPasswordBody")}</p>
            </div>
          </div>
          {passwordOpen ? (
            <form className="settings-password-form" onSubmit={savePassword}>
              <input
                type="password"
                autoComplete="current-password"
                placeholder={learnerText(locale, "currentPassword")}
                value={currentPassword}
                required
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
              <input
                type="password"
                autoComplete="new-password"
                placeholder={learnerText(locale, "newPassword")}
                value={nextPassword}
                minLength={8}
                required
                onChange={(event) => setNextPassword(event.target.value)}
              />
              <div>
                <button className="primary inline" type="submit">
                  {learnerText(locale, "saveProfile")}
                </button>
                <button className="ghost" type="button" onClick={() => setPasswordOpen(false)}>
                  {learnerText(locale, "cancel")}
                </button>
              </div>
            </form>
          ) : (
            <button className="ghost" onClick={() => setPasswordOpen(true)}>
              {t("settingsChangePassword")}
            </button>
          )}
          {passwordMessage && <p className="muted">{passwordMessage}</p>}
        </section>
        <section className="account-card privacy-settings-card" id="preferences">
          <div className="settings-card-head">
            <Icon name="shield" />
            <div>
              <h2>{t("settingsPrivacyTitle")}</h2>
              <p>{t("settingsPrivacyBody")}</p>
            </div>
          </div>
          <div className="settings-split-row">
            <label>
              {t("settingsVisibility")}
              <select value={privacy.visibility} onChange={(event) => updatePrivacy({ visibility: event.target.value as PrivacyPrefs["visibility"] })}>
                <option value="limited">{t("settingsVisibilityLimited")}</option>
                <option value="team">{t("settingsVisibilityTeam")}</option>
              </select>
            </label>
            <label className="toggle-line">
              {t("settingsDataUsage")}
              <input type="checkbox" checked={privacy.dataUsage} onChange={(event) => updatePrivacy({ dataUsage: event.target.checked })} />
            </label>
            <label className="toggle-line">
              {t("settingsDataSharing")}
              <input type="checkbox" checked={privacy.dataSharing} onChange={(event) => updatePrivacy({ dataSharing: event.target.checked })} />
            </label>
          </div>
        </section>
        <section className="account-card">
          <h2>{t("settingsLanguage")}</h2>
          <div className="lang-choice">
            {(["en", "es"] as Locale[]).map((item) => (
              <button key={item} className={locale === item ? "primary" : ""} onClick={() => setLocale(item)}>
                {item === "en" ? "English" : "Español"}
              </button>
            ))}
          </div>
        </section>
        <section className="account-card" id="notifications">
          <div className="settings-card-head">
            <Icon name="bell" />
            <div>
              <h2>{t("settingsNotify")}</h2>
              <p>{t("settingsNotifyBody")}</p>
            </div>
          </div>
          <label className="toggle-line">
            {t("settingsEmailNotifications")}
            <input type="checkbox" checked={notices} onChange={toggleNotices} />
          </label>
        </section>
        <section className="account-card settings-photo-card">
          <img src="/home-assets/photos/privacy-lock.jpg" alt="" loading="lazy" />
          <div>
            <h2>{t("settingsDataTitle")}</h2>
            <p>{t("settingsDataBody")}</p>
            <div className="settings-data-actions">
              <a className="primary inline" href="/api/learn/export" download>
                {t("settingsExport")}
              </a>
              <Link className="ghost inline" href="/privacy">
                {t("settingsDataLink")}
              </Link>
            </div>
            <small className="muted tiny">{t("settingsExportNote")}</small>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
