import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms Library",
  description: "Browse every published legal English term by category and learning state.",
  path: "/terms",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
