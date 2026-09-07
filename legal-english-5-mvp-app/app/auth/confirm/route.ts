import { NextResponse } from "next/server";
import { DATA_MODE } from "@/lib/data-store";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Landing point for Supabase Auth email links (confirm signup / reset
// password). The app's primary flow is the 6-digit code typed into the form,
// but the default Supabase mailer sends a link, and the free tier does not
// allow changing that template until custom SMTP (Resend) is configured.
//
// Supabase verifies the token on its side (the email is confirmed by the time
// the browser gets here) and redirects with ?code=… (PKCE). Exchanging that
// code needs the verifier cookie set when signUp()/resetPasswordForEmail()
// ran, so it only succeeds in the same browser; otherwise the account is
// still confirmed and the user is sent to sign in normally.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") === "recovery" ? "recovery" : "signup";
  const code = url.searchParams.get("code");
  const errorDescription = url.searchParams.get("error_description") || url.searchParams.get("error");
  const login = new URL("/login", url.origin);

  if (errorDescription) {
    login.searchParams.set("error", errorDescription);
    return NextResponse.redirect(login);
  }
  if (DATA_MODE !== "production" || !code) {
    login.searchParams.set(type === "recovery" ? "recovery" : "confirmed", type === "recovery" ? "failed" : "1");
    return NextResponse.redirect(login);
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // Different browser/device than the one that started the flow, or an
    // expired link. Signup: the email is confirmed anyway — sign in normally.
    login.searchParams.set(type === "recovery" ? "recovery" : "confirmed", type === "recovery" ? "failed" : "1");
    return NextResponse.redirect(login);
  }
  if (type === "recovery") {
    // Session established: the form only needs the new password now.
    login.searchParams.set("recovery", "1");
    return NextResponse.redirect(login);
  }
  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
