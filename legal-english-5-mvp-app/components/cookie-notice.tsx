"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { landingCopy } from "@/lib/landing-copy";

const STORAGE = "le5.cookie-notice.v1";

/** Small, dismissible privacy notice for public pages (Ley 1581 de 2012 transparency). */
export function CookieNotice() {
  const { locale } = useLocale();
  const f = landingCopy[locale].footer;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!window.localStorage.getItem(STORAGE)) setOpen(true);
  }, []);

  if (!open) return null;
  return (
    <div className="cookie-notice" role="region" aria-label={f.cookieMore}>
      <p>{f.cookieText}</p>
      <div>
        <Link href="/privacy">{f.cookieMore}</Link>
        <button
          type="button"
          className="primary"
          onClick={() => {
            window.localStorage.setItem(STORAGE, new Date().toISOString());
            setOpen(false);
          }}
        >
          {f.cookieAccept}
        </button>
      </div>
    </div>
  );
}
