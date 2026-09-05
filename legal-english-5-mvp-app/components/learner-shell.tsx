"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useApp } from "@/components/app-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { WorkspaceSkeleton } from "@/components/workspace-skeleton";
import { useLocale } from "@/components/locale-provider";
import { entitlementDetail, entitlementLabel } from "@/lib/i18n";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";

type ShellIcon =
  | "logo-shield"
  | "nav-home"
  | "nav-book"
  | "nav-categories"
  | "nav-progress"
  | "nav-quiz"
  | "nav-bookmark"
  | "nav-user"
  | "nav-billing-card"
  | "nav-help"
  | "nav-signout"
  | "search"
  | "bell"
  | "chevron-down"
  | "crown";

export function ShellIcon({ name, className = "" }: { name: ShellIcon; className?: string }) {
  return <img className={`terms-library-icon ${className}`.trim()} src={`/terms-library-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

export function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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

const MAIN_NAV: ReadonlyArray<readonly [LearnerKey, ShellIcon, string]> = [
  ["navHome", "nav-home", "/"],
  ["navLibrary", "nav-book", "/terms"],
  ["navCategories", "nav-categories", "/categories"],
  ["navProgress", "nav-progress", "/progress"],
  ["navQuizzes", "nav-quiz", "/quizzes"],
  ["navMyLibrary", "nav-bookmark", "/library"],
];

function isActive(path: string, href: string) {
  if (href === "/") return false;
  if (href === "/account") return path === "/account";
  if (href === "/terms") return path === "/terms" || path.startsWith("/terms/");
  return path === href || path.startsWith(`${href}/`);
}

/**
 * The signed-in workspace: sidebar (real user, real access state, working
 * sign-out), topbar (search that filters the library, language toggle) and the
 * access gates that used to live in AppShell. Every learner page renders
 * inside it so navigation is identical everywhere.
 */
export function LearnerShell({
  children,
  pageClass = "",
  search,
  onSearch,
}: {
  children: React.ReactNode;
  pageClass?: string;
  search?: string;
  onSearch?: (value: string) => void;
}) {
  const { ready, session, signOut, entitlement, reactivateAccount, inbox } = useApp();
  const { locale, t } = useLocale();
  const router = useRouter();
  const path = usePathname();
  const [query, setQuery] = useState("");
  const [reactivateMessage, setReactivateMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const L = (key: LearnerKey, vars?: Record<string, string | number>) => learnerText(locale, key, vars);
  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);
  // Mobile drawer: close on navigation and Escape; lock scroll while open.
  useEffect(() => setMenuOpen(false), [path]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);
  // "/" focuses the search box from anywhere in the workspace (not while typing).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  if (!ready || !session) {
    return <WorkspaceSkeleton status={L("opening")} />;
  }
  const isOwner = session.user.role === "admin";
  const disabled = Boolean(session.user.disabledAt);
  const locked = !disabled && !entitlement.allowed && !isOwner && path.startsWith("/terms/");
  const accountNav: ReadonlyArray<readonly [LearnerKey, ShellIcon, string]> = [
    ["navAccount", "nav-user", "/account"],
    ["navBilling", "nav-billing-card", "/billing"],
    ["navHelp", "nav-help", "/account/help"],
    ...(isOwner ? ([["navAdmin", "nav-billing-card", "/admin"]] as const) : []),
  ];
  const subscriptionActive = session.subscription.status === "active";
  const unreadMail = inbox.filter((mail) => mail.code).length;
  const searchValue = onSearch ? search ?? "" : query;
  return (
    <main className={`terms-reference-page learner-shell ${pageClass}${menuOpen ? " drawer-open" : ""}`.trim()}>
      <header className="learner-mobile-bar">
        <button
          type="button"
          className="learner-menu-toggle"
          aria-label={menuOpen ? L("closeMenu") : L("openMenu")}
          aria-expanded={menuOpen}
          aria-controls="learner-drawer"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
        <Link className="terms-reference-brand" href="/">
          <ShellIcon name="logo-shield" />
          <span>
            <strong>LEGAL ENGLISH 5</strong>
          </span>
        </Link>
        <Link className="learner-mobile-avatar" href="/account" aria-label={L("navAccount")}>
          <i className="learner-avatar" aria-hidden="true">
            {initialsOf(session.user.name)}
          </i>
        </Link>
      </header>
      {menuOpen && <button type="button" className="learner-drawer-backdrop" aria-label={L("closeMenu")} onClick={() => setMenuOpen(false)} />}
      <aside className={`terms-reference-sidebar${menuOpen ? " is-open" : ""}`} id="learner-drawer">
        <div>
          <Link className="terms-reference-brand" href="/">
            <ShellIcon name="logo-shield" />
            <span>
              <strong>LEGAL ENGLISH 5</strong>
              <small>MPC LAW STUDIO</small>
            </span>
          </Link>
          <nav className="terms-reference-nav" aria-label="Main navigation">
            {MAIN_NAV.map(([key, icon, href]) => (
              <Link className={isActive(path, href) ? "active" : ""} href={href} key={href}>
                <ShellIcon name={icon} />
                <span>{L(key)}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="terms-reference-sidebar-bottom">
          <nav className="terms-reference-nav account" aria-label="Account navigation">
            {accountNav.map(([key, icon, href]) => (
              <Link className={isActive(path, href) ? "active" : ""} href={href} key={href}>
                <ShellIcon name={icon} />
                <span>{L(key)}</span>
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                void signOut().then(() => router.push("/login"));
              }}
            >
              <ShellIcon name="nav-signout" />
              <span>{L("signOut")}</span>
            </button>
          </nav>
          <section className={`terms-trial-card${entitlement.allowed ? "" : " blocked"}`} aria-label={entitlementLabel(locale, entitlement.label)}>
            <span>
              <ShellIcon name="crown" />
            </span>
            <strong>{entitlementLabel(locale, entitlement.label)}</strong>
            <p>{entitlementDetail(locale, entitlement.detail)}</p>
            <Link href="/billing">{subscriptionActive || isOwner ? L("manageAccess") : L("upgradeNow")}</Link>
          </section>
          <div className="learner-drawer-tools">
            <LanguageToggle />
          </div>
        </div>
      </aside>

      <nav className="learner-tabbar" aria-label="Main navigation">
        {MAIN_NAV.filter(([, , href]) => href !== "/").map(([key, icon, href]) => (
          <Link className={isActive(path, href) ? "active" : ""} href={href} key={href}>
            <ShellIcon name={icon} />
            <span>{L(key)}</span>
          </Link>
        ))}
      </nav>

      <section className="terms-reference-workspace">
        <header className="terms-reference-topbar">
          <form
            className="terms-reference-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              if (onSearch) return;
              const value = query.trim();
              router.push(value ? `/terms?search=${encodeURIComponent(value)}` : "/terms");
            }}
          >
            <ShellIcon name="search" />
            <input
              ref={searchRef}
              value={searchValue}
              onChange={(event) => (onSearch ? onSearch(event.target.value) : setQuery(event.target.value))}
              placeholder={L("searchPlaceholder")}
              aria-label={L("searchPlaceholder")}
            />
            <kbd className="terms-search-kbd" aria-hidden="true">
              /
            </kbd>
          </form>
          <div className="terms-reference-user-tools">
            <LanguageToggle />
            <Link className="terms-notification" href="/account/help" aria-label={L("notifications")} title={L("notifications")}>
              <ShellIcon name="bell" />
              {unreadMail > 0 && <span />}
            </Link>
            <Link className="terms-user-pill" href="/account">
              <i className="learner-avatar" aria-hidden="true">
                {initialsOf(session.user.name)}
              </i>
              <span>
                <strong>{session.user.name}</strong>
                <small>{isOwner ? L("owner") : L("learner")}</small>
              </span>
              <ShellIcon name="chevron-down" />
            </Link>
          </div>
        </header>

        {!disabled && !session.user.emailVerified && <VerifyBanner />}

        {disabled ? (
          <div className="terms-reference-content">
            <div className="blocked-panel">
              <span>{L("accessPaused")}</span>
              <h1>{L("deactivatedTitle")}</h1>
              <p>{L("deactivatedBody")}</p>
              <button
                className="primary inline"
                onClick={() => {
                  void reactivateAccount().then((result) => setReactivateMessage(result.ok ? "" : result.message || t("couldNotContinue")));
                }}
              >
                {L("reactivate")}
              </button>
              {reactivateMessage && <p className="muted">{reactivateMessage}</p>}
            </div>
          </div>
        ) : locked ? (
          <div className="terms-reference-content">
            <div className="blocked-panel">
              <span>{L("accessPaused")}</span>
              <h1>{L("accessInactive")}</h1>
              <p>{entitlementDetail(locale, entitlement.detail)}</p>
              <p className="muted">{L("accessRefresh")}</p>
              <Link className="primary inline" href="/billing">
                {L("reviewAccess")}
              </Link>
            </div>
          </div>
        ) : (
          children
        )}
      </section>
    </main>
  );
}
