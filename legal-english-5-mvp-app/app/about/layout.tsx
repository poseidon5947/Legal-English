import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Who builds Legal English 5 and how every term traces back to one Master Content Database.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
