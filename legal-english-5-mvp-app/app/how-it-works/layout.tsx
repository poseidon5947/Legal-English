import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works",
  description: "The five-step Legal English 5 learning loop, with your own progress against each step.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
