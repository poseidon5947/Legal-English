import type { Metadata } from "next";
import { TermDetail } from "@/components/term-detail";
import { pageMetadata } from "@/lib/site";
import { findTermSummary } from "@/lib/store";

type Params = { params: Promise<{ id: string }> };

/* Per-term title/description so the browser tab, history and any shared link
   read "agreement · Contracts" instead of the generic library title. Pages stay
   noindex: the library is behind sign-in. */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const termId = decodeURIComponent(id);
  const summary = await findTermSummary(termId).catch(() => null);
  if (!summary) {
    return pageMetadata({ title: "Term", description: "Legal English 5 term detail.", path: `/terms/${encodeURIComponent(termId)}` });
  }
  const description = summary.definition.length > 155 ? `${summary.definition.slice(0, 152).trimEnd()}…` : summary.definition;
  return pageMetadata({ title: `${summary.term} · ${summary.category}`, description, path: `/terms/${encodeURIComponent(termId)}` });
}

export default async function TermDetailPage({ params }: Params) {
  const { id } = await params;
  return <TermDetail id={decodeURIComponent(id)} />;
}
