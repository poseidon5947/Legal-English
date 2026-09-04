"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/i18n";
import { Icon } from "@/components/ui-icons";

const NOTIFY_KEY = "le5_help_notices";

export default function SettingsPage() {
  const { locale, setLocale, t } = useLocale();
  const [notices, setNotices] = useState(true);
  useEffect(() => {
    setNotices(window.localStorage.getItem(NOTIFY_KEY) !== "off");
  }, []);
  function toggleNotices() {
    const next = !notices;
    setNotices(next);
    window.localStorage.setItem(NOTIFY_KEY, next ? "on" : "off");
  }
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
        <section className="account-card security-card">
          <div className="settings-card-head">
            <Icon name="mail" />
            <div>
              <h2>Email Verification</h2>
              <p>Your email is verified and secured.</p>
            </div>
            <span className="status active">Verified</span>
          </div>
          <button className="ghost">Change Email</button>
        </section>
        <section className="account-card security-card">
          <div className="settings-card-head">
            <Icon name="lock" />
            <div>
              <h2>Password</h2>
              <p>Your password is strong and secure.</p>
            </div>
            <span className="status active">Strong</span>
          </div>
          <button className="ghost">Change Password</button>
        </section>
        <section className="account-card privacy-settings-card">
          <div className="settings-card-head">
            <Icon name="shield" />
            <div>
              <h2>Privacy & Data Protection</h2>
              <p>Control how your data is used and shared.</p>
            </div>
          </div>
          <div className="settings-split-row">
            <label>
              Profile visibility
              <select defaultValue="limited">
                <option value="limited">Limited</option>
                <option value="team">Support team</option>
              </select>
            </label>
            <label className="toggle-line">
              Data usage
              <input type="checkbox" defaultChecked />
            </label>
            <label className="toggle-line">
              Data sharing
              <input type="checkbox" />
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
        <section className="account-card">
          <div className="settings-card-head">
            <Icon name="bell" />
            <div>
              <h2>{t("settingsNotify")}</h2>
              <p>Choose how you want to stay updated.</p>
            </div>
          </div>
          <label className="toggle-line">
            Email notifications
            <input type="checkbox" checked={notices} onChange={toggleNotices} />
          </label>
        </section>
      </div>
    </AppShell>
  );
}
