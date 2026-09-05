import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: "Who builds Legal English 5 and how every term traces back to one Master Content Database.",
  path: "/about",
  index: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
