import { NextResponse } from "next/server";
import { store } from "@/lib/data-store";
import { INSIGHTS_MAX_BATCH, parseInsightEvent } from "@/lib/insights";

export const runtime = "nodejs";

/**
 * Anonymous beacon target (see components/insight-beacon.tsx). Accepts a small
 * JSON array, drops anything malformed, never sets a cookie and never reads
 * the IP or user agent. Always answers 204 so a failed beacon can never show
 * up in the visitor's console.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const list = Array.isArray(body) ? body.slice(0, INSIGHTS_MAX_BATCH) : [];
    const now = new Date();
    const events = list.map((item) => parseInsightEvent(item, now)).filter((event) => event !== null);
    if (events.length) await store.recordInsights(events);
  } catch {
    /* analytics must never break the page */
  }
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
