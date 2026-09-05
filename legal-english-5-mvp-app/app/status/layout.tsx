import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "System status",
  description: "Live status of the Legal English 5 application, database, sign-in, email and billing services.",
  path: "/status",
  index: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
