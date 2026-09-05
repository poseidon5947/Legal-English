"use client";

import { LegalDocument } from "@/components/legal-document";
import { useLocale } from "@/components/locale-provider";
import { LEGAL_UPDATED_AT, PRIVACY_SECTIONS } from "@/lib/legal-content";

export default function PrivacyPage() {
  const { locale, t } = useLocale();
  return (
    <LegalDocument
      photo="/home-assets/photos/legal-books.jpg"
      eyebrow={t("privacyPageEyebrow")}
      title={t("privacyPageTitle")}
      lead={t("privacyPageLead")}
      sections={PRIVACY_SECTIONS[locale]}
      updatedAt={LEGAL_UPDATED_AT}
    />
  );
}
