import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register(new URL("./_ts-resolver-hooks.mjs", import.meta.url));
const { sessionTerms, sessionQuery, sessionIds } = await import("../lib/learning-session.ts");

test("mixed-category practice retains the selected order through a URL round trip", () => {
  const visible = [
    { id: "CORP-001", category: "Corporate Law" },
    { id: "CON-001", category: "Contracts" },
    { id: "EMP-001", category: "Employment Law" },
  ];
  const selected = [visible[1], visible[0]];
  const query = new URLSearchParams(sessionQuery(selected));
  assert.deepEqual(sessionTerms(visible, query.get("session")), selected);
});

test("unavailable terms cannot enter a session and duplicates do not add questions", () => {
  const visible = [{ id: "CON-001" }, { id: "CORP-001" }];
  assert.deepEqual(sessionTerms(visible, "HIDDEN-001,CON-001,CON-001,UNKNOWN-002,CORP-001"), visible);
  assert.deepEqual(sessionTerms(visible, "HIDDEN-001"), []);
  assert.deepEqual(sessionTerms(visible, ""), []);
});

test("session input is bounded to five distinct, safe term identifiers", () => {
  assert.deepEqual(sessionIds("CON-001,../secret,CON-002,CON-003,CON-004,CON-005,CON-006"),
    ["CON-001", "CON-002", "CON-003", "CON-004", "CON-005"]);
});
