import { ConsiderationReference } from "@/components/consideration-reference";
import { ForceMajeureReference } from "@/components/force-majeure-reference";

export default async function TermDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "force-majeure") {
    return <ForceMajeureReference />;
  }
  return <ConsiderationReference />;
}
