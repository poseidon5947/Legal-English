import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Cookie Policy",
  description: "Essential cookies Legal English 5 uses to keep you signed in and remember your language. No advertising trackers.",
  path: "/cookies",
  index: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
