import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Your daily five-minute Legal English session, streak and progress at a glance.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
