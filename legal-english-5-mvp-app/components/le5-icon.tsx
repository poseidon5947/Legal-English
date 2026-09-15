import { LE5_ICON_PATHS, type Le5IconName } from "@/lib/le5-icon-paths";

/**
 * Approved LE5 icon (Design Freeze Pack v1.0, families I01 content · I02 areas ·
 * I03 navigation · I04 utility), rendered inline so the geometry follows the
 * surrounding text colour (`currentColor`) while the selective yellow accents
 * stay #F5E400 as approved. Icons support visible labels; they never replace
 * them, so the SVG is decorative (aria-hidden) unless a `title` is given.
 */
export function Le5Icon({ name, size = 24, className = "", title }: { name: Le5IconName; size?: number; className?: string; title?: string }) {
  return (
    <svg
      className={`le5-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <g dangerouslySetInnerHTML={{ __html: LE5_ICON_PATHS[name] }} />
    </svg>
  );
}

export type { Le5IconName };
