import { json, sessionUserId } from "@/lib/api";
import { store } from "@/lib/data-store";

export const runtime = "nodejs";

export async function GET() {
  const response = json(await store.bootstrap(await sessionUserId()));
  // The HTML head preloads this URL so the request starts before React
  // hydrates. The client fetch then reuses the preloaded response; no-store
  // keeps browsers and proxies from serving a stale session afterwards.
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "Cookie");
  return response;
}
