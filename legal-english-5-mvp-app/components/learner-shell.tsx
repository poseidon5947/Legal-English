"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useApp } from "@/components/app-provider";
import { Avatar, initialsOf } from "@/components/avatar";
import { LanguageToggle } from "@/components/language-toggle";
import { WorkspaceSkeleton } from "@/components/workspace-skeleton";
import { useFocusTrap } from "@/components/use-focus-trap";
import { useLocale } from "@/components/locale-provider";
import { categoryLabel, entitlementDetail, entitlementLabel } from "@/lib/i18n";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";
import { stateOf, studyTerms } from "@/lib/learner-stats";

type ShellIcon =
  | "nav-home"
  | "nav-book"
  | "nav-categories"
  | "nav-progress"
  | "nav-quiz"
  | "nav-bookmark"
  | "nav-user"
  | "nav-billing-card"
  | "nav-help"
  | "settings-gear"
  | "nav-how"
  | "nav-signout"
  | "search"
  | "bell"
  | "chevron-down"
  | "crown";

export function ShellIcon({ name, className = "" }: { name: ShellIcon; className?: string }) {
  return <img className={`terms-library-icon ${className}`.trim()} src={`/terms-library-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

export { initialsOf };

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
  ["navHome", "nav-home", "/dashboard"],
  ["navLibrary", "nav-book", "/terms"],
  ["navCategories", "nav-categories", "/categories"],
  ["navQuizzes", "nav-quiz", "/quizzes"],
  ["navProgress", "nav-progress", "/progress"],
  ["navMyLibrary", "nav-bookmark", "/library"],
];

function isActive(path: string, href: string) {
  if (href === "/") return false;
  if (href === "/dashboard") return path === "/dashboard";
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
  const { ready, loadError, refresh, session, signOut, entitlement, reactivateAccount, inbox, terms, progress } = useApp();
  const { locale, t } = useLocale();
  const router = useRouter();
  const path = usePathname();
  const [query, setQuery] = useState("");
  const [reactivateMessage, setReactivateMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestIndex, setSuggestIndex] = useState(-1);
  const L = (key: LearnerKey, vars?: Record<string, string | number>) => learnerText(locale, key, vars);
  useEffect(() => {
    if (ready && !session) {
      // Remember where the visitor was heading so login can send them back
      // (e.g. "Open this category" on the home page → login → that category).
      const target = `${window.location.pathname}${window.location.search}`;
      router.replace(target === "/dashboard" ? "/login" : `/login?next=${encodeURIComponent(target)}`);
    }
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
  // "/" focuses the search box and "?" opens the shortcut list from anywhere
  // in the workspace (not while typing in a field).
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  // Modal surfaces contain keyboard focus and make the page behind inert;
  // focus returns to the opener when they close.
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);
  const backdropRef = useRef<HTMLButtonElement | null>(null);
  const mobileBarRef = useRef<HTMLElement | null>(null);
  useFocusTrap(shortcutsOpen, dialogRef);
  // The hamburger (in the mobile bar) stays usable so it can close the drawer it opened.
  useFocusTrap(menuOpen, drawerRef, [backdropRef, mobileBarRef]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShortcutsOpen(false);
        return;
      }
      if ((event.key !== "/" && event.key !== "?") || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) return;
      event.preventDefault();
      if (event.key === "?") setShortcutsOpen((value) => !value);
      else searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  if (!ready || !session) {
    // A failed bootstrap (offline, server restart) must not look like an
    // endless load: name the problem and offer a retry.
    if (loadError) return <WorkspaceSkeleton status={L("retry")} error={L("loadFailed")} onRetry={() => void refresh()} />;
    return <WorkspaceSkeleton status={L("opening")} />;
  }
  const isOwner = session.user.role === "admin";
  const disabled = Boolean(session.user.disabledAt);
  const locked = !disabled && !entitlement.allowed && !isOwner && path.startsWith("/terms/");
  const accountNav: ReadonlyArray<readonly [LearnerKey, ShellIcon, string]> = [
    ["navAccount", "nav-user", "/account"],
    ["navBilling", "nav-billing-card", "/billing"],
    ["navHelp", "nav-help", "/account/help"],
    ["navSettings", "settings-gear", "/account/settings"],
    ["navHowItWorks", "nav-how", "/how-it-works"],
    ...(isOwner ? ([["navAdmin", "nav-billing-card", "/admin"]] as const) : []),
  ];
  const subscriptionActive = session.subscription.status === "active";
  const unreadMail = inbox.filter((mail) => mail.code).length;
  const notificationCount = unreadMail;
  const searchValue = onSearch ? search ?? "" : query;
  // Typeahead (only where the page itself does not filter live): top matches by
  // term name first, then by definition/equivalents.
  const needle = onSearch ? "" : query.trim().toLowerCase();
  const suggestions = needle.length >= 2
    ? studyTerms(terms, session)
        .map((term) => {
          const name = term.term.toLowerCase();
          const rank = name.startsWith(needle) ? 0 : name.includes(needle) ? 1 : [term.definition, term.spanishEquivalent, term.civilLawEquivalent].join(" ").toLowerCase().includes(needle) ? 2 : -1;
          return { term, rank };
        })
        .filter((item) => item.rank >= 0)
        .sort((a, b) => a.rank - b.rank || a.term.term.localeCompare(b.term.term))
        .slice(0, 6)
        .map((item) => item.term)
    : [];
  const showSuggest = suggestOpen && needle.length >= 2;
  const goToAll = () => {
    setSuggestOpen(false);
    router.push(needle ? `/terms?search=${encodeURIComponent(query.trim())}` : "/terms");
  };
  return (
    <main id="main" className={`terms-reference-page learner-shell ${pageClass}${menuOpen ? " drawer-open" : ""}`.trim()}>
      <header className="learner-mobile-bar" ref={mobileBarRef}>
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
        <Link className="terms-reference-brand" href="/" title={L("brandHome")} aria-label={L("brandHome")}>
          <BrandMark />
        </Link>
        <Link className="learner-mobile-avatar" href="/account" aria-label={L("navAccount")}>
          <Avatar name={session.user.name} src={session.user.avatarUrl} />
        </Link>
      </header>
      {menuOpen && <button type="button" ref={backdropRef} className="learner-drawer-backdrop" aria-label={L("closeMenu")} onClick={() => setMenuOpen(false)} />}
      <aside className={`terms-reference-sidebar${menuOpen ? " is-open" : ""}`} id="learner-drawer" ref={drawerRef} aria-modal={menuOpen || undefined} role={menuOpen ? "dialog" : undefined}>
        <div>
          <Link className="terms-reference-brand" href="/" title={L("brandHome")} aria-label={L("brandHome")}>
            <BrandMark />
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
        {MAIN_NAV.filter(([, , href]) => href !== "/library").map(([key, icon, href]) => (
          <Link className={isActive(path, href) ? "active" : ""} href={href} key={href} aria-label={L(key)} aria-current={isActive(path, href) ? "page" : undefined} onFocus={(event) => event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" })}>
            <ShellIcon name={icon} />
            <span>{href === "/terms" ? (locale === "es" ? "Términos" : "Terms") : href === "/categories" ? (locale === "es" ? "Áreas" : "Areas") : href === "/quizzes" ? "Quiz" : L(key)}</span>
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
              if (showSuggest && suggestIndex >= 0 && suggestions[suggestIndex]) {
                setSuggestOpen(false);
                router.push(`/terms/${suggestions[suggestIndex].id}`);
                return;
              }
              goToAll();
            }}
          >
            <ShellIcon name="search" />
            <input
              ref={searchRef}
              value={searchValue}
              onChange={(event) => {
                if (onSearch) onSearch(event.target.value);
                else {
                  setQuery(event.target.value);
                  setSuggestOpen(true);
                  setSuggestIndex(-1);
                }
              }}
              onFocus={() => !onSearch && setSuggestOpen(true)}
              onBlur={() => window.setTimeout(() => setSuggestOpen(false), 120)}
              onKeyDown={(event) => {
                if (onSearch || !showSuggest) {
                  if (event.key === "Escape") (event.target as HTMLInputElement).blur();
                  return;
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setSuggestIndex((i) => Math.min(i + 1, suggestions.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setSuggestIndex((i) => Math.max(i - 1, -1));
                } else if (event.key === "Escape") {
                  setSuggestOpen(false);
                }
              }}
              placeholder={L("searchPlaceholder")}
              aria-label={L("searchPlaceholder")}
              role={onSearch ? undefined : "combobox"}
              aria-expanded={onSearch ? undefined : showSuggest}
              aria-controls={onSearch ? undefined : "shell-suggestions"}
              aria-autocomplete={onSearch ? undefined : "list"}
              autoComplete="off"
            />
            {showSuggest && (
              <div className="terms-suggest" id="shell-suggestions" role="listbox">
                {suggestions.length === 0 ? (
                  <p className="terms-suggest-empty">{L("emptySearch")}</p>
                ) : (
                  suggestions.map((term, index) => (
                    <Link
                      key={term.id}
                      href={`/terms/${term.id}`}
                      role="option"
                      aria-selected={index === suggestIndex}
                      className={index === suggestIndex ? "active" : ""}
                      onMouseEnter={() => setSuggestIndex(index)}
                      onClick={() => setSuggestOpen(false)}
                    >
                      <span>
                        <strong>{term.term}</strong>
                        <small>{categoryLabel(locale, term.category)}</small>
                      </span>
                      <em className={`terms-suggest-state ${stateOf(progress, term.id)}`}>{L(stateOf(progress, term.id) === "new" ? "stateNew" : stateOf(progress, term.id) === "learning" ? "stateLearning" : "stateMastered")}</em>
                    </Link>
                  ))
                )}
                <button type="button" className="terms-suggest-all" onMouseDown={(event) => event.preventDefault()} onClick={goToAll}>
                  {L("searchAll", { q: query.trim() })} →
                </button>
              </div>
            )}
            <kbd className="terms-search-kbd" aria-hidden="true">
              /
            </kbd>
          </form>
          <div className="terms-reference-user-tools">
            <LanguageToggle />
            <button type="button" className="terms-shortcuts" onClick={() => setShortcutsOpen(true)} aria-label={L("shortcutsButton")} title={L("shortcutsButton")}>
              <kbd>?</kbd>
            </button>
            <Link className="terms-notification" href="/account/help" aria-label={L("notifications")} title={L("notifications")}>
              <ShellIcon name="bell" />
              {notificationCount > 0 && <span>{notificationCount}</span>}
            </Link>
            <Link className="terms-user-pill" href="/account">
              <Avatar name={session.user.name} src={session.user.avatarUrl} />
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
      {shortcutsOpen && (
        <div className="shortcuts-backdrop" onClick={() => setShortcutsOpen(false)}>
          <div className="shortcuts-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title" ref={dialogRef} onClick={(event) => event.stopPropagation()}>
            <div className="shortcuts-head">
              <div>
                <h2 id="shortcuts-title">{L("shortcutsTitle")}</h2>
                <p>{L("shortcutsLead")}</p>
              </div>
              <button type="button" onClick={() => setShortcutsOpen(false)} aria-label={L("closeMenu")}>
                ×
              </button>
            </div>
            <div className="shortcuts-grid">
              <section>
                <h3>{L("shortcutsAnywhere")}</h3>
                <dl>
                  <div><dt><kbd>/</kbd></dt><dd>{L("shortcutSearch")}</dd></div>
                  <div><dt><kbd>↑</kbd><kbd>↓</kbd></dt><dd>{L("shortcutSuggest")}</dd></div>
                  <div><dt><kbd>Enter</kbd></dt><dd>{L("shortcutOpen")}</dd></div>
                  <div><dt><kbd>?</kbd></dt><dd>{L("shortcutHelp")}</dd></div>
                  <div><dt><kbd>Esc</kbd></dt><dd>{L("shortcutClose")}</dd></div>
                </dl>
              </section>
              <section>
                <h3>{L("shortcutsTerm")}</h3>
                <dl>
                  <div><dt><kbd>←</kbd><kbd>→</kbd></dt><dd>{L("shortcutTermNav")}</dd></div>
                  <div><dt><kbd>S</kbd></dt><dd>{L("shortcutSave")}</dd></div>
                </dl>
                <h3>{L("shortcutsQuiz")}</h3>
                <dl>
                  <div><dt><kbd>1</kbd>–<kbd>4</kbd></dt><dd>{L("shortcutQuizPick")}</dd></div>
                  <div><dt><kbd>Enter</kbd></dt><dd>{L("shortcutQuizCheck")}</dd></div>
                </dl>
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
