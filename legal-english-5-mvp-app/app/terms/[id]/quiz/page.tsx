import { redirect } from "next/navigation";

// The per-term quiz lives on the term page (Quick Quiz) and in the quiz runner.
export default async function TermQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/quizzes?term=${encodeURIComponent(id)}`);
}
