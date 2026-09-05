import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "My Library",
  description: "Terms you have saved for review.",
  path: "/library",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
