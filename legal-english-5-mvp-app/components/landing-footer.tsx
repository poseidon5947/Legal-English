"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

const SOCIAL_LINKS = [
  ["LinkedIn", "linkedin-footer"],
  ["Twitter", "twitter-footer"],
  ["Instagram", "instagram-footer"],
  ["YouTube", "youtube-footer"],
] as const;

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <BrandMark className="light" />
          <p>
            The microlearning platform for Spanish-speaking lawyers and law students. Learn legal English in 5-minute sessions that fit your schedule.
          </p>
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
            <span>Product</span>
            <Link href="/sample-terms">Terms Library</Link>
            <Link href="/sample-terms">Categories</Link>
            <Link href="/#how-it-works">How It Works</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/about">About</Link>
          </div>
          <div>
            <span>Support</span>
            <Link href="/account/help">Help Center</Link>
            <Link href="/account/help">FAQs</Link>
            <Link href="/account/help">Contact Us</Link>
            <Link href="/billing">Billing</Link>
            <Link href="/review">System Status</Link>
          </div>
          <div>
            <span>Legal</span>
            <Link href="/terms-of-service">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/privacy">Cookie Policy</Link>
          </div>
          <div className="footer-contact">
            <span>Contact</span>
            <a href="mailto:hello@legalenglish5.com">
              <img className="icon home-generated-icon" src="/home-assets/icons/mail.png" alt="" aria-hidden="true" />
              hello@legalenglish5.com
            </a>
            <p>We typically reply within one business day.</p>
          </div>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© 2025 Legal English 5. All rights reserved.</span>
      </div>
    </footer>
  );
}
