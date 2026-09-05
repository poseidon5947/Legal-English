import { Suspense } from "react";
import { AccountWorkspace } from "@/components/account-workspace";

// Settings shares the Account workspace: the four tabs (Profile,
// Preferences, Security, Notifications) switch in place, and ?tab= picks
// which one opens. /account/settings alone lands on Preferences.
export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <AccountWorkspace tab="preferences" />
    </Suspense>
  );
}
