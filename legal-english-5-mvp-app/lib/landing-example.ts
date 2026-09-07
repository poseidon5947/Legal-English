/**
 * The one product example shown on the landing page (brief §3.5, "MCD content
 * gate — do not invent content"). Every string here is copied verbatim from the
 * approved Master Content Database entry for CON-005 (data/mcd-seed.json);
 * tests/landing-example.test.mjs fails if this file drifts from the seed.
 *
 * Marketing may swap the TermID for presentation; the content must always be
 * taken from the current MCD, never edited here.
 */
export const LANDING_EXAMPLE = {
  id: "CON-005",
  term: "consideration",
  partOfSpeech: "noun",
  category: "Contracts",
  topic: "Contract Fundamentals",
  jurisdiction: "US",
  definition: "Something that a party gives or promises in exchange for something from the other party.",
  spanishEquivalent: "contraprestación",
  civilLawEquivalent:
    "No existe un equivalente funcional exacto en el derecho civil colombiano. Consideration es un requisito característico de los contratos bajo el common law.",
  spanishSpeakerAlert: "In contract law, “consideration” does not mean “consideración.” It generally means “contraprestación.”",
  useItWith: ["in consideration of", "sufficient consideration", "lack of consideration", "consideration for the agreement"],
  inContext: "One company paid $1,000 in consideration for the services provided by the other company.",
  quiz: {
    question: "Company A paid $1,000, and Company B provided services in return. What is the “consideration”?",
    options: ["Only the written contract", "The $1,000 and the services exchanged", "The names of the two companies", "The date of the agreement"],
    /** Zero-based index of the correct option (MCD correctOption "B"). */
    correctIndex: 1,
    explanation: "“Consideration” is what the parties give or promise in exchange for what they receive.",
  },
  source: { workbook: "v1.3.81", editorialVersion: "1.3.44", reviewedAt: "2026-08-26" },
} as const;
