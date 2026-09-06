import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { translate } from "@/lib/i18n";
import { serverLocale } from "@/lib/locale-server";
import { faqJsonLd, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description: "Seven days free, then a monthly or annual plan through Mercado Pago. Cancel anytime.",
  path: "/pricing",
  index: true,
});

// JSON-LD is rendered here (server) rather than in the client page: siteUrl()
// differs between server and browser, which would trip a hydration warning.
export default async function Layout({ children }: { children: React.ReactNode }) {
  const locale = await serverLocale();
  const faqs = ([1, 2, 3, 4] as const).map((n) => ({ q: translate(locale, `faqQ${n}`), a: translate(locale, `faqA${n}`) }));
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      {children}
    </>
  );
}
