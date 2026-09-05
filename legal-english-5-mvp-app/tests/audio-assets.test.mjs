import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";

// AUDIO-PROD-01: the Owner's approved static audio (30 AudioUS + EMP-009 UK)
// is versioned under data/audio/{TermID}/{us|uk}.mp3 with the delivery
// manifest beside it. This is the "31 expected assets" gate: nothing missing,
// nothing extra, every byte identical to what the Owner approved.
const root = new URL("../data/audio/", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("MANIFEST.json", root), "utf8"));
const seed = JSON.parse(readFileSync(new URL("../data/mcd-seed.json", import.meta.url), "utf8"));

test("manifest describes the LC-001 package: 30 US + 1 UK", () => {
  assert.equal(manifest.control, "AUDIO-PROD-01");
  assert.equal(manifest.files.length, 31);
  assert.equal(manifest.files.filter((f) => f.field === "AudioUS").length, 30);
  assert.deepEqual(manifest.files.filter((f) => f.field === "AudioUK").map((f) => f.TermID), ["EMP-009"]);
  const seedIds = new Set(seed.terms.map((t) => t.id));
  assert.ok(manifest.files.every((f) => seedIds.has(f.TermID)), "every audio TermID exists in the MCD seed");
  assert.equal(new Set(manifest.files.filter((f) => f.field === "AudioUS").map((f) => f.TermID)).size, 30, "one AudioUS per term");
});

test("every approved asset is on disk with the approved bytes (SHA-256)", () => {
  for (const f of manifest.files) {
    const jurisdiction = f.field === "AudioUS" ? "us" : "uk";
    const path = new URL(`${f.TermID}/${jurisdiction}.mp3`, root);
    assert.ok(existsSync(path), `${f.filename} missing at data/audio/${f.TermID}/${jurisdiction}.mp3`);
    const bytes = readFileSync(path);
    assert.equal(bytes.length, f.bytes, `${f.filename} size`);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), f.sha256, `${f.filename} checksum`);
  }
});

test("no stray or duplicate audio files beyond the manifest", () => {
  const onDisk = [];
  for (const dir of readdirSync(root, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    for (const file of readdirSync(new URL(`${dir.name}/`, root))) onDisk.push(`${dir.name}/${file}`);
  }
  const expected = manifest.files.map((f) => `${f.TermID}/${f.field === "AudioUS" ? "us" : "uk"}.mp3`).sort();
  assert.deepEqual(onDisk.sort(), expected);
});
