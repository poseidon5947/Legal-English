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
  if (body.action === "quiz") {
    // clientKey: one per Check Answer press, so a duplicated request is graded once.
    // source: which page the answer came from (kept in the quiz_attempts ledger).
    // session: the quiz session this answer belongs to (validated in the store; absent for a Term-page answer).
    const meta = { clientKey: typeof body.clientKey === "string" ? body.clientKey : undefined, source: body.source, session: body.session };
    return json(await store.submitQuiz(user.id, body.termId, body.option, body.day, meta));
  }
  // NEW-01: "Quizzes Completed" moves only here, and only if the ledger shows every question answered.
  if (body.action === "quizComplete") return json(await store.completeQuizSession(user.id, body.sessionKey));
  return json({ ok: false, message: "Unknown learn action." }, 400);
}
