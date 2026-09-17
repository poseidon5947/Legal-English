"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Le5Icon, type Le5IconName } from "@/components/le5-icon";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { useLocale } from "@/components/locale-provider";
import { DEMO_ACCOUNTS, type Consents } from "@/lib/types";
import { trackAction } from "@/lib/track";

const COPY = {
  en: {
    kicker: "Designed for Spanish-speaking lawyers, law students, and other legal professionals.",
    h1a: "Legal English for professional legal practice.",
    h1b: "",
    lead: "Study essential legal terminology through focused lessons with clear explanations, professional legal context and guidance for Spanish-speaking legal professionals.",
    features: [
      ["Legal terms in context", "Study Contracts, Corporate Law and Employment Law with clear definitions and professional usage."],
      ["Guidance that matters", "Learn legal collocations and review comparative notes when they are relevant."],
      ["Saved progress", "Return to terms, focused quizzes and your saved learning status."],
    ],
    secure: "We use reasonable safeguards to protect your personal data and do not sell it. See our Privacy Policy for details.",
    needHelp: "Need help?",
    home: "Home",
    titleSignup: "Create your account",
    titleRecover: "Recover access",
    subRecoverReset: "Enter the code from your email and choose a new password.",
    titleLogin: "Welcome back",
    subSignup: "Create your account, then activate the 7-day free trial. A valid credit card is required to activate the trial.",
    subRecover: "Follow the steps below to continue.",
    subLogin: "Sign in to continue from your saved progress.",
    signIn: "Sign In",
    createAccount: "Create Account",
    fullName: "Full name",
    fullNamePh: "Enter your full name",
    email: "Email address",
    emailPh: "Enter your email",
    password: "Password",
    passwordPhNew: "Create a password",
    passwordPh: "Enter your password",
    passwordPhReset: "Enter your new password",
    passwordLabelReset: "New password",
    passwordRules: "Use at least 8 characters.",
    recoverHint: "Check your email for a 6-digit code or a reset link, then enter your new password below.",
    togglePassword: "Toggle password visibility",
    code: "Verification code",
    codePh: "Enter 6-digit code",
    forgot: "Forgot password?",
    consentTerms: "I accept the Legal English 5 ",
    consentTermsLink: "Terms of Service",
    consentData: "I authorize MPC LAW STUDIO to process my personal data to create and administer my account, provide the service, save my progress, manage support, security, the trial, subscriptions and payments, as described in the ",
    consentDataLink: "Personal Data Processing and Privacy Policy",
    consentDataEnd: ". I understand my rights and how to exercise them.",
    consentMarketing: "I would like to receive news, educational content and offers from Legal English 5. I can withdraw this authorization at any time.",
    consentRequired: "Accept the Terms of Service and the personal data processing authorization to create your account.",
    optional: "Optional",
    sendReset: "Send Reset Link",
    confirm: "Confirm Account",
    updatePassword: "Update Password",
    demoDivider: "or try an alpha demo account",
    demoOwner: "Owner",
    demoLearner: "Learner",
    secureTitle: "Privacy",
    secureBody: "We use reasonable safeguards to protect your personal data and do not sell it. See our Privacy Policy for details.",
    tos: "Terms of Service",
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
    forgotHint: "We will email a 6-digit code or a reset link. Then enter that code and choose a new password.",
  },
  es: {
    kicker: "Diseñado para abogados, estudiantes de Derecho y otros profesionales jurídicos hispanohablantes.",
    h1a: "Legal English para la práctica jurídica profesional.",
    h1b: "",
    lead: "Estudia terminología jurídica esencial mediante lecciones enfocadas, explicaciones claras, contexto jurídico profesional y orientación para profesionales jurídicos hispanohablantes.",
    features: [
      ["Términos jurídicos en contexto", "Estudia Contracts, Corporate Law y Employment Law con definiciones claras y uso profesional."],
      ["Orientación relevante", "Aprende colocaciones jurídicas y revisa notas comparadas cuando correspondan."],
      ["Progreso guardado", "Vuelve a los términos, los quizzes breves y tu estado de aprendizaje."],
    ],
    secure: "Aplicamos medidas razonables para proteger tus datos personales y no los vendemos. Consulta la Política de Tratamiento de Datos Personales y Privacidad.",
    needHelp: "¿Necesitas ayuda?",
    home: "Inicio",
    titleSignup: "Crea tu cuenta",
    titleRecover: "Recuperar acceso",
    subRecoverReset: "Escribe el código de tu correo y elige una contraseña nueva.",
    titleLogin: "Bienvenido de nuevo",
    subSignup: "Crea tu cuenta y luego activa la prueba gratis de 7 días. Se requiere una tarjeta de crédito válida para activarla.",
    subRecover: "Sigue los pasos para continuar.",
    subLogin: "Inicia sesión para continuar desde tu progreso guardado.",
    signIn: "Iniciar sesión",
    createAccount: "Crear cuenta",
    fullName: "Nombre completo",
    fullNamePh: "Escribe tu nombre completo",
    email: "Correo electrónico",
    emailPh: "Escribe tu correo",
    password: "Contraseña",
    passwordPhNew: "Crea una contraseña",
    passwordPh: "Escribe tu contraseña",
    passwordPhReset: "Escribe tu nueva contraseña",
    passwordLabelReset: "Nueva contraseña",
    passwordRules: "Usa al menos 8 caracteres.",
    recoverHint: "Revisa tu correo: trae un código de 6 dígitos o un enlace. Luego escribe tu nueva contraseña.",
    togglePassword: "Mostrar u ocultar contraseña",
    code: "Código de verificación",
    codePh: "Código de 6 dígitos",
    forgot: "¿Olvidaste tu contraseña?",
    consentTerms: "Acepto los ",
    consentTermsLink: "Términos del Servicio de Legal English 5",
    consentData: "Autorizo a MPC LAW STUDIO a tratar mis datos personales para crear y administrar mi cuenta, prestar el servicio, guardar mi progreso, gestionar soporte, seguridad, prueba, suscripción y pagos, conforme a la ",
    consentDataLink: "Política de Tratamiento de Datos Personales y Privacidad",
    consentDataEnd: ". Conozco mis derechos y los canales para ejercerlos.",
    consentMarketing: "Quiero recibir novedades, contenidos y ofertas de Legal English 5. Puedo retirar esta autorización en cualquier momento.",
    consentRequired: "Acepta los Términos del Servicio y la autorización de tratamiento de datos personales para crear tu cuenta.",
    optional: "Opcional",
    sendReset: "Enviar enlace",
    confirm: "Confirmar cuenta",
    updatePassword: "Actualizar contraseña",
    demoDivider: "o prueba una cuenta demo del alpha",
    demoOwner: "Titular",
    demoLearner: "Alumno",
    secureTitle: "Privacidad",
    secureBody: "Aplicamos medidas razonables para proteger tus datos personales y no los vendemos. Consulta la Política de Tratamiento de Datos Personales y Privacidad.",
    tos: "Términos del Servicio",
    privacy: "Política de Tratamiento de Datos Personales y Privacidad",
    cookies: "Política de Cookies",
    forgotHint: "Te enviaremos un código de 6 dígitos o un enlace. Luego escribe ese código y elige una contraseña nueva.",
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

const AUTH_APPROVED: Partial<Record<AuthIconName, Le5IconName>> = {
  "language-globe": "utility/language",
  "chevron-down": "utility/chevron",
  "check-circle": "utility/completion",
  "user-name": "navigation/account",
};
function AuthIcon({ name, className = "" }: { name: AuthIconName; className?: string }) {
  const approved = AUTH_APPROVED[name];
  if (approved) return <Le5Icon name={approved} className={`auth-ref-icon ${name === "chevron-down" ? "le5-rotate-90" : ""} ${className}`.trim()} />;
  return <img className={`auth-ref-icon ${className}`.trim()} src={`/auth-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

/**
 * Where to go after signing in: ?next= (same-origin absolute paths only), or
 * Billing with the plan chosen on the Pricing page (?plan=monthly|annual) so
 * the purchase intent survives account creation, else the dashboard.
 */
function authPath(mode: "login" | "signup") {
  const params = new URLSearchParams(window.location.search);
  const query = params.toString();
  return `${mode === "signup" ? "/signup" : "/login"}${query ? `?${query}` : ""}`;
}

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
  // IMP-13: three separate consents, all unchecked by default.
  const [consents, setConsents] = useState<Consents>({ terms: false, data: false, marketing: false });
  const toggleConsent = (key: keyof Consents) => (event: React.ChangeEvent<HTMLInputElement>) => setConsents((current) => ({ ...current, [key]: event.target.checked }));
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
      // Only a request Supabase accepted moves on to the code form. A refused
      // one (rate limit, mailer down) is reported so the learner does not wait
      // for an email that was never generated.
      const result = await forgot(email);
      if (!result.ok) {
        setError(result.message || t("couldNotContinue"));
        return;
      }
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
    if (mode === "signup" && !(consents.terms && consents.data)) {
      setError(c.consentRequired);
      return;
    }
    try {
      const result = mode === "signup" ? await signUp(name, email, password, consents) : await signIn(email, password);
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
  const subtitle = isSignup ? c.subSignup : mode === "reset" ? c.subRecoverReset : isRecovery ? c.subRecover : c.subLogin;
  // Alpha only: the seeded review accounts. Production (Supabase) has no such users.
  const demoAccounts = process.env.NEXT_PUBLIC_DATA_MODE === "production" ? [] : DEMO_ACCOUNTS.filter((account) => account.role === "Owner" || account.email.startsWith("maria"));

  return (
    <main id="main" className={`auth-reference-page ${isSignup ? "auth-signup-mode" : ""}`}>
      <section className="auth-reference-hero">
        {/* Design Freeze Pack D01.8: light panel, no photography, approved icons. */}
        <div className="auth-reference-hero-content">
          <Link className="auth-reference-brand dark" href="/">
            <BrandMark />
          </Link>

          <div className="auth-reference-kicker">
            <AuthIcon name="gold-divider" />
            <span>{c.kicker}</span>
          </div>

          <h1>{c.h1a}</h1>

          <i />

          <p className="auth-reference-lead">
            {c.lead}
          </p>

          <div className="auth-feature-list">
            {c.features.map(([heading, body], index) => {
              const icon = (["content/definition", "content/use-it-with", "utility/bookmark"] as const)[index];
              return (
              <article key={heading}>
                <span>
                  <Le5Icon name={icon} className="auth-ref-icon" />
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
          {/* D13: a visible way back to the public site; D12: help is the public Help page. */}
          <Link className="auth-reference-home" href="/">
            <Le5Icon name="navigation/home" />
            {c.home}
          </Link>
          <button type="button" onClick={() => setLocale(locale === "en" ? "es" : "en")} aria-label={t("langToggle")}>
            <AuthIcon name="language-globe" />
            {locale === "en" ? "English" : "Español"}
            <AuthIcon name="chevron-down" />
          </button>
          <Link href="/help">{c.needHelp}</Link>
        </header>

        <div className="auth-reference-card">
          <h2>{title}</h2>
          <p>{subtitle}</p>

          {isSignup && <ol className="signup-steps" aria-label={locale === "es" ? "Cómo empezar" : "Getting started"}>
            {(locale === "es" ? ["Crea tu cuenta", "Activa la prueba", "Empieza a aprender"] : ["Create account", "Activate trial", "Start learning"]).map((step, i) => <li key={step} aria-current={i === 0 ? "step" : undefined}><span>{i + 1}</span>{step}</li>)}
          </ol>}

          <div className="auth-reference-tabs">
            <button
              className={mode === "login" ? "active" : ""}
              type="button"
              onClick={() => {
                setMode("login");
                router.replace(authPath("login"));
              }}
            >
              {c.signIn}
            </button>
            <button
              className={mode === "signup" ? "active" : ""}
              type="button"
              onClick={() => {
                setMode("signup");
                router.replace(authPath("signup"));
              }}
            >
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
                {mode === "reset" ? c.passwordLabelReset : c.password}
                <span>
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={isSignup || mode === "reset" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={mode === "reset" ? c.passwordPhReset : isSignup ? c.passwordPhNew : c.passwordPh}
                    minLength={8}
                    required
                  />
                  <button type="button" aria-label={c.togglePassword} onClick={() => setShowPassword((value) => !value)}>
                    <AuthIcon name={showPassword ? "lock-password" : "eye-visibility"} />
                  </button>
                </span>
                {(isSignup || mode === "reset") && <small className="auth-password-hint">{c.passwordRules}</small>}
              </label>
            )}

            {mode === "forgot" && <p className="auth-recover-hint">{c.forgotHint}</p>}
            {mode === "reset" && <p className="auth-recover-hint">{c.recoverHint}</p>}

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
              <fieldset className="auth-consents">
                <legend className="sr-only">{locale === "es" ? "Consentimientos" : "Consents"}</legend>
                <div className="auth-reference-consent">
                  <input id="auth-consent-terms" type="checkbox" checked={consents.terms} onChange={toggleConsent("terms")} required />
                  <label htmlFor="auth-consent-terms">
                    {c.consentTerms}
                    <a className="auth-legal-link" href="/terms-of-service" target="_blank" rel="noopener noreferrer">{c.consentTermsLink}</a>.
                  </label>
                </div>
                <div className="auth-reference-consent">
                  <input id="auth-consent-data" type="checkbox" checked={consents.data} onChange={toggleConsent("data")} required />
                  <label htmlFor="auth-consent-data">
                    {c.consentData}
                    <a className="auth-legal-link" href="/privacy" target="_blank" rel="noopener noreferrer">{c.consentDataLink}</a>
                    {c.consentDataEnd}
                  </label>
                </div>
                <div className="auth-reference-consent optional">
                  <input id="auth-consent-marketing" type="checkbox" checked={consents.marketing} onChange={toggleConsent("marketing")} />
                  <label htmlFor="auth-consent-marketing">
                    <small>{c.optional}</small> {c.consentMarketing}
                  </label>
                </div>
                {/* NEW-02 (17 Sep 2026, Owner decision): the Controller notice is no longer
                    shown on the form; the consents link to the full Privacy Policy instead. */}
              </fieldset>
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

        <p className="auth-reference-terms" aria-label={locale === "es" ? "Enlaces legales" : "Legal links"}>
          <a className="auth-legal-link" href="/terms-of-service" target="_blank" rel="noopener noreferrer">{c.tos}</a>
          {" · "}
          <a className="auth-legal-link" href="/privacy" target="_blank" rel="noopener noreferrer">{c.privacy}</a>
          {" · "}
          <a className="auth-legal-link" href="/cookies" target="_blank" rel="noopener noreferrer">{c.cookies}</a>
        </p>
      </section>
    </main>
  );
}
