import { readFileSync } from "fs";
import { requireUser } from "@/lib/api";
import { DATA_MODE, store } from "@/lib/data-store";
import { canStudyTerm } from "@/lib/access";
import { audioFile } from "@/lib/store";

export const runtime = "nodejs";

// Alpha playback endpoint. Audio is never a public static file: the caller
// needs a session, and a Learner additionally needs a published Term and a
// valid entitlement — the same server-side gate that protects the Term text.
// Production mode does not use this route; lib/store.supabase.ts hands the
// client short-lived signed Storage URLs after the same RLS-scoped check.
export async function GET(_request: Request, context: { params: Promise<{ termId: string; jurisdiction: string }> }) {
  if (DATA_MODE !== "alpha") return new Response("Not found", { status: 404 });
  const { termId, jurisdiction } = await context.params;
  if (jurisdiction !== "us" && jurisdiction !== "uk") return new Response("Not found", { status: 404 });
  const user = await requireUser();
  if (!user) return new Response("Sign in required.", { status: 401 });
  const { terms } = (await store.bootstrap(user.id)) as { terms: { id: string; published: boolean; archived: boolean }[] };
  const term = terms.find((item) => item.id === termId);
  // Same gate as the term text and every learning mutation: signed in, not
  // deactivated, entitled, and the term is published (Owner sees everything).
  const access = canStudyTerm(user, term);
  if (!access.ok) {
    if (access.reason === "missing" || access.reason === "unavailable") return new Response("Not found", { status: 404 });
    return new Response(access.message, { status: 403 });
  }
  const file = audioFile(termId, jurisdiction);
  if (!file) return new Response("Not found", { status: 404 });
  const bytes = readFileSync(file.path);
  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: { "content-type": file.contentType, "cache-control": "private, no-store", "content-length": String(bytes.length) },
  });
}
