import type { Metadata } from "next";
import { serverLocale } from "@/lib/locale-server";
import { seoMetadata } from "@/lib/site";

// Title and description from the approved SEO table (Textos Web, IMP-19), in the visitor's language.
export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata("/status", await serverLocale());
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
