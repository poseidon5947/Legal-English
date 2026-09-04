import { ContractsQuizReference } from "@/components/contracts-quiz-reference";
import { ForceQuizReference } from "@/components/force-quiz-reference";

export default async function TermQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== "force-majeure") {
    return <ContractsQuizReference />;
  }
  return <ForceQuizReference />;
}
