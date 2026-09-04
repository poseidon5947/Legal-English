import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description: "Contracts, Corporate Law and Employment Law — the launch categories of Legal English 5.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
