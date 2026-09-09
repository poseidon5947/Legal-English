import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n";

/**
 * Resolve the UI language on the server. A first visit with no saved
 * preference opens in English (change request CR-10). The language toggle
 * writes le5_locale; ?hl=en|es is accepted for hreflang.
 * Server components only (layouts, metadata).
 */
export async function serverLocale(): Promise<Locale> {
  const saved = (await cookies()).get("le5_locale")?.value;
  if (saved === "en" || saved === "es") return saved;
  return "en";
}
