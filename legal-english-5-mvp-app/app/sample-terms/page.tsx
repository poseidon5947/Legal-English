import { redirect } from "next/navigation";

// A sample is public; the full, account-backed library stays at /terms.
export default function SampleTermsPage() {
  redirect("/#how-it-works");
}
