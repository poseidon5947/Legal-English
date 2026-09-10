"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { useLocale } from "@/components/locale-provider";
import { Photo } from "@/components/photo";
import { DEMO_ACCOUNTS } from "@/lib/types";
import { trackAction } from "@/lib/track";
import { SUPPORT_EMAIL, TRIAL_DISCLOSURE } from "@/lib/commercial";

const COPY = {
  en: {
    kicker: "Designed for Spanish-speaking lawyers, law students, and other legal professionals.",
    h1a: "Master Legal English.",
    h1b: "Advance Your Career.",
    lead: "Learn essential legal terminology through short, focused lessons with clear explanations and professional legal context.",
    features: [
      ["Legal terms in context", "Study Contracts, Corporate Law, and Employment Law with definitions and usage."],
      ["Context that matters", "See how terms are used in professional legal English, with comparative notes when they apply."],
      ["Track your progress", "Open a term, take the quiz, and move from New to Learning to Mastered."],
    ],
    secure: "Secure. Private. Built for legal professionals.",
    needHelp: "Need help?",
    titleSignup: "Create your account",
    titleRecover: "Recover access",
    titleLogin: "Welcome back",
    subSignup: "Create your account, then activate the 7-day free trial. A valid credit card is required to activate the trial.",
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
    consent: "I agree to the ",
    sendReset: "Send Reset Link",
    confirm: "Confirm Account",
    updatePassword: "Update Password",
    demoDivider: "or try an alpha demo account",
    demoOwner: "Owner",
    demoLearner: "Learner",
    secureTitle: "Your data is secure and private.",
    secureBody: "We do not sell your personal data. We only share it with the providers needed to operate the service and process payments, as described in our Privacy Policy.",
    termsA: "By signing in, you agree to our ",
    termsB: " and ",
    tos: "Terms of Service",
    privacy: "Privacy Policy",
  },
  es: {
    kicker: "Diseñado para abogados, estudiantes de Derecho y otros profesionales jurídicos hispanohablantes.",
    h1a: "Domina el inglés jurídico.",
    h1b: "Impulsa tu carrera.",
    lead: "Aprende la terminología jurídica esencial con lecciones breves y enfocadas, explicaciones claras y contexto jurídico profesional.",
    features: [
      ["Términos en contexto", "Estudia Contratos, Derecho corporativo y Derecho laboral con definiciones y uso profesional."],
      ["Contexto que importa", "Mira cómo se usan los términos en inglés jurídico profesional, con notas comparadas cuando aplican."],
      ["Sigue tu progreso", "Abre un término, responde el quiz y avanza de Nuevo a En curso y a Dominado."],
    ],
    secure: "Seguro. Privado. Hecho para profesionales del Derecho.",
    needHelp: "¿Necesitas ayuda?",
    titleSignup: "Crea tu cuenta",
    titleRecover: "Recuperar acceso",
    titleLogin: "Bienvenido de nuevo",
    subSignup: "Crea tu cuenta y luego activa la prueba gratis de 7 días. Se requiere una tarjeta de crédito válida para activarla.",
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
    consent: "Acepto los ",
    sendReset: "Enviar enlace",
    confirm: "Confirmar cuenta",
    updatePassword: "Actualizar contraseña",
    demoDivider: "o prueba una cuenta demo del alpha",
    demoOwner: "Titular",
    demoLearner: "Alumno",
    secureTitle: "Tus datos están seguros y son privados.",
    secureBody: "No vendemos tus datos personales. Solo los compartimos con los proveedores necesarios para operar el servicio y procesar pagos, conforme a nuestra Política de privacidad.",
    termsA: "Al iniciar sesión aceptas nuestros ",
    termsB: " y la ",
    tos: "Términos del servicio",
    privacy: "Política de privacidad",
  },
} as const;

type AuthIconName =
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

/**
 * Where to go after signing in: ?next= (same-origin absolute paths only), or
 * Billing with the plan chosen on the Pricing page (?plan=monthly|annual) so
 * the purchase intent survives account creation, else the dashboard.
 */
function afterLogin() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") ?? "";
  if (next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") && !next.startsWith("/signup")) return next;
  const plan = params.get("plan");
  if (plan === "monthly" || plan === "annual") return `/billing?plan=${plan}`;
  return "/dashboard";
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
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  // Set when /auth/confirm exchanged a recovery link for a session: the reset
  // form then needs only the new password, and the signed-in redirect waits.
  const [linkRecovery, setLinkRecovery] = useState(false);

  // Flags left by /auth/confirm (Supabase email-link flow) on arrival.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.toString()) return;
    if (params.get("confirmed") === "1") {
      setMode("login");
      setNotice(t("emailConfirmedNotice"));
    } else if (params.get("recovery") === "1") {
      setLinkRecovery(true);
      setMode("reset");
      setNotice(t("recoveryLinkNotice"));
    } else if (params.get("recovery") === "failed") {
      setMode("forgot");
      setError(t("recoveryLinkFailed"));
    } else if (params.get("error")) {
      setError(params.get("error") || "");
    }
    // Keep the chosen plan / return path through account creation and sign-in.
    for (const key of ["confirmed", "recovery", "error"]) params.delete(key);
    window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ready && session && !linkRecovery) router.replace(afterLogin());
  }, [ready, session, router, linkRecovery]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await run();
    } catch {
      setError(t("couldNotContinue"));
    } finally {
      setBusy(false);
    }
  }

  async function run() {
    setError("");
    setNotice("");
    if (mode === "forgot") {
      await forgot(email);
      setNotice(t("forgotNotice"));
      setMode("reset");
      return;
    }
    if (mode === "reset") {
      const result = await resetPassword(email, linkRecovery ? "" : code, password);
      if (!result.ok) setError(result.message || t("couldNotReset"));
      else if (linkRecovery) {
        // Already signed in through the recovery link; go straight to the app.
        setLinkRecovery(false);
        router.push(afterLogin());
      } else {
        setNotice(t("passwordUpdated"));
        setMode("login");
      }
      return;
    }
    if (mode === "confirm") {
      const result = await verify(email, code);
      if (!result.ok) setError(result.message || t("couldNotContinue"));
      else router.push(afterLogin());
      return;
    }
    if (mode === "signup" && !privacyAccepted) {
      setError(t("privacyRequired"));
      return;
    }
    try {
      const result = mode === "signup" ? await signUp(name, email, password, privacyAccepted) : await signIn(email, password);
      if (!result.ok) setError(result.message || t("couldNotContinue"));
      // Account created = trial started (the 7-day trial opens with the account).
      else if (mode === "signup") trackAction("trial", result.needsConfirmation ? "pending-confirmation" : "active");
      if (!result.ok) return;
      if (result.needsConfirmation) {
        setNotice(t("confirmNotice"));
        setMode("confirm");
      } else router.push(afterLogin());
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
    <main id="main" className={`auth-reference-page ${isSignup ? "auth-signup-mode" : ""}`}>
      <section className="auth-reference-hero">
        <Photo src="/auth-assets/backgrounds/courthouse-auth.jpg" size="wide" priority />
        <div className="auth-reference-overlay" />
        <div className="auth-reference-hero-content">
          <Link className="auth-reference-brand light" href="/">
            <BrandMark className="light" />
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
          {/* Phones show the form first (hero moves below), so the brand needs a home up here. */}
          <Link className="auth-reference-brand dark auth-reference-brand-mobile" href="/">
            <BrandMark />
          </Link>
          <button type="button" onClick={() => setLocale(locale === "en" ? "es" : "en")} aria-label={t("langToggle")}>
            <AuthIcon name="language-globe" />
            {locale === "en" ? "English" : "Español"}
            <AuthIcon name="chevron-down" />
          </button>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{c.needHelp}</a>
        </header>

        <div className="auth-reference-card">
          <h2>{title}</h2>
          <p>{subtitle}</p>

          {isSignup && <ol className="signup-steps" aria-label={locale === "es" ? "Cómo empezar" : "Getting started"}>
            {(locale === "es" ? ["Crea tu cuenta", "Activa la prueba", "Empieza a aprender"] : ["Create account", "Activate trial", "Start learning"]).map((step, i) => <li key={step} aria-current={i === 0 ? "step" : undefined}><span>{i + 1}</span>{step}</li>)}
          </ol>}

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
                  <input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder={c.fullNamePh} required />
                  <AuthIcon name="user-name" />
                </span>
              </label>
            )}

            {!(mode === "reset" && linkRecovery) && (
              <label>
                {c.email}
                <span>
                  <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={c.emailPh} required readOnly={mode === "confirm"} />
                  <AuthIcon name="email-envelope" />
                </span>
              </label>
            )}

            {mode !== "forgot" && mode !== "confirm" && (
              <label>
                {c.password}
                <span>
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={isSignup || mode === "reset" ? "new-password" : "current-password"}
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

            {(mode === "confirm" || (mode === "reset" && !linkRecovery)) && (
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
              <>
                <p className="cta-disclosure auth-trial-note">{TRIAL_DISCLOSURE[locale]}</p>
                <div className="auth-reference-consent">
                  <input id="auth-privacy-consent" type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} />
                  <span>
                    <label htmlFor="auth-privacy-consent">{c.consent}</label>{" "}
                    <Link href="/terms-of-service">{c.tos}</Link>
                    {", "}
                    <Link href="/privacy">{c.privacy}</Link>
                    {c.termsB}
                    <Link href="/cookies">{locale === "es" ? "Política de cookies" : "Cookie Policy"}</Link>.
                  </span>
                </div>
              </>
            )}

            {error && (
              <p className="auth-reference-error" role="alert">
                {error}
              </p>
            )}
            {notice && <p className="auth-reference-notice" role="status">{notice}</p>}

            <button className="auth-reference-submit" type="submit" disabled={busy} aria-busy={busy || undefined}>
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
                        else router.push(afterLogin());
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

        {mode === "login" && <p className="auth-reference-terms">
          {c.termsA}
          <Link href="/terms-of-service">{c.tos}</Link>
          {c.termsB}
          <Link href="/privacy">{c.privacy}</Link>
          {" · "}
          <Link href="/cookies">{locale === "es" ? "Política de cookies" : "Cookie Policy"}</Link>.
        </p>}
      </section>
    </main>
  );
}
