"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { useLocale } from "@/components/locale-provider";

type AuthIconName =
  | "logo-shield"
  | "feature-book"
  | "feature-chart"
  | "feature-trophy"
  | "security-shield"
  | "language-globe"
  | "chevron-down"
  | "email-envelope"
  | "eye-visibility"
  | "lock-password"
  | "user-name"
  | "google-provider"
  | "microsoft-provider"
  | "arrow-right"
  | "check-circle"
  | "help-circle"
  | "gold-divider";

type AuthMode = "login" | "signup" | "forgot" | "reset" | "confirm";

function AuthIcon({ name, className = "" }: { name: AuthIconName; className?: string }) {
  return <img className={`auth-ref-icon ${className}`.trim()} src={`/auth-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

export function AuthReferencePage({ initialMode = "login" }: { initialMode?: Extract<AuthMode, "login" | "signup"> }) {
  const router = useRouter();
  const { ready, session, signIn, signUp, forgot, resetPassword, verify } = useApp();
  const { t } = useLocale();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    if (mode === "signup" && !privacyAccepted) {
      setError(t("privacyRequired"));
      return;
    }
    try {
      const result = mode === "signup" ? await signUp(name, email, password, privacyAccepted) : await signIn(email, password);
      if (!result.ok) setError(result.message || t("couldNotContinue"));
      else if (result.needsConfirmation) {
        setNotice(t("confirmNotice"));
        setMode("confirm");
      } else window.location.assign("/terms");
    } catch {
      setError(t("loginBlocked"));
    }
  }

  const isSignup = mode === "signup";
  const isRecovery = mode === "forgot" || mode === "reset" || mode === "confirm";
  const title = isSignup ? "Create your account" : isRecovery ? "Recover access" : "Welcome back";
  const subtitle = isSignup ? "Start your legal English learning journey." : isRecovery ? "Follow the steps below to continue." : "Sign in to continue your learning journey.";

  return (
    <main className={`auth-reference-page ${isSignup ? "auth-signup-mode" : ""}`}>
      <section className="auth-reference-hero">
        <img src="/auth-assets/backgrounds/courthouse-auth.jpg" alt="" />
        <div className="auth-reference-overlay" />
        <div className="auth-reference-hero-content">
          <Link className="auth-reference-brand light" href="/">
            <AuthIcon name="logo-shield" />
            <span>
              <strong>LEGAL ENGLISH 5</strong>
              <small>MPC LAW STUDIO</small>
            </span>
          </Link>

          <div className="auth-reference-kicker">
            <AuthIcon name="gold-divider" />
            <span>Professional Legal English for Lawyers &amp; Law Students</span>
          </div>

          <h1>
            Master Legal English.
            <span>Advance Your Career.</span>
          </h1>

          <i />

          <p className="auth-reference-lead">
            Learn essential legal terminology through short, focused lessons with clear explanations, real-world context, and intelligent progress tracking.
          </p>

          <div className="auth-feature-list">
            {[
              ["Curated Legal Terms", "Study the most important terms across Contracts, Corporate Law, and Employment Law.", "feature-book"],
              ["Context That Matters", "See how terms are used in real legal documents and practical examples.", "feature-chart"],
              ["Track & Achieve", "Monitor your progress, take quizzes, and master terms step by step.", "feature-trophy"],
            ].map(([heading, body, icon]) => (
              <article key={heading}>
                <span>
                  <AuthIcon name={icon as AuthIconName} />
                </span>
                <div>
                  <strong>{heading}</strong>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="auth-reference-secure">
            <AuthIcon name="security-shield" />
            <span>Secure. Private. Built for legal professionals.</span>
          </div>
        </div>
      </section>

      <section className="auth-reference-panel">
        <header className="auth-reference-top">
          <button type="button">
            <AuthIcon name="language-globe" />
            English
            <AuthIcon name="chevron-down" />
          </button>
          <Link href="/account/help">Need help?</Link>
        </header>

        <div className="auth-reference-card">
          <h2>{title}</h2>
          <p>{subtitle}</p>

          <div className="auth-reference-tabs">
            <button className={mode === "login" ? "active" : ""} type="button" onClick={() => setMode("login")}>
              Sign In
            </button>
            <button className={mode === "signup" ? "active" : ""} type="button" onClick={() => setMode("signup")}>
              Create Account
            </button>
          </div>

          <form className="auth-reference-form" onSubmit={(event) => void submit(event)}>
            {isSignup && (
              <label>
                Full name
                <span>
                  <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your full name" required />
                  <AuthIcon name="user-name" />
                </span>
              </label>
            )}

            <label>
              Email address
              <span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" required readOnly={mode === "confirm"} />
                <AuthIcon name="email-envelope" />
              </span>
            </label>

            {mode !== "forgot" && mode !== "confirm" && (
              <label>
                Password
                <span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={isSignup ? "Create a password" : "Enter your password"}
                    minLength={8}
                    required
                  />
                  <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword((value) => !value)}>
                    <AuthIcon name={showPassword ? "lock-password" : "eye-visibility"} />
                  </button>
                </span>
              </label>
            )}

            {(mode === "reset" || mode === "confirm") && (
              <label>
                Verification code
                <span>
                  <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter 6-digit code" required />
                  <AuthIcon name="check-circle" />
                </span>
              </label>
            )}

            {mode === "login" && (
              <button className="auth-forgot-link" type="button" onClick={() => setMode("forgot")}>
                Forgot password?
              </button>
            )}

            {mode === "signup" && (
              <label className="auth-reference-consent">
                <input type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} />
                <span>I agree to the Terms of Service and Privacy Policy.</span>
              </label>
            )}

            {error && (
              <p className="auth-reference-error" role="alert">
                {error}
              </p>
            )}
            {notice && <p className="auth-reference-notice">{notice}</p>}

            <button className="auth-reference-submit" type="submit">
              {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : mode === "forgot" ? "Send Reset Link" : mode === "confirm" ? "Confirm Account" : "Update Password"}
            </button>
          </form>

          <div className="auth-reference-divider">
            <span />
            <p>or continue with</p>
            <span />
          </div>

          <div className="auth-provider-row">
            <button type="button">
              <AuthIcon name="google-provider" />
              Continue with Google
            </button>
            <button type="button">
              <AuthIcon name="microsoft-provider" />
              Continue with Microsoft
            </button>
          </div>

          <div className="auth-reference-security-note">
            <AuthIcon name="security-shield" />
            <div>
              <strong>Your data is secure and private.</strong>
              <span>We never share your information with third parties.</span>
            </div>
          </div>
        </div>

        <p className="auth-reference-terms">
          By signing in, you agree to our <Link href="/terms-of-service">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>
    </main>
  );
}
