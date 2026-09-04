import { redirect } from "next/navigation";

// The static library mock-up used to live here. The real, data-driven library is /terms.
export default function SampleTermsPage() {
  redirect("/terms");
}
