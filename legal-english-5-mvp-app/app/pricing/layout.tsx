import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Seven days free, then a monthly or annual plan through Mercado Pago. Cancel anytime.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
