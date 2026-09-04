import { ConsiderationReference } from "@/components/consideration-reference";
import { ForceMajeureReference } from "@/components/force-majeure-reference";
import { IndemnityReference } from "@/components/indemnity-reference";

export default async function TermDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "force-majeure") {
    return <ForceMajeureReference />;
  }
  if (id === "indemnity") {
    return <IndemnityReference />;
  }
  return <ConsiderationReference />;
}
