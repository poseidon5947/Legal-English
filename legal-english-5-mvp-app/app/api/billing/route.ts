import { json, requireUser } from "@/lib/api";
import { store } from "@/lib/data-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return json({ ok: false, message: "Sign in required." }, 401);
  const body = await request.json();
  return json(await store.applyBilling(user.id, body.event, body.plan));
}
