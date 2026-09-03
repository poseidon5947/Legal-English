"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/i18n";

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
          <h2>{t("settingsNotify")}</h2>
          <button className={notices ? "primary" : ""} onClick={toggleNotices}>
            {notices ? t("settingsNotifyOn") : t("settingsNotifyOff")}
          </button>
        </section>
      </div>
    </AppShell>
  );
}
