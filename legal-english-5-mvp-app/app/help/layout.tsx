import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Help & Support",
  description: "Sign-in help, password recovery, billing questions and how to reach the Legal English 5 team — no account needed.",
  path: "/help",
  index: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
