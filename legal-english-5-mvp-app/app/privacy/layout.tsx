import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Legal English 5 handles your personal data, in plain language.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
