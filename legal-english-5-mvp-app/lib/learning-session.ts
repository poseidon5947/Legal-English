/** A short session travels in the URL so its selection survives navigation and refresh. */
export function sessionIds(value: string | null): string[] {
  return [...new Set((value ?? "").split(",").map((id) => id.trim()).filter((id) => /^[A-Za-z0-9_-]{1,64}$/.test(id)))].slice(0, 5);
}

/** Resolve against accessible terms only, retaining the learner's selected order. */
export function sessionTerms<T extends { id: string }>(terms: readonly T[], value: string | null): T[] {
  const byId = new Map(terms.map((term) => [term.id, term]));
  return sessionIds(value).flatMap((id) => {
    const term = byId.get(id);
    return term ? [term] : [];
  });
}

export function sessionQuery(terms: readonly { id: string }[]): string {
  return new URLSearchParams({ session: terms.map((term) => term.id).join(",") }).toString();
}
