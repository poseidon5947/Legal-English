import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Billing",
  description: "Your trial, subscription and payment history.",
  path: "/billing",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
