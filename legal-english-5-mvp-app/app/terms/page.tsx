import { Suspense } from "react";
import { TermsLibrary } from "@/components/terms-library";

export default function TermsPage() {
  return (
    <Suspense fallback={null}>
      <TermsLibrary />
    </Suspense>
  );
}
