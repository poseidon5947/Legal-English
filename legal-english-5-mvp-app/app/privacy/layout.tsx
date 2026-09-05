import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: "How Legal English 5 handles your personal data, in plain language.",
  path: "/privacy",
  index: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
