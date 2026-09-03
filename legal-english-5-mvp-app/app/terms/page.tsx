"use client";

import Link from "next/link";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useApp } from "@/components/app-provider";
import { Icon, IconName } from "@/components/ui-icons";
import { useLocale } from "@/components/locale-provider";
import { categoryLabel, stateLabel } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/types";
import { cardImage } from "@/lib/media";

export default function TermsPage() {
  const { publishedTerms, progress, toggleFavourite, session } = useApp();
  const { locale, t } = useLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const firstName = session?.user.name.split(" ")[0] || t("learner");
  const learned = publishedTerms.filter((term) => progress[term.id]?.state === "mastered").length;
  const learning = publishedTerms.filter((term) => progress[term.id]?.state === "learning").length;
  const unread = publishedTerms.filter((term) => (progress[term.id]?.state || "new") === "new").length;
  const attempts = publishedTerms.reduce((sum, term) => sum + (progress[term.id]?.attempts || 0), 0);
  const averageScore = attempts ? Math.round((learned / Math.max(attempts, learned)) * 100) : 0;
  const currentTerm = publishedTerms.find((term) => progress[term.id]?.state === "learning") || publishedTerms[0];
  const categoryIcons: Record<string, IconName> = {
    "Corporate Law": "home",
    Contracts: "clipboard",
    "Employment Law": "user",
  };
  const recommended = publishedTerms
    .filter((term) => term.id !== currentTerm?.id)
    .slice(0, 3);
  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get("search") || "");
  }, []);
  const filtered = useMemo(
    () =>
      publishedTerms.filter((term) => {
        const haystack = `${term.term} ${term.spanishEquivalent} ${term.civilLawEquivalent} ${term.definition}`.toLowerCase();
        const matchesQuery = haystack.includes(query.toLowerCase());
        const matchesCategory = category === "All" || term.category === category;
        return matchesQuery && matchesCategory;
      }),
    [publishedTerms, query, category]
  );
  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <span className="eyebrow">LEGAL ENGLISH 5 · {session?.user.role === "admin" ? t("ownerView") : t("learnerView")}</span>
          <h1>{t("hello", { name: firstName })}</h1>
          <p>{t("keepLearning", { count: publishedTerms.length })}</p>
        </div>
      </div>
      <div className="stat-grid four">
        {[
          ["clipboard", learned, t("termsLearned")],
          ["target", attempts, t("quizzesCompleted")],
          ["bell", learning || 1, t("currentStreak")],
          ["trend", `${averageScore}%`, t("averageScore")],
        ].map(([icon, value, label]) => (
          <div className="stat" key={label}>
            <span className="stat-icon">
              <Icon name={icon as IconName} />
            </span>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="dashboard-board">
        <div className="dashboard-main">
          {currentTerm && (
            <section className="continue-card">
              <div>
                <span className="eyebrow">{currentTerm.category}</span>
                <h2>{currentTerm.term}</h2>
                <p>{currentTerm.definition}</p>
              </div>
              <div className="continue-action">
                <span>{Math.max(learned, 1)}/{Math.max(publishedTerms.length, 1)}</span>
                <Link className="primary" href={`/terms/${currentTerm.id}`}>
                  {t("continueLearning")}
                </Link>
              </div>
            </section>
          )}
          <section className="category-grid" aria-label={t("browseCategory")}>
            {CATEGORIES.map((item) => {
              const count = publishedTerms.filter((term) => term.category === item).length;
              return (
                <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>
                  <span className="category-icon">
                    <Icon name={categoryIcons[item] || "book"} />
                  </span>
                  <strong>{categoryLabel(locale, item)}</strong>
                  <span>{t("termsCount", { count })}</span>
                  <Icon name="chevron" className="category-arrow" />
                </button>
              );
            })}
          </section>
        </div>
        <aside className="dashboard-aside">
          <section className="panel-card">
            <h2>{t("learningPath")}</h2>
            {[
              [t("stateNew"), unread, "book"],
              [t("stateLearning"), learning, "clipboard"],
              [t("stateMastered"), learned, "shield"],
            ].map(([label, value, icon]) => (
              <div className="path-row" key={label}>
                <span>
                  <Icon name={icon as IconName} />
                </span>
                <div>
                  <strong>{label}</strong>
                  <small>{t("termsCount", { count: value })}</small>
                </div>
                <Icon name="chevron" />
              </div>
            ))}
          </section>
          <section className="panel-card score-card">
            <h2>{t("recentQuiz")}</h2>
            <div className="score-ring" style={{ "--score": `${averageScore || 85}%` } as CSSProperties}>
              <strong>{averageScore || 85}%</strong>
              <span>{t("goodJob")}</span>
            </div>
            <Link href="/progress">{t("viewProgress")}</Link>
          </section>
          <section className="panel-card">
            <h2>{t("recommended")}</h2>
            {recommended.map((term) => (
              <Link href={`/terms/${term.id}`} className="mini-term" key={term.id}>
                <span>
                  <Icon name="bookmark" />
                </span>
                <div>
                  <strong>{term.term}</strong>
                  <small>{categoryLabel(locale, term.category)}</small>
                </div>
              </Link>
            ))}
          </section>
        </aside>
      </div>
      <div className="filters">
        {["All", ...CATEGORIES].map((item) => (
          <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>
            {categoryLabel(locale, item)}
          </button>
        ))}
      </div>
      <div className="search-wrap">
        <span>⌕</span>
        <input aria-label={t("searchGlossary")} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("searchGlossary")} />
        <kbd>{filtered.length}</kbd>
      </div>
      {filtered.length ? (
        <div className="term-grid">
          {filtered.map((term) => {
            const record = progress[term.id];
            return (
              <article className="term-card" key={term.id}>
                <button className={`star ${record?.favourite ? "active" : ""}`} aria-label={t("favourite")} onClick={() => void toggleFavourite(term.id)}>
                  ★
                </button>
                <Link href={`/terms/${term.id}`}>
                  <div className="card-media">
                    <img src={cardImage(term.id)} alt="" />
                  </div>
                  <div className="term-body">
                    <div className="term-meta">
                      <span>{categoryLabel(locale, term.category)}</span>
                      <span>{term.jurisdiction}</span>
                      <span className={`state ${record?.state || "new"}`}>{stateLabel(locale, record?.state || "new")}</span>
                    </div>
                    <h2>{term.term}</h2>
                    <p className="translation">{term.spanishEquivalent}</p>
                    <p className="term-excerpt">{term.definition}</p>
                    <span className="open-link">{t("openEntry")}</span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <h2>{t("noTerms")}</h2>
          <p>{t("noTermsBody")}</p>
        </div>
      )}
    </AppShell>
  );
}
