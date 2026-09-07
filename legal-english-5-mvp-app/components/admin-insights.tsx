"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { adminText } from "@/lib/admin-copy";
import type { InsightSummary, VitalName } from "@/lib/insights";

/**
 * Owner console → Overview: real visitor numbers from our own beacon
 * (components/insight-beacon.tsx). Three cards: visits per day, Core Web
 * Vitals (p75, Google's thresholds) and the most viewed pages.
 */
export function AdminInsights() {
  const { locale } = useLocale();
  const a = (key: Parameters<typeof adminText>[1], vars?: Record<string, string | number>) => adminText(locale, key, vars);
  const [days, setDays] = useState<7 | 14 | 30>(14);
  const [summary, setSummary] = useState<InsightSummary | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetch(`/api/admin/insights?days=${days}`, { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        if (data.ok) {
          setSummary(data.summary);
          setState("ready");
        } else setState("error");
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [days]);

  const daily = summary?.daily ?? [];
  const peak = Math.max(1, ...daily.map((day) => day.views));
  const width = 260;
  const height = 120;
  const step = daily.length > 1 ? width / (daily.length - 1) : width;
  const points = daily.map((day, index) => [Math.round(index * step), Math.round(height - 8 - (day.views / peak) * (height - 24))] as const);
  const line = points.map(([x, y], index) => `${index ? "L" : "M"}${x} ${y}`).join(" ");
  const area = points.length ? `${line} L${points[points.length - 1][0]} ${height} L0 ${height} Z` : "";
  const formatDay = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString(locale === "es" ? "es-CO" : "en-GB", { day: "numeric", month: "short" });
  const formatVital = (name: VitalName, value: number | null) => {
    if (value === null) return "—";
    if (name === "CLS") return value.toFixed(2);
    return value >= 1000 ? `${(value / 1000).toFixed(2)} s` : `${Math.round(value)} ms`;
  };
  const ratingLabel = (rating: "good" | "needs-improvement" | "poor" | null) =>
    rating === "good" ? a("vitalGood") : rating === "needs-improvement" ? a("vitalNeedsWork") : rating === "poor" ? a("vitalPoor") : a("vitalNoData");

  return (
    <div className="chart-grid admin-insights" aria-busy={state === "loading"}>
      <section className="chart-card">
        <div className="admin-insights-head">
          <div>
            <h2>{a("insightsVisits")}</h2>
            <p>{a("insightsVisitsBody")}</p>
          </div>
          <div className="admin-insights-range" role="group" aria-label={a("insightsRange")}>
            {([7, 14, 30] as const).map((option) => (
              <button key={option} type="button" className={option === days ? "active" : ""} aria-pressed={option === days} onClick={() => setDays(option)}>
                {a("insightsDays", { n: option })}
              </button>
            ))}
          </div>
        </div>
        {state === "error" ? (
          <p className="admin-insights-empty">{a("insightsError")}</p>
        ) : summary && summary.views === 0 ? (
          <p className="admin-insights-empty">{a("insightsEmpty")}</p>
        ) : (
          <>
            <div className="admin-insights-kpis">
              <div>
                <strong>{summary?.visits ?? "—"}</strong>
                <span>{a("insightsVisitsLabel")}</span>
              </div>
              <div>
                <strong>{summary?.views ?? "—"}</strong>
                <span>{a("insightsViewsLabel")}</span>
              </div>
              <div>
                <strong>{summary ? `${Math.round((summary.devices.mobile / Math.max(1, summary.views)) * 100)}%` : "—"}</strong>
                <span>{a("insightsMobileLabel")}</span>
              </div>
              <div>
                <strong>{summary ? `${Math.round((summary.locales.es / Math.max(1, summary.views)) * 100)}%` : "—"}</strong>
                <span>{a("insightsSpanishLabel")}</span>
              </div>
            </div>
            <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg funnel" role="img" aria-label={a("insightsChartAlt", { n: summary?.views ?? 0, days })}>
              {area && <path d={area} fill="#e8f3e9" />}
              {line && <path d={line} fill="none" stroke="#2e7d32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
              {points.map(([x, y], index) => (
                <circle key={index} cx={x} cy={y} r="3" fill="#2e7d32">
                  <title>
                    {formatDay(daily[index].day)}: {daily[index].views} {a("insightsViewsLabel").toLowerCase()}
                  </title>
                </circle>
              ))}
            </svg>
            {daily.length > 1 && (
              <div className="admin-insights-axis" aria-hidden="true">
                <span>{formatDay(daily[0].day)}</span>
                <span>{formatDay(daily[daily.length - 1].day)}</span>
              </div>
            )}
          </>
        )}
      </section>

      <section className="chart-card">
        <h2>{a("insightsVitals")}</h2>
        <p>{a("insightsVitalsBody")}</p>
        <div className="admin-vitals">
          {(summary?.vitals ?? []).map((vital) => (
            <div key={vital.name} className={`admin-vital ${vital.rating ?? "none"}`}>
              <div>
                <strong>{vital.name}</strong>
                <small>{a(`vital${vital.name}` as Parameters<typeof adminText>[1])}</small>
              </div>
              <div>
                <b>{formatVital(vital.name, vital.p75)}</b>
                <span>{ratingLabel(vital.rating)}</span>
              </div>
            </div>
          ))}
          {!summary && state !== "error" && <p className="admin-insights-empty">{a("insightsLoading")}</p>}
        </div>
      </section>

      <section className="chart-card">
        <h2>{a("insightsTopPages")}</h2>
        <p>{a("insightsTopPagesBody")}</p>
        {summary && summary.topPages.length > 0 ? (
          <div className="bar-chart">
            {summary.topPages.slice(0, 6).map((page) => {
              const share = Math.round((page.views / Math.max(1, summary.views)) * 100);
              return (
                <div key={page.path}>
                  <div className="bar-meta">
                    <span>{page.path}</span>
                    <b>{page.views}</b>
                  </div>
                  <div className="bar-track">
                    <i style={{ width: `${Math.max(2, share)}%`, background: "#452b84" }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="admin-insights-empty">{state === "loading" ? a("insightsLoading") : a("insightsEmpty")}</p>
        )}
      </section>
    </div>
  );
}
