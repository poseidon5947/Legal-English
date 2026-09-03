import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required when NEXT_PUBLIC_DATA_MODE=production.`);
  return value;
}

/**
 * Request-scoped client bound to the caller's Supabase Auth session cookie.
 * Every query through this client is subject to RLS as that user — this is
 * the client every learner-facing read/write should go through.
 */
export async function getSupabaseServerClient() {
  const jar = await cookies();
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value, options } of cookiesToSet) {
          jar.set(name, value, options);
        }
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS entirely — never expose it to a request
 * that hasn't already been authorized in application code. Reserved for:
 * admin user deletion (auth.admin API has no RLS-respecting equivalent) and
 * subscription/entitlement writes from the Mercado Pago webhook, which by
 * design has no authenticated-write policy on public.subscriptions.
 */
export function getSupabaseServiceRoleClient() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
