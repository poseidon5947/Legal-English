import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ALPHA_SESSION_COOKIE, readSession, signSession } from "./crypto";
import { DATA_MODE, store } from "./data-store";

// Alpha mode signs its own session cookie here. Production mode never
// reaches this cookie logic — Supabase's SSR client sets/clears its own
// auth cookies as a side effect of signInWithPassword/signUp/signOut/
// verifyOtp inside lib/store.supabase.ts, at the point those calls happen.
export const COOKIE = ALPHA_SESSION_COOKIE;

function cookieOptions(request?: Request) {
  const proto = request?.headers.get("x-forwarded-proto") || "";
  const host = request?.headers.get("host") || "";
  const secure = proto === "https" || host.includes("trycloudflare.com");
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };
}

export async function sessionUserId() {
  return store.currentUserId();
}

export async function requireUser() {
  const id = await sessionUserId();
  if (!id) return null;
  return store.getUser(id);
}

/**
 * userId is an alpha-only concern: pass the id to sign the alpha cookie on
 * success, `null` to clear it, or omit it entirely — which is what every
 * production-mode call site should do, since store.supabase.ts already
 * managed the real Supabase auth cookie for that request.
 */
export function json(data: unknown, status = 200, request?: Request, userId?: string | null) {
  const response = NextResponse.json(data, { status });
  if (DATA_MODE === "alpha") {
    if (userId) response.cookies.set(COOKIE, signSession(userId), cookieOptions(request));
    if (userId === null) response.cookies.delete(COOKIE);
  }
  return response;
}

export async function writeSession(userId: string, request?: Request) {
  if (DATA_MODE !== "alpha") return;
  const jar = await cookies();
  jar.set(COOKIE, signSession(userId), cookieOptions(request));
}

export async function clearSession() {
  if (DATA_MODE !== "alpha") return;
  const jar = await cookies();
  jar.delete(COOKIE);
}

// Kept for any code still importing readSession indirectly through this
// module; the real implementation lives in ./crypto.
export { readSession };
