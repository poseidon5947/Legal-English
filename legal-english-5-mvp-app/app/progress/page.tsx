"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useApp } from "@/components/app-provider";
import { useLocale } from "@/components/locale-provider";
import { stateLabel } from "@/lib/i18n";

const COLORS = { new: "#3b82f6", learning: "#7c3aed", mastered: "#32c998" };

function Donut({ mastered, learning, unread, total, label }: { mastered: number; learning: number; unread: number; total: number; label: string }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const parts = [
    { value: mastered, color: COLORS.mastered },
    { value: learning, color: COLORS.learning },
    { value: unread, color: COLORS.new },
  ];
  let offset = 0;
  const percent = total ? Math.round((mastered / total) * 100) : 0;
  return (
    <svg viewBox="0 0 160 160" className="chart-svg" aria-label="Mastery donut">
      <circle cx="80" cy="80" r={r} fill="none" stroke="#eef1f8" strokeWidth="16" />
      {parts.map((part) => {
        const len = total ? (part.value / total) * c : 0;
        const dash = `${len} ${c - len}`;
        const node = (
          <circle
            key={part.color}
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke={part.color}
            strokeWidth="16"
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
            transform="rotate(-90 80 80)"
          />
        );
        offset += len;
        return node;
      })}
      <text x="80" y="76" textAnchor="middle" className="chart-center">
        {percent}%
      </text>
      <text x="80" y="96" textAnchor="middle" className="chart-sub">
        {label}
      </text>
    </svg>
  );
}

function Bars({ unread, learning, mastered, total, labels = ["New", "Learning", "Mastered"] }: { unread: number; learning: number; mastered: number; total: number; labels?: [string, string, string] }) {
  const rows = [
    { label: labels[0], value: unread, color: COLORS.new },
    { label: labels[1], value: learning, color: COLORS.learning },
    { label: labels[2], value: mastered, color: COLORS.mastered },
  ];
  return (
    <div className="bar-chart" aria-label="Progress bars">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="bar-meta">
            <span>{row.label}</span>
            <b>
              {row.value}/{total}
            </b>
          </div>
          <div className="bar-track">
            <i style={{ width: `${total ? (row.value / total) * 100 : 0}%`, background: row.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Funnel({ unread, learning, mastered, labels = ["New", "Learning", "Mastered"] }: { unread: number; learning: number; mastered: number; labels?: [string, string, string] }) {
  const max = Math.max(unread, learning, mastered, 1);
  const widths = [unread, learning, mastered].map((value) => 40 + (value / max) * 60);
  return (
    <svg viewBox="0 0 260 180" className="chart-svg funnel" aria-label="Learning funnel">
      {[
        { y: 12, w: widths[0], label: labels[0], value: unread, color: COLORS.new },
        { y: 68, w: widths[1], label: labels[1], value: learning, color: COLORS.learning },
        { y: 124, w: widths[2], label: labels[2], value: mastered, color: COLORS.mastered },
      ].map((row) => {
        const x = (260 - row.w * 2.2) / 2;
        const width = row.w * 2.2;
        return (
          <g key={row.label}>
            <rect x={x} y={row.y} width={width} height="40" rx="6" fill={row.color} />
            <text x="130" y={row.y + 25} textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="500">
              {row.label} · {row.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ProgressPage() {
  const { publishedTerms, progress, session } = useApp();
  const { locale, t } = useLocale();
  const stageLabels: [string, string, string] = [t("stateNew"), t("stateLearning"), t("stateMastered")];
  const unread = publishedTerms.filter((term) => (progress[term.id]?.state || "new") === "new").length;
  const learning = publishedTerms.filter((term) => progress[term.id]?.state === "learning").length;
  const mastered = publishedTerms.filter((term) => progress[term.id]?.state === "mastered").length;
  const total = publishedTerms.length;
  const attempts = publishedTerms.reduce((sum, term) => sum + (progress[term.id]?.attempts || 0), 0);
  const percent = total ? Math.round((mastered / total) * 100) : 0;
  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("progressEyebrow")} · {session?.user.name}</span>
          <h1>{t("progressTitle")}</h1>
          <p>{t("progressLead")}</p>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat">
          <strong>{percent}%</strong>
          <span>{t("mastered")}</span>
        </div>
        <div className="stat">
          <strong>{learning}</strong>
          <span>{t("inProgress")}</span>
        </div>
        <div className="stat">
          <strong>{attempts}</strong>
          <span>{t("quizAttempts")}</span>
        </div>
      </div>
      <section className="insight-strip">
        <span className="eyebrow">{t("reading")}</span>
        <p>
          {unread
            ? t("insightNew", { count: unread, noun: unread === 1 ? t("termSingular") : t("termPlural"), pronoun: unread === 1 ? t("it") : t("them") })
            : learning
              ? t("insightLearning", { count: learning, noun: learning === 1 ? t("isSingular") : t("arePlural") })
              : total
                ? t("insightAll")
                : t("insightNone")}
        </p>
      </section>
      <div className="chart-grid">
        <section className="chart-card">
          <h2>{t("masteryMix")}</h2>
          <p>{t("masteryMixLead")}</p>
          <Donut mastered={mastered} learning={learning} unread={unread} total={total} label={t("mastered")} />
          <ul className="chart-legend">
            <li><i style={{ background: COLORS.mastered }} /> {t("stateMastered")} · {mastered}</li>
            <li><i style={{ background: COLORS.learning }} /> {t("stateLearning")} · {learning}</li>
            <li><i style={{ background: COLORS.new }} /> {t("stateNew")} · {unread}</li>
          </ul>
        </section>
        <section className="chart-card">
          <h2>{t("stageDist")}</h2>
          <p>{t("stageDistLead")}</p>
          <Bars unread={unread} learning={learning} mastered={mastered} total={total} labels={stageLabels} />
        </section>
        <section className="chart-card">
          <h2>{t("funnel")}</h2>
          <p>{t("funnelLead")}</p>
          <Funnel unread={unread} learning={learning} mastered={mastered} labels={stageLabels} />
        </section>
      </div>
      <section className="chart-card map-card">
        <h2>{t("catalogueMap")}</h2>
        <p>{t("catalogueMapLead")}</p>
        <div className="mastery-map" aria-label="Catalogue map">
          {publishedTerms.map((term) => {
            const state = progress[term.id]?.state || "new";
            return (
              <Link key={term.id} href={`/terms/${term.id}`} className={`map-cell ${state}`} title={`${term.term} · ${state}`}>
                <b>{term.term}</b>
                <small>{term.id}</small>
              </Link>
            );
          })}
        </div>
      </section>
      <div className="progress-list">
        {publishedTerms.map((term) => {
          const state = progress[term.id]?.state || "new";
          const tries = progress[term.id]?.attempts || 0;
          return (
            <div key={term.id}>
              <div>
                <Link href={`/terms/${term.id}`}>{term.term}</Link>
                <small>
                  {term.spanishEquivalent} · {tries} {tries === 1 ? t("attempt") : t("attempts")}
                </small>
              </div>
              <span className={`state ${state}`}>{stateLabel(locale, state)}</span>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
