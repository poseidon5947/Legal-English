import { JsonLd } from "@/components/json-ld";
import { PLAN_PRICES } from "@/lib/landing-copy";
import { courseJsonLd } from "@/lib/site";

// Route group so the home page gets its own server layout: the Course JSON-LD
// must be rendered on the server only (siteUrl() differs in the browser, which
// would otherwise cause a hydration mismatch in the client page component).
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={courseJsonLd({ monthly: PLAN_PRICES[1], annual: PLAN_PRICES[2], termCount: 30 })} />
      {children}
    </>
  );
}
