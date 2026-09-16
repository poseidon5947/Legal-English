"use client";

import { LegalDocument } from "@/components/legal-document";
import { useLocale } from "@/components/locale-provider";

export default function PrivacyPage() {
  const { t } = useLocale();
  return <LegalDocument doc="privacy" photo="/home-assets/photos/editorial-process.jpg" eyebrow={t("privacyPageEyebrow")} />;
}
