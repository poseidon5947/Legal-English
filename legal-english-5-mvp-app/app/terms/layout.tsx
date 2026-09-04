import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms Library",
  description: "Browse every published legal English term by category and learning state.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
