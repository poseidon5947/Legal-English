import { json, requireUser } from "@/lib/api";
import { store } from "@/lib/data-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return json({ ok: false, message: "Sign in required." }, 401);
  const body = await request.json();
  // `day` is the learner's local calendar day (bounded server-side) for streaks/activity.
  if (body.action === "open") return json(await store.openTerm(user.id, body.termId, body.day));
  if (body.action === "favourite") return json(await store.toggleFavourite(user.id, body.termId, body.day));
  if (body.action === "quiz") return json(await store.submitQuiz(user.id, body.termId, body.option, body.day));
  return json({ ok: false, message: "Unknown learn action." }, 400);
}
