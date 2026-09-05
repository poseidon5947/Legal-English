"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";

const copy = {
  en: {
    eyebrow: "Something went wrong",
    title: "This page could not be opened.",
    lead: "Nothing you did caused this, and your progress is safe on the server. Try again, or go back to the library.",
    retry: "Try again",
    home: "Back to home",
    help: "Report the problem",
    ref: "Reference",
  },
  es: {
    eyebrow: "Algo salió mal",
    title: "No se pudo abrir esta página.",
    lead: "No es culpa tuya y tu progreso está a salvo en el servidor. Inténtalo de nuevo o vuelve a la biblioteca.",
    retry: "Intentar de nuevo",
    home: "Volver al inicio",
    help: "Reportar el problema",
    ref: "Referencia",
  },
} as const;

/** Branded route error boundary, styled like the 404 so failures still look like the product. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { locale } = useLocale();
  const c = copy[locale];
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="landing home-reference">
      <LandingHeader />
      <section className="not-found">
        <span className="eyebrow">{c.eyebrow}</span>
        <h1>{c.title}</h1>
        <p>{c.lead}</p>
        <div className="not-found-actions">
          <button className="primary" type="button" onClick={reset}>
            {c.retry}
          </button>
          <Link className="ghost" href="/">
            {c.home}
          </Link>
          <Link href="/account/help">{c.help}</Link>
        </div>
        {error.digest && (
          <p className="not-found-ref">
            {c.ref}: <code>{error.digest}</code>
          </p>
        )}
        <figure className="not-found-photo" aria-hidden="true">
          <img src="/home-assets/photos/mosaic-documents.jpg" alt="" loading="lazy" />
        </figure>
      </section>
      <LandingFooter />
    </main>
  );
}
