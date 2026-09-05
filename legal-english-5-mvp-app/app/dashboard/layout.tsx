import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Home",
  description: "Your daily five-minute Legal English session, streak and progress at a glance.",
  path: "/dashboard",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
