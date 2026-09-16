import type { Metadata } from "next";
import { serverLocale } from "@/lib/locale-server";
import { seoMetadata } from "@/lib/site";

// Approved legal package (IMP-17/18): title and description in the visitor's language.
export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata("/cookies", await serverLocale());
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
