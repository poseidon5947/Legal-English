"use client";

import { LegalDocument } from "@/components/legal-document";
import { useLocale } from "@/components/locale-provider";

export default function TermsOfServicePage() {
  const { t } = useLocale();
  return <LegalDocument doc="terms" photo="/home-assets/photos/editorial-process.jpg" eyebrow={t("termsPageEyebrow")} />;
}
