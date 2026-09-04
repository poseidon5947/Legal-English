import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progress",
  description: "Your learning activity, streaks and mastery by category.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
