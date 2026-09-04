"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { useLocale } from "@/components/locale-provider";
import { landingCopy } from "@/lib/landing-copy";

export function LandingHeader() {
  const path = usePathname();
  const { locale, setLocale, t } = useLocale();
  const nav = landingCopy[locale].nav;
  const links: ReadonlyArray<readonly [string, string]> = [
    ["/", nav.home],
    ["/terms", nav.library],
    ["/#how-it-works", nav.how],
    ["/pricing", nav.pricing],
    ["/about", nav.about],
  ];
  return (
    <header className="landing-nav">
      <Link href="/">
        <BrandMark />
      </Link>
      <div className="landing-nav-links">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className={(href === "/" ? path === href : path === href) ? "active" : ""}>
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
        <Link href="/login">{nav.signIn}</Link>
        <Link className="primary inline" href="/login">
          {nav.trial}
        </Link>
      </div>
    </header>
  );
}
