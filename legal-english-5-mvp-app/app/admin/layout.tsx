import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner console",
  description: "Operate the studio: terms, users, audio and Excel import.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
