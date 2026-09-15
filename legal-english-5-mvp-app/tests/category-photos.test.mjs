import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CATEGORY_PHOTO, CATEGORY_PHOTO_ALT, categoryPhotoAlt, termPhoto } from "../lib/category-photos.ts";

const root = join(process.cwd(), "public");
const seed = JSON.parse(readFileSync(join(process.cwd(), "data", "mcd-seed.json"), "utf8")).terms;

test("every category and term photo referenced by the seed exists on disk", () => {
  const paths = new Set([...Object.values(CATEGORY_PHOTO), ...Object.values(CATEGORY_PHOTO_ALT), ...seed.map((t) => termPhoto(t, seed))]);
  for (const path of paths) assert.ok(existsSync(join(root, path)), `missing ${path}`);
});

test("every photo has its responsive WebP variants (scripts/build-photos.py)", () => {
  const manifest = JSON.parse(readFileSync(join(process.cwd(), "lib", "photo-manifest.json"), "utf8"));
  const used = new Set([...Object.values(CATEGORY_PHOTO), ...Object.values(CATEGORY_PHOTO_ALT), ...seed.map((t) => termPhoto(t, seed))]);
  for (const path of used) assert.ok(manifest[path], `${path} missing from photo manifest — run scripts/build-photos.py`);
  for (const [path, entry] of Object.entries(manifest)) {
    const [, dir, name] = path.match(/^(.*)\/([^/]+)\.jpe?g$/i);
    assert.ok(entry.w.includes(160) && entry.w.includes(480), `${path} needs 160 and 480 px variants`);
    for (const w of entry.w) assert.ok(existsSync(join(root, dir, "w", `${name}-${w}.webp`)), `missing ${dir}/w/${name}-${w}.webp`);
  }
});

// Design Freeze Pack v1.0 (15 Sep 2026): P02–P04 are the only approved Area
// photographs. Every learner-facing photo slot must resolve to one of them (or to
// the approved P05 fallback) — no retired Unsplash pool, no per-term variety.
const APPROVED = new Set([
  "/home-assets/photos/area-contracts.jpg",
  "/home-assets/photos/area-corporate.jpg",
  "/home-assets/photos/area-employment.jpg",
  "/home-assets/photos/common-civil.jpg",
]);

test("library cards and Area tiles use the approved Area photograph", () => {
  for (const category of Object.keys(CATEGORY_PHOTO)) {
    assert.ok(APPROVED.has(CATEGORY_PHOTO[category]), category);
    assert.equal(categoryPhotoAlt(category), CATEGORY_PHOTO[category]);
  }
});

test("every term resolves to its Area's approved photograph", () => {
  for (const term of seed) assert.equal(termPhoto(term, seed), CATEGORY_PHOTO[term.category], term.id);
});

test("termPhoto is stable and falls back to the approved P05 image", () => {
  const term = seed[0];
  assert.equal(termPhoto(term, seed), termPhoto(term));
  assert.equal(termPhoto({ id: "X-1", category: "Unknown" }), "/home-assets/photos/common-civil.jpg");
});
