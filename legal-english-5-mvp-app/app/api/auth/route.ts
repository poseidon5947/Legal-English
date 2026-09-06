import { json, requireUser, sessionUserId } from "@/lib/api";
import { DATA_MODE, store } from "@/lib/data-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const action = String(body.action || "");
  if (action === "login") {
    const result = await store.authenticate(body.email, body.password);
    if (!result.ok) return json(result, 401, request);
    return json({ ok: true, ...(await store.bootstrap(result.user.id)) }, 200, request, result.user.id);
  }
  if (action === "signup") {
    const result = await store.register(body.name, body.email, body.password, Boolean(body.privacyAccepted));
    if (!result.ok) return json(result, 400, request);
    // sessionEstablished is false whenever Supabase requires email
    // confirmation before a session exists (the normal production
    // configuration). The client should not treat the account as signed in
    // yet — it needs to collect the emailed code and call the "verify"
    // action below, which is the only thing that establishes a session in
    // that case.
    if (!result.sessionEstablished) {
      return json({ ok: true, needsConfirmation: true, code: result.code, session: null }, 200, request);
    }
    return json({ ok: true, code: result.code, ...(await store.bootstrap(result.user.id)) }, 200, request, result.user.id);
  }
  if (action === "logout") {
    // Production: revoke the Supabase session server-side (the SSR client
    // clears its cookies); alpha: the signed cookie is deleted by json(null).
    await store.signOut();
    return json({ ok: true }, 200, request, null);
  }
  if (action === "verify") {
    // Alpha: the account already has a session (signup grants one
    // immediately), so email is optional and we fall back to it.
    // Production: there is no session yet pre-confirmation, so email must
    // come from the request body — the client keeps it from the signup form.
    const sessionUser = await requireUser();
    const email = String(body.email || sessionUser?.email || "");
    if (!email) return json({ ok: false, message: "Sign in required." }, 401, request);
    const result = await store.verifyEmail(email, String(body.code || ""));
    if (!result.ok) return json(result, 400, request);
    const userId = sessionUser?.id ?? (await sessionUserId());
    if (!userId) return json({ ok: true, session: null }, 200, request);
    return json({ ok: true, ...(await store.bootstrap(userId)) }, 200, request, userId);
  }
  if (action === "forgot") return json(await store.requestReset(body.email), 200, request);
  if (action === "reset") return json(await store.resetPassword(body.email, body.code, body.password), 200, request);
  if (action === "reset-store") {
    // Alpha-only demo convenience. Requires a signed-in Owner AND an explicit
    // opt-in on the server (ALLOW_STORE_RESET=1), so an exposed alpha
    // deployment cannot be wiped by an anonymous request.
    const actor = await requireUser();
    if (actor?.role !== "admin") return json({ ok: false, message: "Owner access required." }, 403, request);
    if (DATA_MODE !== "alpha" || process.env.ALLOW_STORE_RESET !== "1") {
      return json({ ok: false, message: "Store reset is disabled on this server." }, 403, request);
    }
    await store.resetStore();
    return json({ ok: true }, 200, request, null);
  }
  if (action === "inbox") {
    const id = await sessionUserId();
    const user = id ? await store.getUser(id) : null;
    return json({ inbox: user ? await store.inboxFor(user.email) : [] }, 200, request);
  }
  if (action === "update-profile") {
    const user = await requireUser();
    if (!user) return json({ ok: false, message: "Sign in required." }, 401, request);
    const result = await store.updateProfile(user.id, String(body.name || ""));
    if (!result.ok) return json(result, 400, request);
    return json({ ok: true, ...(await store.bootstrap(user.id)) }, 200, request);
  }
  if (action === "update-preferences") {
    const user = await requireUser();
    if (!user) return json({ ok: false, message: "Sign in required." }, 401, request);
    const result = await store.updatePreferences(user.id, body.preferences);
    if (!result.ok) return json(result, 400, request);
    return json({ ok: true, ...(await store.bootstrap(user.id)) }, 200, request);
  }
  if (action === "change-password") {
    const user = await requireUser();
    if (!user) return json({ ok: false, message: "Sign in required." }, 401, request);
    return json(await store.changeOwnPassword(user.id, String(body.currentPassword || ""), String(body.nextPassword || "")), 200, request);
  }
  if (action === "delete-account") {
    const user = await requireUser();
    if (!user) return json({ ok: false, message: "Sign in required." }, 401, request);
    const result = await store.deleteAccount(user.id);
    if (!result.ok) return json(result, 400, request);
    return json({ ok: true }, 200, request, null);
  }
  if (action === "deactivate-account") {
    const user = await requireUser();
    if (!user) return json({ ok: false, message: "Sign in required." }, 401, request);
    const result = await store.deactivateAccount(user.id);
    if (!result.ok) return json(result, 400, request);
    return json({ ok: true, ...(await store.bootstrap(user.id)) }, 200, request);
  }
  if (action === "reactivate-account") {
    const user = await requireUser();
    if (!user) return json({ ok: false, message: "Sign in required." }, 401, request);
    const result = await store.reactivateAccount(user.id);
    if (!result.ok) return json(result, 400, request);
    return json({ ok: true, ...(await store.bootstrap(user.id)) }, 200, request);
  }
  if (action === "report-issue") {
    const user = await requireUser();
    if (!user) return json({ ok: false, message: "Sign in required." }, 401, request);
    return json(await store.reportIssue(user.id, String(body.summary || ""), String(body.detail || "")), 200, request);
  }
  return json({ ok: false, message: "Unknown auth action." }, 400, request);
}
