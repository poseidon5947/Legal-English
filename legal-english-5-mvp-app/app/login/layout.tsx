import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Legal English 5 or start your seven-day free trial.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
