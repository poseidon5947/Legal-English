"use client";

import { LegalDocument } from "@/components/legal-document";
import { useLocale } from "@/components/locale-provider";

export default function PrivacyPage() {
  const { t } = useLocale();
  return <LegalDocument doc="privacy" eyebrow={t("privacyPageEyebrow")} />;
}
