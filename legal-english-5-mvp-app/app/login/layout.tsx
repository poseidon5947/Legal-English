import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to Legal English 5 or start your seven-day free trial.",
  path: "/login",
  index: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
