"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { categoryLabel } from "@/lib/i18n";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";
import type { AreaRoute } from "@/lib/learner-stats";

/**
 * Start Learning / Continue Learning for one area (Hito B clarification §2–3).
 * Shown on the area page (library filtered by category) and, in compact form,
 * on the Categories page and the learner Home. The target is the first
 * Published Term of the area not yet Mastered, in the approved DisplayOrder;
 * when every Term is Mastered the area shows completion instead of a link.
 */
export function routeLabel(locale: Locale, route: AreaRoute): string {
  const L = (key: LearnerKey) => learnerText(locale, key);
  if (route.status === "complete") return L("routeComplete");
  if (route.status === "continue") return L("routeContinue");
  return L("routeStart");
}

export function AreaRouteCard({ route, locale }: { route: AreaRoute; locale: Locale }) {
  const L = (key: LearnerKey, vars?: Record<string, string | number>) => learnerText(locale, key, vars);
  if (route.status === "empty") return null;
  const category = categoryLabel(locale, route.category);
  return (
    <section className="area-route" aria-labelledby={`area-route-${route.category.replace(/\W/g, "")}`}>
      <div className="area-route-copy">
        <small>{category} · {L("routeProgress", { mastered: route.mastered, total: route.total })}</small>
        <h2 id={`area-route-${route.category.replace(/\W/g, "")}`}>{routeLabel(locale, route)}</h2>
        <p>
          {route.status === "complete"
            ? L("routeCompleteBody")
            : route.status === "continue"
              ? L("routeNext", { term: route.term!.term, i: route.position, n: route.total })
              : L("routeFirst", { term: route.term!.term })}
        </p>
        <div className="terms-progress-track" aria-hidden="true">
          <i style={{ width: `${route.total ? Math.round((route.mastered / route.total) * 100) : 0}%` }} />
        </div>
      </div>
      <div className="area-route-actions">
        {route.term ? (
          <Link className="primary" href={`/terms/${route.term.id}`}>
            {routeLabel(locale, route)} <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <Link className="ghost" href="/categories">
            {L("areaEndChoose")} <span aria-hidden="true">→</span>
          </Link>
        )}
        <p className="area-route-hint">{L("routeHint")}</p>
      </div>
    </section>
  );
}
