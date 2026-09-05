import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Create account",
  description: "Create your Legal English 5 account and start a seven-day free trial.",
  path: "/signup",
  index: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
