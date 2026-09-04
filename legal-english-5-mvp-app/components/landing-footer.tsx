"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { useLocale } from "@/components/locale-provider";
import { landingCopy } from "@/lib/landing-copy";

const SOCIAL_LINKS = [
  ["LinkedIn", "linkedin-footer"],
  ["Twitter", "twitter-footer"],
  ["Instagram", "instagram-footer"],
  ["YouTube", "youtube-footer"],
] as const;

export function LandingFooter() {
  const { locale } = useLocale();
  const f = landingCopy[locale].footer;
  return (
    <footer className="landing-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <BrandMark className="light" />
          <p>{f.blurb}</p>
          <div className="footer-social" aria-label="Social links">
            {SOCIAL_LINKS.map(([label, icon]) => (
              <a href="#" aria-label={label} key={label}>
                <img src={`/home-assets/icons/${icon}.png`} alt="" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
        <nav className="footer-nav">
          <div>
            <span>{f.product}</span>
            <Link href="/terms">{f.links.library}</Link>
            <Link href="/categories">{f.links.categories}</Link>
            <Link href="/#how-it-works">{f.links.how}</Link>
            <Link href="/pricing">{f.links.pricing}</Link>
            <Link href="/about">{f.links.about}</Link>
          </div>
          <div>
            <span>{f.support}</span>
            <Link href="/account/help">{f.links.helpCenter}</Link>
            <Link href="/account/help">{f.links.faqs}</Link>
            <Link href="/account/help">{f.links.contactUs}</Link>
            <Link href="/billing">{f.links.billing}</Link>
            <Link href="/review">{f.links.status}</Link>
          </div>
          <div>
            <span>{f.legal}</span>
            <Link href="/terms-of-service">{f.links.terms}</Link>
            <Link href="/privacy">{f.links.privacy}</Link>
            <Link href="/privacy">{f.links.cookies}</Link>
          </div>
          <div className="footer-contact">
            <span>{f.contact}</span>
            <a href="mailto:hello@legalenglish5.com">
              <img className="icon home-generated-icon" src="/home-assets/icons/mail.png" alt="" aria-hidden="true" />
              hello@legalenglish5.com
            </a>
            <p>{f.reply}</p>
          </div>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>{f.rights}</span>
      </div>
    </footer>
  );
}
