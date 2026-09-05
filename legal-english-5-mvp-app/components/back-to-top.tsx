"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/locale-provider";

/** Round button that appears after the first screen of scrolling on long public pages. */
export function BackToTop() {
  const { locale } = useLocale();
  const [show, setShow] = useState(false);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setShow(window.scrollY > window.innerHeight * 0.9);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <button
      type="button"
      className={`back-to-top${show ? " show" : ""}`}
      aria-label={locale === "es" ? "Volver arriba" : "Back to top"}
      tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M12 19V6m0 0-6 6m6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
