import { json, requireUser } from "@/lib/api";
import { store } from "@/lib/data-store";

export const runtime = "nodejs";

/** Owner console → Overview: visits, top pages and Core Web Vitals for the last N days (default 14, max 90). */
export async function GET(request: Request) {
  const user = await requireUser();
  if (user?.role !== "admin") return json({ ok: false, message: "Owner access required." }, 403);
  const requested = Number(new URL(request.url).searchParams.get("days") ?? "14");
  const days = Number.isFinite(requested) ? Math.min(90, Math.max(1, Math.round(requested))) : 14;
  const result = await store.insightSummary(user.id, days);
  const response = json(result, result.ok ? 200 : 403);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
