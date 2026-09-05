import type { ImgHTMLAttributes } from "react";
import manifest from "@/lib/photo-manifest.json";

/**
 * Responsive editorial photo.
 *
 * Every photo under public/home-assets/photos, /hero and /auth-assets/backgrounds
 * has pre-built WebP variants in a sibling `w/` folder (160/480/800/1200 px,
 * see scripts/build-photos.py) listed in lib/photo-manifest.json. The browser
 * picks the smallest file that fits the rendered box, so a 56 px thumbnail
 * costs ~3 KB instead of the 100–300 KB JPEG it used to download.
 *
 * `size` presets map to the layouts used across the app:
 *  - thumb  ≤ 96 px tiles (list rows, "continue" card)
 *  - card   grid/rail cards up to ~480 px wide
 *  - wide   banners and heroes that span the content column
 *  - full   large hero art (mosaics, auth background)
 */
type Size = "thumb" | "card" | "wide" | "full";

const SIZES: Record<Size, string> = {
  thumb: "96px",
  card: "(max-width: 700px) 100vw, 480px",
  wide: "(max-width: 1000px) 100vw, 900px",
  full: "(max-width: 1200px) 100vw, 1200px",
};

/* Largest variant offered per preset; 480 for thumbs keeps 2× screens crisp. */
const MAX_WIDTH: Record<Size, number> = { thumb: 480, card: 800, wide: 1200, full: 1200 };

type Entry = { w: number[]; ar: number };
const MANIFEST = manifest as Record<string, Entry>;

export function photoSources(src: string, size: Size = "card"): { src: string; srcSet?: string; sizes?: string } {
  const entry = MANIFEST[src];
  const match = src.match(/^(.*)\/([^/]+)\.(jpe?g|png)$/i);
  if (!entry || !match) return { src };
  const [, dir, name] = match;
  const widths = entry.w.filter((w) => w <= MAX_WIDTH[size]);
  if (widths.length === 0) widths.push(entry.w[0]);
  const variant = (w: number) => `${dir}/w/${name}-${w}.webp`;
  return {
    src: variant(widths[Math.min(widths.length - 1, size === "thumb" ? 0 : 1)]),
    srcSet: widths.map((w) => `${variant(w)} ${w}w`).join(", "),
    sizes: SIZES[size],
  };
}

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  src: string;
  size?: Size;
  /** Above-the-fold art: load eagerly with high priority (LCP). */
  priority?: boolean;
};

export function Photo({ src, size = "card", priority = false, alt = "", loading, decoding = "async", sizes, ...rest }: Props) {
  const sources = photoSources(src, size);
  return (
    <img
      {...rest}
      {...sources}
      sizes={sizes ?? sources.sizes}
      alt={alt}
      decoding={decoding}
      loading={priority ? "eager" : loading ?? "lazy"}
      fetchPriority={priority ? "high" : undefined}
    />
  );
}
