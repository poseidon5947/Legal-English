"use client";

import Link from "next/link";
import { CSSProperties, useMemo } from "react";
import { useApp } from "./app-provider";
import { LearnerShell } from "@/components/learner-shell";
import { useLocale } from "@/components/locale-provider";
import { Icon, IconName } from "@/components/ui-icons";
import { categoryLabel, entitlementDetail, entitlementLabel } from "@/lib/i18n";
import { countsFor, failedTerms, studyTerms } from "@/lib/learner-stats";

function ProgressRail() {
  const { terms, progress, studyDays, session, entitlement } = useApp();
  const { locale, t } = useLocale();
  const visible = useMemo(() => studyTerms(terms, session), [terms, session]);
  const counts = countsFor(visible, progress, studyDays);
  // D06: only Terms failed in the last quiz and not yet corrected; hidden when none.
  const nextTerms = useMemo(() => failedTerms(visible, progress).slice(0, 6), [visible, progress]);
  return (
    <aside className="progress-rail" aria-label="Your progress">
      <section className="rail-card rail-score">
        <div className="rail-ring" style={{ "--score": `${counts.masteryPct}%` } as CSSProperties}>
          <strong>{counts.masteryPct}%</strong>
          <span>{t("mastered")}</span>
        </div>
        <div>
          <h2>{t("progressTitle")}</h2>
          <p>{session?.user.name}</p>
        </div>
      </section>
      <section className="rail-card">
        <h2>{t("masteryMix")}</h2>
        {[
          [t("stateMastered"), counts.mastered, "shield"],
          [t("stateLearning"), counts.learning, "flame"],
          [t("stateNew"), counts.newCount, "book"],
          [t("quizAttempts"), counts.attempts, "target"],
        ].map(([label, value, icon]) => (
          <div className="rail-metric" key={label}>
            <Icon name={icon as IconName} />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>
      {nextTerms.length > 0 && (
        <section className="rail-card">
          <h2>{t("recommended")}</h2>
          {nextTerms.map((term) => (
            <Link href={`/terms/${term.id}`} className="rail-term" key={term.id}>
              <span>{term.term}</span>
              <small>{categoryLabel(locale, term.category)}</small>
            </Link>
          ))}
          <Link href={`/quizzes?practice=${encodeURIComponent("All")}`} className="rail-practice-link">{t("recommendedRetry")} →</Link>
        </section>
      )}
      <section className="rail-card rail-upgrade">
        <Icon name={entitlement.allowed ? "scales" : "lock"} />
        <strong>{entitlementLabel(locale, entitlement.label)}</strong>
        <p>{entitlementDetail(locale, entitlement.detail)}</p>
        <Link href="/billing">{t("reviewAccess")}</Link>
      </section>
    </aside>
  );
}

/**
 * Shell for the billing, admin, settings, help and achievements pages. The
 * sidebar, topbar and access gates come from LearnerShell so navigation is the
 * same on every signed-in page; this only adds the progress rail.
 */
export function AppShell({ children, rail = true, pageClass = "" }: { children: React.ReactNode; rail?: boolean; pageClass?: string }) {
  return (
    <LearnerShell pageClass={`app-shell-page ${pageClass}`.trim()}>
      <div className="terms-reference-content">
        {rail ? (
          <div className="workspace-grid">
            <div className="workspace-main">{children}</div>
            <ProgressRail />
          </div>
        ) : (
          <div className="workspace-main wide">{children}</div>
        )}
      </div>
    </LearnerShell>
  );
}
