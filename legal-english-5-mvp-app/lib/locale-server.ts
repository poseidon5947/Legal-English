import { cookies, headers } from "next/headers";
import type { Locale } from "@/lib/i18n";

/**
 * Resolve the UI language on the server so Spanish users never see an English
 * flash: the cookie the toggle writes wins; a first-time visitor gets the
 * language of the browser (the audience is Spanish-speaking lawyers).
 * Server components only (layouts, metadata).
 */
export async function serverLocale(): Promise<Locale> {
  const saved = (await cookies()).get("le5_locale")?.value;
  if (saved === "en" || saved === "es") return saved;
  const accept = ((await headers()).get("accept-language") ?? "").toLowerCase();
  const first = accept.split(",")[0]?.trim() ?? "";
  return first.startsWith("es") ? "es" : "en";
}
