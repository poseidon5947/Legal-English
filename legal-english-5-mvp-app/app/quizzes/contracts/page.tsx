import { redirect } from "next/navigation";

// Legacy mock route: the real quiz runner takes the category as a query.
export default function ContractsQuizPage() {
  redirect("/quizzes?category=Contracts");
}
