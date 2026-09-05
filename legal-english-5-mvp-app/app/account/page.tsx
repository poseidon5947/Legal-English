import { Suspense } from "react";
import { AccountWorkspace } from "@/components/account-workspace";

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <AccountWorkspace />
    </Suspense>
  );
}
