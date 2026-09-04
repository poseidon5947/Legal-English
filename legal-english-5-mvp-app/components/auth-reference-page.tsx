"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { useLocale } from "@/components/locale-provider";
import { DEMO_ACCOUNTS } from "@/lib/types";

const COPY = {
  en: {
    kicker: "Professional Legal English for Lawyers & Law Students",
    h1a: "Master Legal English.",
    h1b: "Advance Your Career.",
    lead: "Learn essential legal terminology through short, focused lessons with clear explanations, real-world context, and intelligent progress tracking.",
    features: [
      ["Curated Legal Terms", "Study the most important terms across Contracts, Corporate Law, and Employment Law."],
      ["Context That Matters", "See how terms are used in real legal documents and practical examples."],
      ["Track & Achieve", "Monitor your progress, take quizzes, and master terms step by step."],
    ],
    secure: "Secure. Private. Built for legal professionals.",
    needHelp: "Need help?",
    titleSignup: "Create your account",
    titleRecover: "Recover access",
    titleLogin: "Welcome back",
    subSignup: "Start your legal English learning journey.",
    subRecover: "Follow the steps below to continue.",
    subLogin: "Sign in to continue your learning journey.",
    signIn: "Sign In",
    createAccount: "Create Account",
    fullName: "Full name",
    fullNamePh: "Enter your full name",
    email: "Email address",
    emailPh: "Enter your email",
    password: "Password",
    passwordPhNew: "Create a password",
    passwordPh: "Enter your password",
    togglePassword: "Toggle password visibility",
    code: "Verification code",
    codePh: "Enter 6-digit code",
    forgot: "Forgot password?",
    consent: "I agree to the Terms of Service and Privacy Policy.",
    sendReset: "Send Reset Link",
    confirm: "Confirm Account",
    updatePassword: "Update Password",
    demoDivider: "or try an alpha demo account",
    demoOwner: "Owner",
    demoLearner: "Learner",
    secureTitle: "Your data is secure and private.",
    secureBody: "We never share your information with third parties.",
    termsA: "By signing in, you agree to our ",
    termsB: " and ",
    tos: "Terms of Service",
    privacy: "Privacy Policy",
  },
  es: {
    kicker: "Inglés jurídico profesional para abogados y estudiantes de Derecho",
    h1a: "Domina el inglés jurídico.",
    h1b: "Impulsa tu carrera.",
    lead: "Aprende la terminología jurídica esencial con lecciones breves y enfocadas, explicaciones claras, contexto real y seguimiento inteligente de tu progreso.",
    features: [
      ["Términos curados", "Estudia los términos más importantes de Contratos, Derecho corporativo y Derecho laboral."],
      ["Contexto que importa", "Mira cómo se usan los términos en documentos jurídicos reales y ejemplos prácticos."],
      ["Sigue y logra", "Controla tu progreso, haz quizzes y domina los términos paso a paso."],
    ],
    secure: "Seguro. Privado. Hecho para profesionales del Derecho.",
    needHelp: "¿Necesitas ayuda?",
    titleSignup: "Crea tu cuenta",
    titleRecover: "Recuperar acceso",
    titleLogin: "Bienvenido de nuevo",
    subSignup: "Empieza tu camino en el inglés jurídico.",
    subRecover: "Sigue los pasos para continuar.",
    subLogin: "Inicia sesión para continuar aprendiendo.",
    signIn: "Iniciar sesión",
    createAccount: "Crear cuenta",
    fullName: "Nombre completo",
    fullNamePh: "Escribe tu nombre completo",
    email: "Correo electrónico",
    emailPh: "Escribe tu correo",
    password: "Contraseña",
    passwordPhNew: "Crea una contraseña",
    passwordPh: "Escribe tu contraseña",
    togglePassword: "Mostrar u ocultar contraseña",
    code: "Código de verificación",
    codePh: "Código de 6 dígitos",
    forgot: "¿Olvidaste tu contraseña?",
    consent: "Acepto los Términos del servicio y la Política de privacidad.",
    sendReset: "Enviar enlace",
    confirm: "Confirmar cuenta",
    updatePassword: "Actualizar contraseña",
    demoDivider: "o prueba una cuenta demo del alpha",
    demoOwner: "Titular",
    demoLearner: "Alumno",
    secureTitle: "Tus datos están seguros y son privados.",
    secureBody: "Nunca compartimos tu información con terceros.",
    termsA: "Al iniciar sesión aceptas nuestros ",
    termsB: " y la ",
    tos: "Términos del servicio",
    privacy: "Política de privacidad",
  },
} as const;

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
  const { locale, setLocale, t } = useLocale();
  const c = COPY[locale];
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
  const title = isSignup ? c.titleSignup : isRecovery ? c.titleRecover : c.titleLogin;
  const subtitle = isSignup ? c.subSignup : isRecovery ? c.subRecover : c.subLogin;
  // Alpha only: the seeded review accounts. Production (Supabase) has no such users.
  const demoAccounts = process.env.NEXT_PUBLIC_DATA_MODE === "production" ? [] : DEMO_ACCOUNTS.filter((account) => account.role === "Owner" || account.email.startsWith("maria"));

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
            <span>{c.kicker}</span>
          </div>

          <h1>
            {c.h1a}
            <span>{c.h1b}</span>
          </h1>

          <i />

          <p className="auth-reference-lead">
            {c.lead}
          </p>

          <div className="auth-feature-list">
            {c.features.map(([heading, body], index) => {
              const icon = (["feature-book", "feature-chart", "feature-trophy"] as const)[index];
              return (
              <article key={heading}>
                <span>
                  <AuthIcon name={icon as AuthIconName} />
                </span>
                <div>
                  <strong>{heading}</strong>
                  <p>{body}</p>
                </div>
              </article>
              );
            })}
          </div>

          <div className="auth-reference-secure">
            <AuthIcon name="security-shield" />
            <span>{c.secure}</span>
          </div>
        </div>
      </section>

      <section className="auth-reference-panel">
        <header className="auth-reference-top">
          <button type="button" onClick={() => setLocale(locale === "en" ? "es" : "en")} aria-label={t("langToggle")}>
            <AuthIcon name="language-globe" />
            {locale === "en" ? "English" : "Español"}
            <AuthIcon name="chevron-down" />
          </button>
          <Link href="/account/help">{c.needHelp}</Link>
        </header>

        <div className="auth-reference-card">
          <h2>{title}</h2>
          <p>{subtitle}</p>

          <div className="auth-reference-tabs">
            <button className={mode === "login" ? "active" : ""} type="button" onClick={() => setMode("login")}>
              {c.signIn}
            </button>
            <button className={mode === "signup" ? "active" : ""} type="button" onClick={() => setMode("signup")}>
              {c.createAccount}
            </button>
          </div>

          <form className="auth-reference-form" onSubmit={(event) => void submit(event)}>
            {isSignup && (
              <label>
                {c.fullName}
                <span>
                  <input value={name} onChange={(event) => setName(event.target.value)} placeholder={c.fullNamePh} required />
                  <AuthIcon name="user-name" />
                </span>
              </label>
            )}

            <label>
              {c.email}
              <span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={c.emailPh} required readOnly={mode === "confirm"} />
                <AuthIcon name="email-envelope" />
              </span>
            </label>

            {mode !== "forgot" && mode !== "confirm" && (
              <label>
                {c.password}
                <span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={isSignup ? c.passwordPhNew : c.passwordPh}
                    minLength={8}
                    required
                  />
                  <button type="button" aria-label={c.togglePassword} onClick={() => setShowPassword((value) => !value)}>
                    <AuthIcon name={showPassword ? "lock-password" : "eye-visibility"} />
                  </button>
                </span>
              </label>
            )}

            {(mode === "reset" || mode === "confirm") && (
              <label>
                {c.code}
                <span>
                  <input value={code} onChange={(event) => setCode(event.target.value)} placeholder={c.codePh} required />
                  <AuthIcon name="check-circle" />
                </span>
              </label>
            )}

            {mode === "login" && (
              <button className="auth-forgot-link" type="button" onClick={() => setMode("forgot")}>
                {c.forgot}
              </button>
            )}

            {mode === "signup" && (
              <label className="auth-reference-consent">
                <input type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} />
                <span>{c.consent}</span>
              </label>
            )}

            {error && (
              <p className="auth-reference-error" role="alert">
                {error}
              </p>
            )}
            {notice && <p className="auth-reference-notice">{notice}</p>}

            <button className="auth-reference-submit" type="submit">
              {mode === "login" ? c.signIn : mode === "signup" ? c.createAccount : mode === "forgot" ? c.sendReset : mode === "confirm" ? c.confirm : c.updatePassword}
            </button>
          </form>

          {mode === "login" && demoAccounts.length > 0 && (
            <>
              <div className="auth-reference-divider">
                <span />
                <p>{c.demoDivider}</p>
                <span />
              </div>

              <div className="auth-provider-row">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => {
                      setError("");
                      setEmail(account.email);
                      setPassword(account.password);
                      void signIn(account.email, account.password).then((result) => {
                        if (!result.ok) setError(result.message || t("couldNotContinue"));
                        else window.location.assign("/terms");
                      });
                    }}
                  >
                    <AuthIcon name="user-name" />
                    {account.role === "Owner" ? c.demoOwner : c.demoLearner} · {account.email.split("@")[0]}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="auth-reference-security-note">
            <AuthIcon name="security-shield" />
            <div>
              <strong>{c.secureTitle}</strong>
              <span>{c.secureBody}</span>
            </div>
          </div>
        </div>

        <p className="auth-reference-terms">
          {c.termsA}
          <Link href="/terms-of-service">{c.tos}</Link>
          {c.termsB}
          <Link href="/privacy">{c.privacy}</Link>.
        </p>
      </section>
    </main>
  );
}
