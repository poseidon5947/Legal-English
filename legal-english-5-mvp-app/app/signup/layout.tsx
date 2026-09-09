import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Create account",
  description: "Create your Legal English 5 account. A valid credit card is required when you activate the 7-day free trial. Unless you cancel before it ends, the subscription continues on the COP $90,000 monthly plan.",
  path: "/signup",
  index: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
