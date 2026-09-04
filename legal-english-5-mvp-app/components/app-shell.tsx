"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CSSProperties, FormEvent, useEffect, useState } from "react";
import { useApp } from "./app-provider";
import { BrandMark } from "@/components/brand-mark";
import { LanguageToggle } from "@/components/language-toggle";
import { useLocale } from "@/components/locale-provider";
import { Icon, IconName } from "@/components/ui-icons";
import { categoryLabel, entitlementLabel } from "@/lib/i18n";

function VerifyBanner() {
  const { inbox, verify, session } = useApp();
  const { t } = useLocale();
  const [code, setCode] = useState(inbox.find((item) => item.code)?.code || "");
  const [message, setMessage] = useState("");
  return (
    <div className="verify-banner">
      <div>
        <strong>{t("verifyTitle")}</strong>
        <p>{t("verifyBody")}</p>
      </div>
      <form
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          if (!session) return;
          void verify(session.user.email, code).then((result) => setMessage(result.ok ? t("verifyAction") : result.message || t("couldNotContinue")));
        }}
      >
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("verifyCode")} />
        <button className="primary" type="submit">
          {t("verifyAction")}
        </button>
      </form>
      {message && <small>{message}</small>}
    </div>
  );
}

function ProgressRail() {
  const { publishedTerms, progress, session, entitlement } = useApp();
  const { locale, t } = useLocale();
  const total = publishedTerms.length;
  const mastered = publishedTerms.filter((term) => progress[term.id]?.state === "mastered").length;
  const learning = publishedTerms.filter((term) => progress[term.id]?.state === "learning").length;
  const unread = publishedTerms.filter((term) => (progress[term.id]?.state || "new") === "new").length;
  const attempts = publishedTerms.reduce((sum, term) => sum + (progress[term.id]?.attempts || 0), 0);
  const score = total ? Math.round((mastered / total) * 100) : 0;
  const nextTerms = publishedTerms
    .filter((term) => progress[term.id]?.state !== "mastered")
    .slice(0, 4);
  return (
    <aside className="progress-rail" aria-label="Your progress">
      <section className="rail-card rail-score">
        <div className="rail-ring" style={{ "--score": `${score}%` } as CSSProperties}>
          <strong>{score}%</strong>
          <span>{t("mastered")}</span>
        </div>
        <div>
          <h2>{t("progressTitle")}</h2>
          <p>{session?.user.name}</p>
        </div>
      </section>
      <section className="rail-card">
        <h2>{t("masteryMix")}</h2>
        {[
          [t("stateMastered"), mastered, "shield"],
          [t("stateLearning"), learning, "flame"],
          [t("stateNew"), unread, "book"],
          [t("quizAttempts"), attempts, "target"],
        ].map(([label, value, icon]) => (
          <div className="rail-metric" key={label}>
            <Icon name={icon as IconName} />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>
      <section className="rail-card">
        <h2>{t("recommended")}</h2>
        {nextTerms.map((term) => (
          <Link href={`/terms/${term.id}`} className="rail-term" key={term.id}>
            <span>{term.term}</span>
            <small>{categoryLabel(locale, term.category)}</small>
          </Link>
        ))}
      </section>
      <section className="rail-card rail-upgrade">
        <Icon name={entitlement.allowed ? "scales" : "lock"} />
        <strong>{entitlementLabel(locale, entitlement.label)}</strong>
        <p>{entitlement.detail}</p>
        <Link href="/billing">{t("reviewAccess")}</Link>
      </section>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, session, signOut, entitlement, reactivateAccount } = useApp();
  const { locale, t } = useLocale();
  const [globalSearch, setGlobalSearch] = useState("");
  const [reactivateMessage, setReactivateMessage] = useState("");
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);
  if (!ready || !session) {
    return (
      <main className="center-screen">
        <div className="loader" />
        <p>{t("openingStudio")}</p>
      </main>
    );
  }
  const disabled = Boolean(session.user.disabledAt);
  const locked = !disabled && !entitlement.allowed && session.user.role !== "admin" && path.startsWith("/terms/");
  const links: ReadonlyArray<readonly [string, string, IconName]> = [
    ["/terms", t("navTerms"), "book"],
    ["/progress", t("navProgress"), "trend"],
    ["/billing", t("navBilling"), "card"],
    ...(session.user.role === "admin" ? ([["/admin", t("navAdmin"), "shield"]] as const) : []),
  ] as const;
  const initials = session.user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const roleLabel = session.user.role === "admin" ? t("owner") : t("learner");
  return (
    <div className="app-shell">
      <aside>
        <Link className="aside-brand" href="/terms">
          <BrandMark />
        </Link>
        <p className="alpha-flag">{session.user.role === "admin" ? t("navAdmin") : t("navLearn")}</p>
        <nav>
          {links.map(([href, label, icon]) => (
            <Link key={href} className={path.startsWith(href) ? "active" : ""} href={href}>
              <Icon name={icon} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="side-section">
          <span>{t("account")}</span>
          {(
            [
              ["/account", t("profile"), "user", path === "/account"],
              ["/account/achievements", t("achievements"), "award", path.startsWith("/account/achievements")],
              ["/account/settings", t("settings"), "settings", path.startsWith("/account/settings")],
              ["/account/help", t("help"), "help", path.startsWith("/account/help")],
            ] as const
          ).map(([href, label, icon, active]) => (
            <Link key={href} className={`side-item${active ? " active" : ""}`} href={href}>
              <Icon name={icon} />
              {label}
            </Link>
          ))}
        </div>
        <div className="upgrade-card">
          <Icon name="flame" />
          <strong>{t("startTrial")}</strong>
          <small>{entitlement.detail}</small>
          <Link className="primary inline" href="/billing">
            {t("upgradeNow")}
          </Link>
        </div>
        <div className="aside-bottom">
          <span className={`mini-status ${entitlement.allowed ? "" : "blocked"}`}>{entitlementLabel(locale, entitlement.label)}</span>
          <div className="side-user">
            <span>{initials}</span>
            <div>
              <strong>{session.user.name}</strong>
              <small>
                {roleLabel}
                {session.user.emailVerified ? "" : ` · ${t("verifyEmailHint")}`}
              </small>
            </div>
          </div>
          <button
            onClick={() => {
              void signOut().then(() => router.push("/login"));
            }}
          >
            {t("logOut")}
          </button>
        </div>
      </aside>
      <main className="content">
        <header className="topbar">
          <form
            className="top-search"
            onSubmit={(event) => {
              event.preventDefault();
              const query = globalSearch.trim();
              router.push(query ? `/terms?search=${encodeURIComponent(query)}` : "/terms");
            }}
          >
            <Icon name="search" />
            <input value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} placeholder={t("searchTerms")} aria-label={t("searchTerms")} />
          </form>
          <Link className="top-help" href="/account/help">
            <Icon name="help" />
            <span>{t("help")}</span>
          </Link>
          <LanguageToggle />
          <button className="icon-button" aria-label={t("notifications")}>
            <Icon name="bell" />
          </button>
          <Link className="user-pill" href="/account">
            <span>{initials}</span>
            <div>
              <strong>{session.user.name}</strong>
              <small>{roleLabel}</small>
            </div>
          </Link>
        </header>
        {!disabled && !session.user.emailVerified && (
          <VerifyBanner />
        )}
        {disabled ? (
          <div className="workspace-grid no-rail">
            <div className="blocked-panel">
              <span>{t("accessPaused")}</span>
              <h1>{t("accountDeactivatedTitle")}</h1>
              <p>{t("accountDeactivatedBody")}</p>
              <button
                className="primary inline"
                onClick={() => {
                  void reactivateAccount().then((result) => setReactivateMessage(result.ok ? "" : result.message || t("couldNotContinue")));
                }}
              >
                {t("reactivateAction")}
              </button>
              {reactivateMessage && <p className="muted">{reactivateMessage}</p>}
            </div>
          </div>
        ) : locked ? (
          <div className="workspace-grid no-rail">
            <div className="blocked-panel">
              <span>{t("accessPaused")}</span>
              <h1>{t("accessInactive")}</h1>
              <p>{entitlement.detail}</p>
              <p className="muted">{t("accessRefresh")}</p>
              <Link className="primary inline" href="/billing">
                {t("reviewAccess")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="workspace-grid">
            <div className="workspace-main">{children}</div>
            <ProgressRail />
          </div>
        )}
      </main>
    </div>
  );
}
