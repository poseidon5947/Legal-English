import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Settings",
  description: "Language, notifications, password and account controls.",
  path: "/account/settings",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
