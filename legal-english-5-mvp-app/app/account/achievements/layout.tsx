import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Achievements",
  description: "Streaks, mastery milestones and badges earned in Legal English 5.",
  path: "/account/achievements",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
