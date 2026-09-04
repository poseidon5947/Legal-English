import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your profile, preferences and subscription.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
