import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Owner console",
  description: "Operate the studio: terms, users, audio and Excel import.",
  path: "/admin",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
