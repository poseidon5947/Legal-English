import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql=readFileSync(new URL("../supabase/migrations/001_initial_schema.sql",import.meta.url),"utf8");

test("RLS is enabled on every approved product structure",()=>{
 for(const table of ["users","terms","quiz_items","user_term_progress","subscriptions"]){
  assert.match(sql,new RegExp(`alter table public\\.${table} enable row level security`,"i"));
 }
});
test("progress reads are owner-bound",()=>assert.match(sql,/auth\.uid\(\)\) = user_id or public\.is_admin\(\)/i));
test("progress inserts cannot assign another owner",()=>assert.match(sql,/users create own progress[\s\S]*with check \(\(select auth\.uid\(\)\) = user_id\)/i));
test("subscription writes have no authenticated mutation policy",()=>{
 assert.doesNotMatch(sql,/create policy[^;]+subscriptions for (insert|update|delete)/i);
 assert.match(sql,/Subscription mutations are server-only/i);
});
test("student content is restricted to published, non-archived terms",()=>assert.match(sql,/published and archived_at is null/i));
