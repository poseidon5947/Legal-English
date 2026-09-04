import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing",
  description: "Your trial, subscription and payment history.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
