"use client";

import { LegalDocument } from "@/components/legal-document";
import { useLocale } from "@/components/locale-provider";
import { COOKIE_SECTIONS, LEGAL_UPDATED_AT } from "@/lib/legal-content";

export default function CookiesPage() {
  const { locale } = useLocale();
  const copy =
    locale === "es"
      ? { eyebrow: "Cookies", title: "Política de cookies", lead: "Qué cookies usa Legal English 5 y para qué." }
      : { eyebrow: "Cookies", title: "Cookie Policy", lead: "Which cookies Legal English 5 uses and why." };
  return (
    <LegalDocument
      photo="/home-assets/photos/privacy-lock.jpg"
      eyebrow={copy.eyebrow}
      title={copy.title}
      lead={copy.lead}
      sections={COOKIE_SECTIONS[locale]}
      updatedAt={LEGAL_UPDATED_AT}
    />
  );
}
