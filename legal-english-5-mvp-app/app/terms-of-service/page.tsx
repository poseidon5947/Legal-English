"use client";

import { LegalDocument } from "@/components/legal-document";
import { useLocale } from "@/components/locale-provider";
import { LEGAL_UPDATED_AT, TERMS_SECTIONS } from "@/lib/legal-content";

export default function TermsOfServicePage() {
  const { locale, t } = useLocale();
  return (
    <LegalDocument
      photo="/home-assets/photos/tos-signature.jpg"
      eyebrow={t("termsPageEyebrow")}
      title={t("termsPageTitle")}
      lead={t("termsPageLead")}
      sections={TERMS_SECTIONS[locale]}
      updatedAt={LEGAL_UPDATED_AT}
    />
  );
}
