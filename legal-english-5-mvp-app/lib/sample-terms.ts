import seed from "@/data/mcd-seed.json";

// Real MCD v1.3.81 / LC-001 content — not marketing copy. One term per
// canonical category, picked for a populated Spanish-Speaker Alert (the
// clearest differentiator vs. a plain bilingual glossary).
const FEATURED_IDS = ["CORP-005", "CON-003", "EMP-002"];

export type SampleTerm = {
  id: string;
  term: string;
  category: string;
  definition: string;
  spanishEquivalent: string;
  civilLawEquivalent: string;
  spanishSpeakerAlert: string;
  useItWith: { id: string; expression: string; displayOrder: number }[];
  inContext: { exampleText: string } | null;
};

type SeedTerm = {
  id: string;
  term: string;
  category: string;
  definition: string;
  spanishEquivalent: string;
  civilLawEquivalent?: string;
  spanishSpeakerAlert?: string;
  useItWith?: { id: string; expression: string; displayOrder: number }[];
  inContext?: { exampleText: string } | null;
};

const seedTerms = (seed as { terms: SeedTerm[] }).terms;

export const sampleTerms: SampleTerm[] = FEATURED_IDS.map((id) => {
  const found = seedTerms.find((term) => term.id === id);
  if (!found) throw new Error(`Sample term ${id} is missing from data/mcd-seed.json`);
  return {
    id: found.id,
    term: found.term,
    category: found.category,
    definition: found.definition,
    spanishEquivalent: found.spanishEquivalent,
    civilLawEquivalent: found.civilLawEquivalent || "",
    spanishSpeakerAlert: found.spanishSpeakerAlert || "",
    useItWith: found.useItWith || [],
    inContext: found.inContext || null,
  };
});
