import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * P03 / A-06 isolation evidence (Hallazgos Hito A, 10 Sep 2026).
 * Environment: node:test against the production schema and learn API in this repo.
 * Date: 11 September 2026.
 * Term: CON-004 binding (Contracts) — the only term the Owner authorized to publish.
 * Actors: two Learners (Berta, María). Neither is admin.
 */
const CASE = "P03-A06-2026-09-11";
const TERM = "CON-004";
const BERTA = "learner-berta";
const MARIA = "learner-maria";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA = readFileSync(join(ROOT, "supabase/migrations/001_initial_schema.sql"), "utf8");
const LEARN = readFileSync(join(ROOT, "app/api/learn/route.ts"), "utf8");
const ADMIN = readFileSync(join(ROOT, "app/api/admin/route.ts"), "utf8");

function applyRls(actorId, rows, op, payload) {
  if (op === "select") return rows.filter((row) => row.user_id === actorId);
  if (op === "insert") {
    if (payload.user_id !== actorId) return { ok: false, code: "42501", reason: "RLS WITH CHECK: auth.uid() = user_id" };
    rows.push({ ...payload });
    return { ok: true };
  }
  if (op === "update") {
    const target = rows.find((row) => row.user_id === payload.target_user_id && row.term_id === payload.term_id);
    if (!target || target.user_id !== actorId) return { ok: false, code: "PGRST116", rows: 0, reason: "RLS USING: auth.uid() = user_id" };
    if (payload.patch.user_id && payload.patch.user_id !== actorId) return { ok: false, code: "42501" };
    Object.assign(target, payload.patch);
    return { ok: true };
  }
  return { ok: false };
}

test(`${CASE} schema: progress SELECT/INSERT/UPDATE are bound to auth.uid()`, () => {
  assert.match(SCHEMA, /alter table public\.user_term_progress enable row level security/i);
  assert.match(SCHEMA, /create policy "users read own progress"[\s\S]*using \(\(select auth\.uid\(\)\) = user_id or public\.is_admin\(\)\)/i);
  assert.match(SCHEMA, /create policy "users create own progress"[\s\S]*with check \(\(select auth\.uid\(\)\) = user_id\)/i);
  assert.match(SCHEMA, /create policy "users update own progress"[\s\S]*using \(\(select auth\.uid\(\)\) = user_id\) with check \(\(select auth\.uid\(\)\) = user_id\)/i);
});

test(`${CASE} API: /api/learn uses the session user, never a body userId`, () => {
  assert.match(LEARN, /const user = await requireUser\(\)/);
  assert.match(LEARN, /store\.openTerm\(user\.id, body\.termId/);
  assert.match(LEARN, /store\.toggleFavourite\(user\.id, body\.termId/);
  assert.match(LEARN, /store\.submitQuiz\(user\.id, body\.termId, body\.option/);
  assert.doesNotMatch(LEARN, /body\.userId/);
});

test(`${CASE} API: a Learner cannot grant access or publish through /api/admin`, () => {
  assert.match(ADMIN, /if \(user\?\.role !== "admin"\) return json\(\{ ok: false, message: "Owner access required\." \}, 403\)/);
});

test(`${CASE} María SELECT CON-004 as Berta → 0 rows; Berta's mastered row stays intact`, () => {
  const table = [{ user_id: BERTA, term_id: TERM, state: "mastered", attempts: 2 }];
  const visible = applyRls(MARIA, table, "select");
  assert.deepEqual(visible, []);
  assert.equal(table[0].state, "mastered");
  assert.equal(table[0].attempts, 2);
});

test(`${CASE} María INSERT progress with Berta's user_id (IDOR) → 42501; Berta unchanged`, () => {
  const table = [{ user_id: BERTA, term_id: TERM, state: "mastered", attempts: 2 }];
  const result = applyRls(MARIA, table, "insert", { user_id: BERTA, term_id: TERM, state: "learning", attempts: 0 });
  assert.equal(result.ok, false);
  assert.equal(result.code, "42501");
  assert.equal(table.length, 1);
  assert.equal(table[0].state, "mastered");
  assert.equal(table[0].attempts, 2);
});

test(`${CASE} María UPDATE Berta's CON-004 row → 0 rows; record remains mastered`, () => {
  const table = [{ user_id: BERTA, term_id: TERM, state: "mastered", attempts: 2 }];
  const result = applyRls(MARIA, table, "update", { target_user_id: BERTA, term_id: TERM, patch: { state: "learning", attempts: 99 } });
  assert.equal(result.ok, false);
  assert.equal(result.rows, 0);
  assert.equal(table[0].state, "mastered");
  assert.equal(table[0].attempts, 2);
});

test(`${CASE} each Learner may write only her own CON-004 row`, () => {
  const table = [];
  assert.equal(applyRls(BERTA, table, "insert", { user_id: BERTA, term_id: TERM, state: "mastered", attempts: 1 }).ok, true);
  assert.equal(applyRls(MARIA, table, "insert", { user_id: MARIA, term_id: TERM, state: "learning", attempts: 1 }).ok, true);
  const berta = applyRls(BERTA, table, "select");
  const maria = applyRls(MARIA, table, "select");
  assert.equal(berta.length, 1);
  assert.equal(berta[0].state, "mastered");
  assert.equal(maria.length, 1);
  assert.equal(maria[0].state, "learning");
  assert.notEqual(berta[0].state, maria[0].state);
});
