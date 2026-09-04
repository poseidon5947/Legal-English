import { Suspense } from "react";
import { QuizWorkspace } from "@/components/quiz-workspace";

export default function QuizzesPage() {
  return (
    <Suspense fallback={null}>
      <QuizWorkspace />
    </Suspense>
  );
}
