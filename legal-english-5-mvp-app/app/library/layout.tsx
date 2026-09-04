import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Library",
  description: "Terms you have saved for review.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
