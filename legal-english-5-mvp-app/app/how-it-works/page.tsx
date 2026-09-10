import { HowItWorksWorkspace } from "@/components/how-it-works-workspace";
import { redirect } from "next/navigation";
import { store } from "@/lib/data-store";

export default async function HowItWorksPage() {
  if (!(await store.currentUserId())) redirect("/#how-it-works");
  return <HowItWorksWorkspace />;
}
