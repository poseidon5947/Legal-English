/**
 * Approved photography for the three Areas (Design Freeze Pack v1.0, P02–P04;
 * see public/home-assets/photos/CREDITS.txt).
 *
 * Three layers so the same photo is not repeated across a page or across
 * consecutive terms:
 *  - CATEGORY_PHOTO      hero photo per category (Home, Categories, Dashboard tiles)
 *  - CATEGORY_PHOTO_ALT  second photo per category (Terms Library cards, Categories thumbs)
 *  - TERM_PHOTOS         rotating pool per category used by termPhoto() so each
 *                        term detail banner / "continue" card shows its own image
 */
const P = "/home-assets/photos/";

export const CATEGORY_PHOTO: Record<string, string> = {
  Contracts: `${P}area-contracts.jpg`,
  "Corporate Law": `${P}area-corporate.jpg`,
  "Employment Law": `${P}area-employment.jpg`,
};

/* Design Freeze Pack v1.0: P02–P04 are the only approved Area photographs, so
   the secondary and per-term slots reuse them instead of the retired Unsplash pool. */
export const CATEGORY_PHOTO_ALT: Record<string, string> = CATEGORY_PHOTO;

const TERM_PHOTOS: Record<string, string[]> = {
  Contracts: [CATEGORY_PHOTO.Contracts],
  "Corporate Law": [CATEGORY_PHOTO["Corporate Law"]],
  "Employment Law": [CATEGORY_PHOTO["Employment Law"]],
};

const FALLBACK = `${P}common-civil.jpg`;

export function categoryPhoto(category: string): string {
  return CATEGORY_PHOTO[category] || FALLBACK;
}

export function categoryPhotoAlt(category: string): string {
  return CATEGORY_PHOTO_ALT[category] || categoryPhoto(category);
}

type PhotoTerm = { id: string; category: string };

/* Rank of each term inside its category in curriculum order (the order the
   store/library lists them), cached per terms array. Walking the pool by
   display position guarantees neighbouring cards never share a photo, even
   with MCD id gaps (CORP-010, CORP-012, CORP-018…). */
const rankCache = new WeakMap<ReadonlyArray<PhotoTerm>, Map<string, number>>();
function rankOf(term: PhotoTerm, all?: ReadonlyArray<PhotoTerm>): number {
  if (!all) {
    const digits = term.id.match(/(\d+)\s*$/)?.[1];
    if (digits) return Number(digits) - 1;
    let n = 0;
    for (const ch of term.id) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
    return n;
  }
  let ranks = rankCache.get(all);
  if (!ranks) {
    ranks = new Map();
    const seen = new Map<string, number>();
    for (const t of all) {
      if (ranks.has(t.id)) continue;
      const i = seen.get(t.category) ?? 0;
      ranks.set(t.id, i);
      seen.set(t.category, i + 1);
    }
    rankCache.set(all, ranks);
  }
  return ranks.get(term.id) ?? rankOf(term);
}

/** Stable per-term photo. Pass the full term list so consecutive terms in a category never share an image. */
export function termPhoto(term: PhotoTerm, all?: ReadonlyArray<PhotoTerm>): string {
  const pool = TERM_PHOTOS[term.category];
  if (!pool || pool.length === 0) return categoryPhoto(term.category);
  return pool[Math.max(rankOf(term, all), 0) % pool.length];
}
