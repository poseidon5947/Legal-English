"use client";

import { useMemo } from "react";
import { useApp } from "@/components/app-provider";
import { LearnerShell } from "@/components/learner-shell";
import { useLocale } from "@/components/locale-provider";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";
import { stateOf, studyTerms } from "@/lib/learner-stats";
import { TermCard } from "@/components/terms-library";
import { Photo } from "@/components/photo";

/** Terms the learner bookmarked (progress.favourite), stored server-side per user. */
export function MyLibrary() {
  const { terms, progress, session, toggleFavourite } = useApp();
  const { locale } = useLocale();
  const L = (key: LearnerKey, vars?: Record<string, string | number>) => learnerText(locale, key, vars);
  const visible = useMemo(() => studyTerms(terms, session), [terms, session]);
  const saved = visible.filter((term) => progress[term.id]?.favourite);
  const isOwner = session?.user.role === "admin";
  return (
    <LearnerShell>
      <div className="terms-reference-content">
        <div className="terms-reference-heading">
          <div>
            <h1>{L("myLibraryTitle")}</h1>
            <p>{L("myLibraryLead")}</p>
          </div>
        </div>
        <figure className="learner-photo-banner" aria-hidden="true">
          <Photo src="/home-assets/photos/about-desk.jpg" size="wide" priority />
        </figure>
        {saved.length === 0 ? (
          <div className="terms-empty">
            <strong>{L("emptyMyLibrary")}</strong>
          </div>
        ) : (
          <section className="terms-card-grid" aria-label={L("myLibraryTitle")}>
            {saved.map((term) => (
              <TermCard
                key={term.id}
                term={term}
                state={stateOf(progress, term.id)}
                favourite
                onFavourite={() => void toggleFavourite(term.id)}
                locale={locale}
                draft={Boolean(isOwner) && !term.published}
              />
            ))}
          </section>
        )}
      </div>
    </LearnerShell>
  );
}
