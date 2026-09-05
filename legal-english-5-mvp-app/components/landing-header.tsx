"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { useLocale } from "@/components/locale-provider";
import { landingCopy } from "@/lib/landing-copy";

export function LandingHeader() {
  const path = usePathname();
  const { locale, setLocale, t } = useLocale();
  const nav = landingCopy[locale].nav;
  const [open, setOpen] = useState(false);
  const links: ReadonlyArray<readonly [string, string]> = [
    ["/", nav.home],
    ["/terms", nav.library],
    ["/#how-it-works", nav.how],
    ["/pricing", nav.pricing],
    ["/about", nav.about],
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
    <header className={`landing-nav${open ? " menu-open" : ""}`}>
      <Link href="/" onClick={() => setOpen(false)}>
        <BrandMark />
      </Link>
      <button
        type="button"
        className="landing-menu-toggle"
        aria-label={menuLabel}
        aria-expanded={open}
        aria-controls="landing-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className="landing-nav-links" id="landing-menu">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className={(href === "/" ? path === href : path === href) ? "active" : ""} onClick={() => setOpen(false)}>
            {label}
          </Link>
        ))}
        <button
          type="button"
          className="home-lang"
          aria-label={t("langToggle")}
          onClick={() => setLocale(locale === "en" ? "es" : "en")}
        >
          <img src="/home-assets/icons/globe.png" alt="" aria-hidden="true" />
          <b className={locale === "en" ? "on" : ""}>EN</b>
          <i>/</i>
          <b className={locale === "es" ? "on" : ""}>ES</b>
        </button>
        <Link href="/login" onClick={() => setOpen(false)}>
          {nav.signIn}
        </Link>
        <Link className="primary inline" href="/login" onClick={() => setOpen(false)}>
          {nav.trial}
        </Link>
      </div>
      {open && <button type="button" className="landing-menu-backdrop" aria-label={menuLabel} onClick={() => setOpen(false)} />}
    </header>
  );
}
