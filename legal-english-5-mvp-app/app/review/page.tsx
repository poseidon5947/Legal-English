import { redirect } from "next/navigation";
import { ReviewGuide } from "@/components/review-guide";
import { store } from "@/lib/data-store";

// Internal reviewer walkthrough (Owner only). Anonymous visitors go to sign-in;
// learners go to their Home — the guide names demo accounts and Admin flows
// that are not learner-facing.
export default async function ReviewPage() {
  const userId = await store.currentUserId();
  if (!userId) redirect("/login?next=/review");
  const user = await store.getUser(userId);
  if (!user || user.role !== "admin") redirect("/dashboard");
  return <ReviewGuide />;
}
