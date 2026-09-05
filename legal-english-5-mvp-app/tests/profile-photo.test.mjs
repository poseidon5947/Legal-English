import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Profile photo (Account panel). The bucket is private and each learner may
// only touch the folder named after their own auth uid — the same posture
// as term audio, which is never a public static file either.
const sql = readFileSync(new URL("../supabase/migrations/005_profile_photo.sql", import.meta.url), "utf8");
const route = readFileSync(new URL("../app/api/account/avatar/route.ts", import.meta.url), "utf8");

test("users.avatar_path column is added idempotently", () => {
  assert.match(sql, /alter table public\.users add column if not exists avatar_path text/i);
});

test("avatars bucket is private with a size cap and raster-only MIME list", () => {
  assert.match(sql, /insert into storage\.buckets[\s\S]*'avatars', 'avatars', false, 524288/i);
  assert.match(sql, /array\['image\/webp', 'image\/jpeg', 'image\/png'\]/i);
});

test("storage policy is owner-bound on both read and write", () => {
  assert.match(sql, /using \(bucket_id = 'avatars' and \(storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text\)/i);
  assert.match(sql, /with check \(bucket_id = 'avatars' and \(storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text\)/i);
});

test("upload route re-validates bytes server-side and never trusts the file name", () => {
  assert.match(route, /sniffImage\(bytes\)/);
  assert.match(route, /AVATAR_MAX_BYTES = 512 \* 1024/);
  assert.match(route, /AVATAR_MAX_SIDE = 1024/);
  assert.match(route, /if \(DATA_MODE !== "alpha"\) return new Response\("Not found", \{ status: 404 \}\)/);
});
