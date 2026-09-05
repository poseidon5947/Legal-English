"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApp } from "@/components/app-provider";
import { LearnerShell } from "@/components/learner-shell";
import { useLocale } from "@/components/locale-provider";
import { categoryLabel } from "@/lib/i18n";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";
import { categoryStats, stateOf, studyTerms } from "@/lib/learner-stats";
import { CATEGORY_THEME, TermCard } from "@/components/terms-library";
import { categoryPhoto, categoryPhotoAlt } from "@/lib/category-photos";
import { Photo } from "@/components/photo";

const ICON: Record<string, string> = { Contracts: "category-contract", "Corporate Law": "category-corporate", "Employment Law": "category-employment" };

/** The three canonical MCD categories with live counts and mastery, linking into the filtered library. */
export function CategoriesWorkspace() {
  const { terms, progress, session, toggleFavourite } = useApp();
  const { locale } = useLocale();
  const L = (key: LearnerKey, vars?: Record<string, string | number>) => learnerText(locale, key, vars);
  const visible = useMemo(() => studyTerms(terms, session), [terms, session]);
  const stats = categoryStats(visible, progress);
  const isOwner = session?.user.role === "admin";
  return (
    <LearnerShell>
      <div className="terms-reference-content">
        <div className="terms-reference-heading">
          <div>
            <h1>{L("categoriesTitle")}</h1>
            <p>{L("categoriesLead")}</p>
          </div>
        </div>
        <figure className="learner-photo-banner with-caption" aria-hidden="true">
          <Photo src="/home-assets/photos/categories-hero.jpg" size="wide" priority />
          <figcaption>
            <small>{L("categoriesHeroTag")}</small>
            <strong>{L("categoriesHeroTitle")}</strong>
          </figcaption>
        </figure>
        <section className="terms-category-progress large" aria-label={L("categoriesTitle")}>
          {stats.map((item) => (
            <Link className={`${CATEGORY_THEME[item.category]} terms-category-link with-photo`} href={`/terms?category=${encodeURIComponent(item.category)}`} key={item.category}>
              <Photo className="terms-category-photo" src={categoryPhoto(item.category)} size="card" />
              <div className="terms-category-icon-shell">
                <img className="terms-library-icon" src={`/terms-library-assets/icons/${ICON[item.category]}.png`} alt="" aria-hidden="true" />
              </div>
              <div>
                <strong>{categoryLabel(locale, item.category)}</strong>
                <span>{item.total === 1 ? L("termsCountOne") : L("termsCount", { n: item.total })}</span>
                <div className="terms-progress-track">
                  <i style={{ width: `${item.pct}%` }} />
                </div>
                <small>
                  {item.mastered} {L("stateMastered").toLowerCase()} · {item.learning} {L("stateLearning").toLowerCase()} · {item.pct}%
                </small>
                <em>{L("browse")} →</em>
              </div>
            </Link>
          ))}
        </section>

        {stats.map((item) => {
          const rows = visible.filter((term) => term.category === item.category);
          if (rows.length === 0) return null;
          return (
            <section className="terms-category-section" key={item.category} aria-label={categoryLabel(locale, item.category)}>
              <div className="terms-reference-heading compact with-thumb">
                <Photo className="terms-section-thumb" src={categoryPhotoAlt(item.category)} size="thumb" />
                <div>
                  <h2>{categoryLabel(locale, item.category)}</h2>
                  <p>{item.total === 1 ? L("termsCountOne") : L("termsCount", { n: item.total })}</p>
                </div>
                <Link className="terms-category-more" href={`/terms?category=${encodeURIComponent(item.category)}`}>
                  {L("browse")} →
                </Link>
              </div>
              <div className="terms-card-grid list">
                {rows.map((term) => (
                  <TermCard
                    key={term.id}
                    term={term}
                    state={stateOf(progress, term.id)}
                    favourite={Boolean(progress[term.id]?.favourite)}
                    onFavourite={() => void toggleFavourite(term.id)}
                    locale={locale}
                    draft={Boolean(isOwner) && !term.published}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </LearnerShell>
  );
}
