import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms that govern your use of Legal English 5.",
  path: "/terms-of-service",
  index: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
