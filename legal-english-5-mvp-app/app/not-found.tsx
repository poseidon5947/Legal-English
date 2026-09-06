"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";
import { Photo } from "@/components/photo";

const copy = {
  en: {
    eyebrow: "Error 404",
    title: "This page is not in the library.",
    tab: "Page not found",
    lead: "The address may have changed or the term you were looking for is not published yet. Try one of these instead.",
    home: "Back to home",
    library: "Open the Terms Library",
    help: "Contact support",
  },
  es: {
    eyebrow: "Error 404",
    title: "Esta página no está en la biblioteca.",
    tab: "Página no encontrada",
    lead: "La dirección pudo cambiar o el término que buscabas aún no está publicado. Prueba con una de estas opciones.",
    home: "Volver al inicio",
    library: "Abrir la biblioteca de términos",
    help: "Contactar soporte",
  },
} as const;

export default function NotFound() {
  const { locale } = useLocale();
  const c = copy[locale];
  useEffect(() => {
    document.title = `${c.tab} · Legal English 5`;
  }, [c.tab]);
  return (
    <main id="main" className="landing home-reference">
      <LandingHeader />
      <section className="not-found">
        <span className="eyebrow">{c.eyebrow}</span>
        <h1>{c.title}</h1>
        <p>{c.lead}</p>
        <div className="not-found-actions">
          <Link className="primary" href="/">
            {c.home}
          </Link>
          <Link className="ghost" href="/terms">
            {c.library}
          </Link>
          <Link href="/account/help">{c.help}</Link>
        </div>
        <figure className="not-found-photo" aria-hidden="true">
          <Photo src="/home-assets/photos/mosaic-library.jpg" size="card" priority />
        </figure>
      </section>
      <LandingFooter />
    </main>
  );
}
