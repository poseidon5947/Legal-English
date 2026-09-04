"use client";

import { AppShell } from "@/components/app-shell";
import { useApp } from "@/components/app-provider";
import { useLocale } from "@/components/locale-provider";
import { useMemo } from "react";
import { countsFor, studyTerms } from "@/lib/learner-stats";

export default function AchievementsPage() {
  const { terms, progress, session } = useApp();
  const { t } = useLocale();
  const visible = useMemo(() => studyTerms(terms, session), [terms, session]);
  const { mastered, learning, newCount: unread } = countsFor(visible, progress);
  const marks = [
    [t("markFirst"), mastered >= 1],
    [t("markFive"), mastered >= 5],
    [t("markTen"), mastered >= 10],
  ] as const;
  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("achievementsEyebrow")}</span>
          <h1>{t("achievementsTitle")}</h1>
          <p>{t("achievementsLead")}</p>
        </div>
      </div>
      <div className="stat-grid four">
        <div className="stat">
          <strong>{mastered}</strong>
          <span>{t("mastered")}</span>
        </div>
        <div className="stat">
          <strong>{learning}</strong>
          <span>{t("inProgress")}</span>
        </div>
        <div className="stat">
          <strong>{unread}</strong>
          <span>{t("stateNew")}</span>
        </div>
        <div className="stat">
          <strong>{visible.length}</strong>
          <span>{t("glossary")}</span>
        </div>
      </div>
      <div className="account-stack">
        <section className="account-card">
          {visible.length === 0 ? (
            <p>{t("achievementsEmpty")}</p>
          ) : (
            <div className="mark-list">
              {marks.map(([label, done]) => (
                <div className="mark-row" key={label}>
                  <strong>{label}</strong>
                  <small>{done ? t("markDone") : t("markOpen")}</small>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
