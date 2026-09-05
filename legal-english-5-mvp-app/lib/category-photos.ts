/**
 * Editorial photography for the three canonical MCD categories
 * (see public/home-assets/photos/CREDITS.txt for Unsplash sources).
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
  Contracts: `${P}category-contracts.jpg`,
  "Corporate Law": `${P}category-corporate.jpg`,
  "Employment Law": `${P}category-employment.jpg`,
};

export const CATEGORY_PHOTO_ALT: Record<string, string> = {
  Contracts: `${P}term-contracts-review.jpg`,
  "Corporate Law": `${P}term-corporate-boardroom.jpg`,
  "Employment Law": `${P}term-employment-team.jpg`,
};

const TERM_PHOTOS: Record<string, string[]> = {
  Contracts: [
    `${P}term-contracts-signing.jpg`,
    `${P}scenario-negotiation.jpg`,
    `${P}term-contracts-drafting.jpg`,
    `${P}term-contracts-checklist.jpg`,
    `${P}tos-signature.jpg`,
    `${P}term-contracts-paperwork.jpg`,
    `${P}category-contracts.jpg`,
    `${P}mosaic-documents.jpg`,
  ],
  "Corporate Law": [
    `${P}scenario-boardroom.jpg`,
    `${P}term-corporate-office.jpg`,
    `${P}term-corporate-analytics.jpg`,
    `${P}studio-boardroom.jpg`,
    `${P}term-corporate-press.jpg`,
    `${P}term-corporate-workspace.jpg`,
    `${P}category-corporate.jpg`,
    `${P}term-corporate-boardroom.jpg`,
  ],
  "Employment Law": [
    `${P}term-employment-interview.jpg`,
    `${P}scenario-onboarding.jpg`,
    `${P}term-employment-office.jpg`,
    `${P}term-employment-portrait.jpg`,
    `${P}term-employment-colleagues.jpg`,
    `${P}term-employment-manager.jpg`,
    `${P}category-employment.jpg`,
    `${P}help-support.jpg`,
  ],
};

const FALLBACK = `${P}mosaic-documents.jpg`;

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
