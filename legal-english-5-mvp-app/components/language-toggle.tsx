"use client";

import { useLocale } from "@/components/locale-provider";
import { Icon } from "@/components/ui-icons";

export function LanguageToggle({ light = false }: { light?: boolean }) {
  const { locale, setLocale, t } = useLocale();
  const next = locale === "en" ? "es" : "en";
  return (
    <button
      type="button"
      className={`lang-toggle ${light ? "light" : ""}`}
      onClick={() => setLocale(next)}
      aria-label={t("langToggle")}
    >
      <Icon name="globe" />
      <span className={locale === "en" ? "on" : "off"}>EN</span>
      <i>/</i>
      <span className={locale === "es" ? "on" : "off"}>ES</span>
    </button>
  );
}
