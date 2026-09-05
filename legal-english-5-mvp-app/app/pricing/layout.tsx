import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description: "Seven days free, then a monthly or annual plan through Mercado Pago. Cancel anytime.",
  path: "/pricing",
  index: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
