import { json, sessionUserId } from "@/lib/api";
import { store } from "@/lib/data-store";

export const runtime = "nodejs";

export async function GET() {
  return json(await store.bootstrap(await sessionUserId()));
}
