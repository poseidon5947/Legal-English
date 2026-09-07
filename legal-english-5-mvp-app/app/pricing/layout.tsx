import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { landingCopy } from "@/lib/landing-copy";
import { serverLocale } from "@/lib/locale-server";
import { faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description: "Monthly plan COP $90,000/month with a 7-day free trial (credit card required), or COP $540,000/year — a 50% discount versus twelve monthly payments.",
  path: "/pricing",
  index: true,
});

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
