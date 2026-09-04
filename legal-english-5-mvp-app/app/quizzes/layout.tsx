import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quizzes",
  description: "Practise legal English terms with short quizzes and track your mastery.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
