import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Help & Support",
  description: "Report a problem, read the FAQ and contact MPC Law Studio.",
  path: "/account/help",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
