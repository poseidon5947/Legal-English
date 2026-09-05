import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Review guide",
  description: "Step-by-step acceptance walkthrough of the alpha for the MPC Law Studio review.",
  path: "/review",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
