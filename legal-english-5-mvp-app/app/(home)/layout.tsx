import { JsonLd } from "@/components/json-ld";
import { landingCopy, LAUNCH_TERMS, PLAN_PRICES } from "@/lib/landing-copy";
import { serverLocale } from "@/lib/locale-server";
import { courseJsonLd, faqJsonLd } from "@/lib/site";

// Route group so the home page gets its own server layout: the Course and FAQ
// JSON-LD must be rendered on the server only (siteUrl() differs in the
// browser, which would otherwise cause a hydration mismatch in the client page).
export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const locale = await serverLocale();
  const faqs = landingCopy[locale].faq.items.map(([q, a]) => ({ q, a }));
  return (
    <>
      <JsonLd data={courseJsonLd({ monthly: PLAN_PRICES.monthly, annual: PLAN_PRICES.annual, currency: PLAN_PRICES.currency, termCount: LAUNCH_TERMS.total, trialDays: PLAN_PRICES.trialDays })} />
      <JsonLd data={faqJsonLd(faqs)} />
      {children}
    </>
  );
}
