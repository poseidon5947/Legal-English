import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Account",
  description: "Manage your profile, preferences and subscription.",
  path: "/account",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
