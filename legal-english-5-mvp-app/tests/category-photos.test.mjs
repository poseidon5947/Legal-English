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

test("library cards use a different photo from the home/category hero", () => {
  for (const category of Object.keys(CATEGORY_PHOTO)) assert.notEqual(categoryPhotoAlt(category), CATEGORY_PHOTO[category]);
});

test("neighbouring terms in a category never share a photo (curriculum order)", () => {
  for (const category of Object.keys(CATEGORY_PHOTO)) {
    const rows = seed.filter((t) => t.category === category);
    const photos = rows.map((t) => termPhoto(t, seed));
    for (let i = 1; i < photos.length; i += 1) assert.notEqual(photos[i], photos[i - 1], `${rows[i].id} repeats ${rows[i - 1].id}`);
    assert.ok(new Set(photos).size >= Math.min(rows.length, 8), `${category} shows too few distinct photos`);
  }
});

test("termPhoto is stable for the same term with or without the full list", () => {
  const term = seed[0];
  assert.equal(termPhoto(term, seed), termPhoto(term, seed));
  assert.ok(termPhoto(term).startsWith("/home-assets/photos/"));
  assert.equal(termPhoto({ id: "X-1", category: "Unknown" }), "/home-assets/photos/mosaic-documents.jpg");
});
