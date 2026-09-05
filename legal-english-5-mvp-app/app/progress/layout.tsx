import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Progress",
  description: "Your learning activity, streaks and mastery by category.",
  path: "/progress",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
