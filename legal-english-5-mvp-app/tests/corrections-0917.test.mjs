import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { register } from "node:module";

register(new URL("./_ts-resolver-hooks.mjs", import.meta.url));
register(new URL("./_next-stub-hooks.mjs", import.meta.url));
const { SUPPORT_EMAIL } = await import("../lib/commercial.ts");

/** Client report "Informe complementario de correcciones móviles" (17 Sep 2026), NEW-02 … NEW-11. */

const ROOT = new URL("..", import.meta.url).pathname;
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|mjs|json|css|md)$/.test(name)) out.push(full);
  }
  return out;
}
const sources = ["app", "components", "lib", "public"].flatMap((dir) => walk(join(ROOT, dir)));

test("NEW-10: the support address is support@legalenglish.com everywhere; the old address is gone from the app", () => {
  assert.equal(SUPPORT_EMAIL, "support@legalenglish.com");
  const offenders = sources.filter((file) => readFileSync(file, "utf8").includes("support@legalenglish5.com"));
  assert.deepEqual(offenders.map((file) => file.replace(ROOT, "")), []);
});

test("NEW-02: the registration form no longer renders the Controller notice", () => {
  const form = readFileSync(join(ROOT, "components/auth-reference-page.tsx"), "utf8");
  assert.ok(!form.includes("PRIVACY_SHORT_NOTICE"), "the notice is not imported by the form");
  assert.ok(!form.includes("auth-privacy-notice"), "the notice block is not rendered");
  // The consents and their legal links stay.
  assert.ok(form.includes('href="/privacy"'));
  assert.ok(form.includes("auth-consent-marketing"));
});

test("NEW-09: Privacy and Cookies open on the title; Terms of Service keep the approved banner", () => {
  assert.ok(!readFileSync(join(ROOT, "app/privacy/page.tsx"), "utf8").includes("photo="));
  assert.ok(!readFileSync(join(ROOT, "app/cookies/page.tsx"), "utf8").includes("photo="));
  assert.ok(readFileSync(join(ROOT, "app/terms-of-service/page.tsx"), "utf8").includes("photo="));
  const help = readFileSync(join(ROOT, "app/account/help/page.tsx"), "utf8");
  assert.ok(!help.includes("help-hero-photo"));
});

test("NEW-11: every Spanish '50 %' uses a no-break space", () => {
  for (const file of ["lib/landing-copy.ts", "lib/i18n.ts", "lib/site.ts", "lib/commercial.ts"]) {
    const text = readFileSync(join(ROOT, file), "utf8");
    assert.ok(!/50 %/.test(text), `${file} still has a breakable "50 %"`);
  }
});

test("NEW-06: the learner mobile bar is logo → menu → avatar", () => {
  const shell = readFileSync(join(ROOT, "components/learner-shell.tsx"), "utf8");
  const bar = shell.slice(shell.indexOf('className="learner-mobile-bar"'), shell.indexOf("</header>"));
  const order = ["terms-reference-brand", "learner-menu-toggle", "learner-mobile-avatar"].map((cls) => bar.indexOf(cls));
  assert.ok(order[0] > 0 && order[0] < order[1] && order[1] < order[2], JSON.stringify(order));
});
