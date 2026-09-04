"use client";

import { useLocale } from "@/components/locale-provider";

/** Keyboard users jump straight past the header/sidebar to the page's <main>. */
export function SkipLink() {
  const { locale } = useLocale();
  return (
    <a
      className="skip-link"
      href="#main"
      onClick={(event) => {
        event.preventDefault();
        const main = document.getElementById("main") || document.querySelector<HTMLElement>("main");
        if (!main) return;
        if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: false });
      }}
    >
      {locale === "es" ? "Saltar al contenido" : "Skip to content"}
    </a>
  );
}
