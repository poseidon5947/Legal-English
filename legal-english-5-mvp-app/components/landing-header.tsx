"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";

const LINKS: ReadonlyArray<readonly [string, string]> = [
  ["/", "Home"],
  ["/sample-terms", "Terms Library"],
  ["/#how-it-works", "How It Works"],
  ["/pricing", "Pricing"],
  ["/about", "About"],
];

export function LandingHeader() {
  const path = usePathname();
  return (
    <header className="landing-nav">
      <Link href="/">
        <BrandMark />
      </Link>
      <div className="landing-nav-links">
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} className={(href === "/" ? path === href : path === href) ? "active" : ""}>
            {label}
          </Link>
        ))}
        <span className="home-lang" aria-label="Language selector">
          <img src="/home-assets/icons/globe.png" alt="" aria-hidden="true" />
          EN
          <i>/</i>
          ES
        </span>
        <Link href="/login">Sign In</Link>
        <Link className="primary inline" href="/login">
          Start 7-Day Free Trial
        </Link>
      </div>
    </header>
  );
}
