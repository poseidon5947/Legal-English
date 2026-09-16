import { Le5Icon, type Le5IconName } from "@/components/le5-icon";

export type IconName =
  | "award"
  | "bell"
  | "book"
  | "bookmark"
  | "card"
  | "chevron"
  | "clipboard"
  | "courthouse"
  | "flame"
  | "headset"
  | "help"
  | "home"
  | "lock"
  | "mail"
  | "search"
  | "settings"
  | "scales"
  | "shield"
  | "speaker"
  | "target"
  | "trend"
  | "user"
  | "users"
  | "globe";

/* D20 (16 Sep 2026): every icon with an approved equivalent in the Design
 * Freeze Pack (I01–I04) renders the approved SVG. Names without an approved
 * equivalent (no I0x asset exists for them) keep the legacy raster until the
 * pack provides one; they are listed here on purpose so the gap is explicit. */
const APPROVED: Partial<Record<IconName, Le5IconName>> = {
  award: "utility/completion",
  bell: "utility/notifications",
  book: "navigation/terms-library",
  bookmark: "utility/bookmark",
  card: "navigation/billing",
  chevron: "utility/chevron",
  clipboard: "navigation/quiz",
  globe: "utility/language",
  help: "navigation/help",
  home: "navigation/home",
  scales: "content/civil-law-equivalent",
  search: "utility/search",
  settings: "navigation/settings",
  speaker: "content/pronunciation",
  target: "content/quick-quiz",
  trend: "navigation/progress",
  user: "navigation/account",
};
export const LEGACY_RASTER_ICONS: readonly IconName[] = ["courthouse", "flame", "headset", "lock", "mail", "shield", "users"];

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const approved = APPROVED[name];
  if (approved) return <Le5Icon name={approved} className={`icon ${className}`.trim()} />;
  return <img className={`icon ${className}`.trim()} src={`/generated/icons/${name}.png`} alt="" aria-hidden="true" />;
}
