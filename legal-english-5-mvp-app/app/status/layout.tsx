import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System status",
  description: "Live status of the Legal English 5 application, database, sign-in, email and billing services.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
