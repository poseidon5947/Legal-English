"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFocusTrap } from "@/components/use-focus-trap";
import { useApp } from "@/components/app-provider";
import { BrandMark } from "@/components/brand-mark";
import { Le5Icon, type Le5IconName } from "@/components/le5-icon";
import { useLocale } from "@/components/locale-provider";
import { landingCopy } from "@/lib/landing-copy";
import { trackAction } from "@/lib/track";

export function LandingHeader() {
  const path = usePathname();
  const { locale, setLocale, t } = useLocale();
  const { ready, session, signOut } = useApp();
  const nav = landingCopy[locale].nav;
  const signedIn = ready && Boolean(session);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  useFocusTrap(open, headerRef);
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 1100px)");
    const closeOnDesktop = () => { if (!mobile.matches) setOpen(false); };
    mobile.addEventListener("change", closeOnDesktop);
    return () => mobile.removeEventListener("change", closeOnDesktop);
  }, []);
  // Approved main navigation (Part III): Home | Terms Library | Areas | How It Works | Pricing | About.
  const links: ReadonlyArray<readonly [string, string, Le5IconName]> = [
    ["/", nav.home, "navigation/home"],
    ["/terms", nav.library, "navigation/terms-library"],
    ["/categories", nav.areas, "navigation/areas"],
    ["/#how-it-works", nav.how, "navigation/how-it-works"],
    ["/pricing", nav.pricing, "navigation/billing"],
    ["/about", nav.about, "navigation/account"],
  ];

  // Close the mobile menu on navigation, on Escape, and lock body scroll while open.
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const menuLabel = locale === "es" ? (open ? "Cerrar menú" : "Abrir menú") : open ? "Close menu" : "Open menu";

  return (
    <header ref={headerRef} className={`landing-nav${open ? " menu-open" : ""}`}>
      <Link href="/" onClick={() => setOpen(false)}>
        <BrandMark />
      </Link>
      {/* MOB-UI-06: on small screens the nav links live in the slide-down panel,
          so Sign In used to be invisible until the menu was opened. This quick
          group is rendered on the server with the rest of the header — no
          hydration, session or breakpoint gating — and CSS shows it only on
          mobile: Sign In (or My Dashboard once the session is known) + EN/ES. */}
      <div className={`landing-nav-quick${open ? " menu-open" : ""}`}>
        {signedIn ? (
          <Link href="/dashboard" className="landing-quick-signin" onClick={() => setOpen(false)}>
            {nav.dashboard}
          </Link>
        ) : (
          <Link href="/login" className="landing-quick-signin" onClick={() => setOpen(false)}>
            {nav.signIn}
          </Link>
        )}
        <button
          type="button"
          className="home-lang"
          aria-label={t("langToggle")}
          onClick={() => setLocale(locale === "en" ? "es" : "en")}
        >
          <b className={locale === "en" ? "on" : ""}>EN</b>
          <i>/</i>
          <b className={locale === "es" ? "on" : ""}>ES</b>
        </button>
      </div>
      <button
        type="button"
        className="landing-menu-toggle"
        aria-label={menuLabel}
        aria-expanded={open}
        aria-controls="landing-menu"
        onClick={() => setOpen((value) => !value)}
      >
          <Le5Icon name={open ? "utility/close" : "utility/menu"} className="landing-nav-toggle-icon" />
        </button>
      <div className="landing-nav-links" id="landing-menu">
        <span className="landing-menu-title" aria-hidden="true">{nav.menu}</span>
        {links.map(([href, label, icon]) => (
          <Link key={href} href={href} className={(href === "/" ? path === href : path === href) ? "active" : ""} onClick={() => setOpen(false)}>
            <Le5Icon name={icon} size={22} className="landing-menu-icon" />
            <span>{label}</span>
            <Le5Icon name="utility/chevron" size={18} className="landing-menu-chevron" />
          </Link>
        ))}
        <span className="landing-menu-group" aria-hidden="true">{nav.account}</span>
        {signedIn ? (
          <>
            <button type="button" className="landing-signout" onClick={() => void signOut().then(() => setOpen(false))}>
              {nav.signOut}
            </button>
            <Link className="primary inline" href="/dashboard" onClick={() => setOpen(false)}>
              {nav.dashboard}
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" onClick={() => setOpen(false)}>
              {nav.signIn}
            </Link>
            <Link className="primary inline" href="/signup" onClick={() => { setOpen(false); trackAction("cta", "nav"); }}>
              {nav.trial}
            </Link>
          </>
        )}
        {/* Desktop language control; on phones the header bar's EN / ES is the only one (NEW-03). */}
        <span className="landing-menu-group landing-menu-lang" aria-hidden="true">{nav.language}</span>
        <button
          type="button"
          className="home-lang"
          aria-label={t("langToggle")}
          onClick={() => setLocale(locale === "en" ? "es" : "en")}
        >
          <Le5Icon name="utility/language" size={18} className="landing-lang-icon" />
          <b className={locale === "en" ? "on" : ""}>EN</b>
          <i>/</i>
          <b className={locale === "es" ? "on" : ""}>ES</b>
        </button>
      </div>
      {open && <button type="button" className="landing-menu-backdrop" aria-label={menuLabel} onClick={() => setOpen(false)} />}
    </header>
  );
}
