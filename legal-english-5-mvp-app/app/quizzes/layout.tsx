import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Quizzes",
  description: "Practise legal English terms with short quizzes and track your mastery.",
  path: "/quizzes",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
