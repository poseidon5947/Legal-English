import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Categories",
  description: "Contracts, Corporate Law and Employment Law — the launch categories of Legal English 5.",
  path: "/categories",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
