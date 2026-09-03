"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { DEMO_ACCOUNTS } from "@/lib/types";
import { BrandMark } from "@/components/brand-mark";
import { LanguageToggle } from "@/components/language-toggle";
import { useLocale } from "@/components/locale-provider";
import { IMAGES } from "@/lib/media";

export default function LoginPage() {
  const router = useRouter();
  const { ready, session, inbox, signIn, signUp, forgot, resetPassword, verify } = useApp();
  const { t } = useLocale();
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset" | "confirm">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("pilar@mpclaw.studio");
  const [password, setPassword] = useState("Pilar#Alpha26");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (ready && session) router.replace("/terms");
  }, [ready, session, router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (mode === "forgot") {
      await forgot(email);
      setNotice(t("forgotNotice"));
      setMode("reset");
      return;
    }
    if (mode === "reset") {
      const result = await resetPassword(email, code, password);
      if (!result.ok) setError(result.message || t("couldNotReset"));
      else {
        setNotice(t("passwordUpdated"));
        setMode("login");
      }
      return;
    }
    if (mode === "confirm") {
      const result = await verify(email, code);
      if (!result.ok) setError(result.message || t("couldNotContinue"));
      else window.location.assign("/terms");
      return;
    }
    try {
      const result = mode === "signup" ? await signUp(name, email, password) : await signIn(email, password);
      if (!result.ok) setError(result.message || t("couldNotContinue"));
      else if (result.needsConfirmation) {
        setNotice(t("confirmNotice"));
        setMode("confirm");
      } else window.location.assign("/terms");
    } catch {
      setError(t("loginBlocked"));
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <img src={IMAGES.login} alt="Counsel preparing for a hearing" />
        <span className="eyebrow">{t("loginEyebrow")}</span>
        <h1>
          {t("loginBrandTitle")}
          <br />
          <em>{t("loginBrandEm")}</em>
        </h1>
        <p>{t("loginBrandLead")}</p>
        <div className="brand-note">{t("loginBrandNote")}</div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <div className="lang-row">
            <BrandMark />
            <LanguageToggle />
          </div>
          <h2>
            {mode === "login"
              ? t("welcomeBack")
              : mode === "signup"
                ? t("startTrial")
                : mode === "confirm"
                  ? t("confirmAccount")
                  : t("recoverAccount")}
          </h2>
          <p className="muted">{mode === "signup" ? t("signupHint") : mode === "confirm" ? t("confirmHint") : t("loginHint")}</p>
          <form onSubmit={(event) => void submit(event)}>
            {mode === "signup" && (
              <label>
                {t("fullName")}
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder={t("yourName")} />
              </label>
            )}
            <label>
              {t("email")}
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required readOnly={mode === "confirm"} />
            </label>
            {mode !== "forgot" && mode !== "confirm" && (
              <label>
                {t("password")}
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
              </label>
            )}
            {(mode === "reset" || mode === "confirm") && (
              <label>
                {t("resetCode")}
                <input value={code} onChange={(e) => setCode(e.target.value)} required placeholder={t("sixDigits")} />
              </label>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            {notice && <p className="notice">{notice}</p>}
            <button className="primary wide" type="submit">
              {mode === "login"
                ? t("logIn")
                : mode === "signup"
                  ? t("createAccount")
                  : mode === "forgot"
                    ? t("sendReset")
                    : mode === "confirm"
                      ? t("confirmAction")
                      : t("updatePassword")}
            </button>
          </form>
          <div className="auth-links">
            <button className="text-button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? t("newHere") : t("alreadyAccount")}
            </button>
            <button className="text-button" onClick={() => setMode("forgot")}>
              {t("forgotPassword")}
            </button>
          </div>
          <div className="demo-box wrap">
            <strong>{t("reviewAccounts")}</strong>
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                  setMode("login");
                }}
              >
                {account.role === "Owner" ? t("roleOwner") : t("roleLearner")}
              </button>
            ))}
          </div>
          {inbox.length > 0 && (
            <aside className="inbox">
              <span className="eyebrow">Alpha Inbox</span>
              {inbox.map((item) => (
                <div key={item.id}>
                  <b>{item.subject}</b>
                  <p>{item.body}</p>
                </div>
              ))}
            </aside>
          )}
          <Link className="muted tiny" href="/review">
            {t("walkthroughLink")}
          </Link>
        </div>
      </section>
    </main>
  );
}
