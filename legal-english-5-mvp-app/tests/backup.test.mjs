import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { register } from "node:module";

register(new URL("./_ts-resolver-hooks.mjs", import.meta.url));
register(new URL("./_next-stub-hooks.mjs", import.meta.url));

const {
  PUBLIC_TABLES,
  backupFilename,
  backupReadme,
  buildBackupEntries,
  concatenatedMigrations,
  jsonEntry,
  migrationFiles,
  tableSummary,
} = await import("../lib/backup.ts");
const { crc32, createZip } = await import("../lib/zip.ts");

const ROOT = new URL("..", import.meta.url).pathname;

test("PUBLIC_TABLES are created in the shipped migrations", () => {
  const sql = concatenatedMigrations(migrationFiles(ROOT));
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /create policy/i);
  for (const table of PUBLIC_TABLES) {
    assert.match(sql, new RegExp(`create table(?: if not exists)? public\\.${table}\\b`, "i"), table);
  }
});

test("migration bundle includes 001 through 012 and Storage bucket policies", () => {
  const files = migrationFiles(ROOT);
  const names = files.map((file) => file.filename);
  assert.ok(names.includes("001_initial_schema.sql"));
  assert.ok(names.includes("002_import_and_audio.sql"));
  assert.ok(names.includes("005_profile_photo.sql"));
  assert.ok(names.includes("012_quiz_sessions.sql"));
  const sql = concatenatedMigrations(files);
  assert.match(sql, /term-audio/);
  assert.match(sql, /avatars/);
  assert.match(sql, /create policy "admins manage term audio"/i);
  assert.match(sql, /create policy "users manage own avatar"/i);
});

test("createZip stores files and CRC32 matches", () => {
  const payload = Buffer.from("complete-backup");
  const zip = createZip([{ name: "database/users.json", data: payload }]);
  assert.equal(zip.subarray(0, 4).toString("binary"), "PK\x03\x04");
  assert.ok(zip.includes(Buffer.from("database/users.json")));
  assert.ok(zip.includes(payload));
  const crc = crc32(payload);
  assert.equal(zip.readUInt32LE(14), crc);
});

test("buildBackupEntries puts RLS SQL, tables and bucket files in the archive", () => {
  const tables = { users: { rows: [{ id: "owner-pilar" }] } };
  const entries = buildBackupEntries({
    manifest: {
      app: "legal-english-5",
      kind: "complete",
      exportedAt: "2026-09-19T00:00:00.000Z",
      mode: "production",
      tables: tableSummary(tables),
      storage: { "term-audio": { files: 1 }, avatars: { files: 0 } },
      authUsers: 1,
      note: "test",
    },
    tables,
    authUsers: { users: [{ id: "owner-pilar", email: "pilar@mpclaw.studio" }] },
    buckets: [{ name: "term-audio", public: false }],
    files: [jsonEntry("storage/term-audio/CON-001/us.mp3", { placeholder: true })],
  });
  const names = entries.map((entry) => entry.name);
  assert.ok(names.includes("manifest.json"));
  assert.ok(names.includes("README.txt"));
  assert.ok(names.includes("schema/rls-and-schema.sql"));
  assert.ok(names.includes("schema/migrations/001_initial_schema.sql"));
  assert.ok(names.includes("database/users.json"));
  assert.ok(names.includes("auth/users.json"));
  assert.ok(names.includes("storage/buckets.json"));
  assert.ok(names.includes("storage/term-audio/CON-001/us.mp3"));
  const readme = backupReadme({
    app: "legal-english-5",
    kind: "complete",
    exportedAt: "2026-09-19T00:00:00.000Z",
    mode: "production",
    tables: tableSummary(tables),
    storage: { "term-audio": { files: 1 } },
    note: "test",
  });
  assert.match(readme, /do not open the Supabase dashboard/i);
  assert.match(backupFilename(new Date("2026-09-19T05:09:12.000Z")), /^legal-english-5-backup-2026-09-19T050912Z\.zip$/);
});

test("Owner console offers the complete in-app backup and no longer sends the Owner to Supabase for audio", () => {
  const page = readFileSync(join(ROOT, "app/admin/page.tsx"), "utf8");
  const route = readFileSync(join(ROOT, "app/api/admin/backup/route.ts"), "utf8");
  const copy = readFileSync(join(ROOT, "lib/admin-copy.ts"), "utf8");
  const store = readFileSync(join(ROOT, "lib/store.supabase.ts"), "utf8");
  assert.match(page, /\/api\/admin\/backup/);
  assert.match(page, /exportFull/);
  assert.match(route, /store\.exportFullBackup/);
  assert.match(route, /storeBackupArchive/);
  assert.match(copy, /you do not open Supabase/i);
  assert.match(copy, /no abre Supabase/);
  assert.doesNotMatch(copy, /covered by the daily database backup/);
  assert.match(store, /CONTENT_BUCKETS/);
  assert.match(store, /term-audio/);
  assert.match(store, /avatars/);
});
