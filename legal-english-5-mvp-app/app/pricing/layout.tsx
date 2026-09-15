import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { landingCopy } from "@/lib/landing-copy";
import { serverLocale } from "@/lib/locale-server";
import { faqJsonLd, seoMetadata } from "@/lib/site";

// Title and description from the approved SEO table (Textos Web, IMP-19), in the visitor's language.
export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata("/pricing", await serverLocale());
}

// JSON-LD is rendered here (server) rather than in the client page: siteUrl()
// differs between server and browser, which would trip a hydration warning.
export default async function Layout({ children }: { children: React.ReactNode }) {
  const locale = await serverLocale();
  const faqs = landingCopy[locale].faq.items.map(([q, a]) => ({ q, a }));
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      {children}
    </>
  );
}
