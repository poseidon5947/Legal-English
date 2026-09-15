"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApp } from "@/components/app-provider";
import { LearnerShell } from "@/components/learner-shell";
import { useLocale } from "@/components/locale-provider";
import { categoryLabel } from "@/lib/i18n";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";
import { areaRoute, categoryStats, stateOf, studyTerms } from "@/lib/learner-stats";
import { routeLabel } from "@/components/area-route";
import { CATEGORY_THEME, TermCard } from "@/components/terms-library";
import { categoryPhoto, categoryPhotoAlt } from "@/lib/category-photos";
import { Photo } from "@/components/photo";
import { Le5Icon, type Le5IconName } from "@/components/le5-icon";

const AREA_ICON: Record<string, Le5IconName> = { Contracts: "areas/contracts", "Corporate Law": "areas/corporate-law", "Employment Law": "areas/employment-law" };

/** The three Areas with live counts and mastery, linking into the filtered library. */
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
        {/* Approved Areas heading (Textos Web IMP-10; comp D01.3): eyebrow, H1, intro, support line. Area cards carry the approved photos P02–P04. */}
        <div className="terms-reference-heading areas-heading">
          <div>
            <span className="eyebrow">{L("categoriesHeroTag")}</span>
            <h1>{L("categoriesTitle")}</h1>
            <p>{L("categoriesLead")}</p>
            <p className="areas-support">{L("categoriesHeroTitle")}</p>
          </div>
        </div>
        <section className="terms-category-progress large" aria-label={L("categoriesTitle")}>
          {stats.map((item) => (
            <Link className={`${CATEGORY_THEME[item.category]} terms-category-link with-photo`} href={`/terms?category=${encodeURIComponent(item.category)}`} key={item.category}>
              <Photo className="terms-category-photo" src={categoryPhoto(item.category)} size="card" />
              <div className="terms-category-icon-shell">
                <Le5Icon name={AREA_ICON[item.category]} size={28} className="terms-library-icon home-area-icon" />
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
                <em>{routeLabel(locale, areaRoute(visible, progress, item.category))} →</em>
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
                <div className="terms-category-actions">
                  {(() => {
                    const route = areaRoute(visible, progress, item.category);
                    return route.term ? (
                      <Link className="primary inline terms-category-route" href={`/terms/${route.term.id}`}>
                        {routeLabel(locale, route)} →
                      </Link>
                    ) : (
                      <span className="terms-category-route done">{routeLabel(locale, route)}</span>
                    );
                  })()}
                  <Link className="terms-category-more" href={`/terms?category=${encodeURIComponent(item.category)}`}>
                    {L("browse")} →
                  </Link>
                </div>
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
