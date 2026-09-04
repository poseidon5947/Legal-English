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

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <img className={`icon ${className}`.trim()} src={`/generated/icons/${name}.png`} alt="" aria-hidden="true" />;
}
