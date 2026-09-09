"use client";

import { categoryPhotoAlt, termPhoto } from "@/lib/category-photos";
import { Photo } from "@/components/photo";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { LearnerShell } from "@/components/learner-shell";
import { useLocale } from "@/components/locale-provider";
import { categoryLabel } from "@/lib/i18n";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";
import { areaRoute, categoryStats, stateOf, studyTerms } from "@/lib/learner-stats";
import { AreaRouteCard } from "@/components/area-route";
import { CATEGORIES } from "@/lib/types";
import type { ProgressState, Term } from "@/lib/types";

type LibIcon =
  | "view-grid"
  | "view-list"
  | "chevron-down"
  | "category-contract"
  | "category-corporate"
  | "category-employment"
  | "bookmark-outline"
  | "status-check"
  | "status-learning"
  | "pagination-left"
  | "pagination-right";

function LibraryIcon({ name, className = "" }: { name: LibIcon; className?: string }) {
  return <img className={`terms-library-icon ${className}`.trim()} src={`/terms-library-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

export const CATEGORY_THEME: Record<string, "contracts" | "corporate" | "employment"> = {
  Contracts: "contracts",
  "Corporate Law": "corporate",
  "Employment Law": "employment",
};
const CATEGORY_ICON: Record<string, LibIcon> = {
  Contracts: "category-contract",
  "Corporate Law": "category-corporate",
  "Employment Law": "category-employment",
};

const STATE_KEY: Record<ProgressState, LearnerKey> = { new: "stateNew", learning: "stateLearning", mastered: "stateMastered" };

export function StatusBadge({ state, locale }: { state: ProgressState; locale: "en" | "es" }) {
  return (
    <span className={`terms-status ${state}`}>
      {state === "mastered" && <LibraryIcon name="status-check" />}
      {state === "learning" && <LibraryIcon name="status-learning" />}
      {learnerText(locale, STATE_KEY[state])}
    </span>
  );
}

export function TermCard({
  term,
  state,
  favourite,
  onFavourite,
  locale,
  draft,
}: {
  term: Term;
  state: ProgressState;
  favourite: boolean;
  onFavourite: () => void;
  locale: "en" | "es";
  draft: boolean;
}) {
  const { terms } = useApp();
  return (
    <article className={`terms-card ${CATEGORY_THEME[term.category] || "contracts"}`}>
      <Photo className="terms-card-thumb" src={termPhoto(term, terms)} size="thumb" />
      <div className="terms-card-topline">
        <span>{categoryLabel(locale, term.category)}</span>
        <button
          type="button"
          className={favourite ? "active" : ""}
          aria-pressed={favourite}
          aria-label={`${favourite ? learnerText(locale, "saved") : learnerText(locale, "save")} ${term.term}`}
          title={favourite ? learnerText(locale, "inMyLibrary") : learnerText(locale, "addToLibrary")}
          onClick={(event) => {
            event.preventDefault();
            onFavourite();
          }}
        >
          <LibraryIcon name="bookmark-outline" />
        </button>
      </div>
      <h2>
        <Link href={`/terms/${term.id}`}>{term.term}</Link>
      </h2>
      {term.definition ? (
        <p>{term.definition}</p>
      ) : (
        // Locked payload (trial ended): the server sends titles only.
        <p className="muted">
          <Link href="/billing">{learnerText(locale, "lockedCard")}</Link>
        </p>
      )}
      <div className="terms-card-foot">
        <StatusBadge state={state} locale={locale} />
        {draft && <span className="terms-status draft">{learnerText(locale, "draft")}</span>}
      </div>
    </article>
  );
}

const PAGE_SIZES = [10, 20, 30];
const VIEW_KEY = "le5.library.view";
const SORT_KEY = "le5.library.sort";
type Tab = "all" | ProgressState;
type Sort = "curriculum" | "az" | "za" | "recent" | "attempts";
const SORTS: ReadonlyArray<readonly [Sort, LearnerKey]> = [
  ["curriculum", "sortCurriculum"],
  ["az", "sortAz"],
  ["za", "sortZa"],
  ["recent", "sortRecent"],
  ["attempts", "sortAttempts"],
];
function readSort(value: string | null): Sort {
  return value === "az" || value === "za" || value === "recent" || value === "attempts" ? value : "curriculum";
}
function readTab(value: string | null): Tab {
  return value === "new" || value === "learning" || value === "mastered" ? value : "all";
}

export function TermsLibrary() {
  const { terms, progress, toggleFavourite, session } = useApp();
  const { locale } = useLocale();
  const params = useSearchParams();
  const router = useRouter();
  const L = (key: LearnerKey, vars?: Record<string, string | number>) => learnerText(locale, key, vars);
  const [query, setQuery] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [tab, setTab] = useState<Tab>(readTab(params.get("state")));
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<Sort>("curriculum");
  const [sortOpen, setSortOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  useEffect(() => {
    setQuery(params.get("search") || "");
    setCategory(params.get("category") || "All");
    setTab(readTab(params.get("state")));
  }, [params]);
  useEffect(() => {
    const stored = window.localStorage.getItem(VIEW_KEY);
    if (stored === "list" || stored === "grid") setView(stored);
    setSort(readSort(window.localStorage.getItem(SORT_KEY)));
  }, []);
  useEffect(() => setPage(1), [query, category, tab, pageSize]);

  // Tab, category and search all live in the URL so a filtered library is
  // linkable from Progress/Categories and survives a refresh.
  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(Array.from(params.entries()));
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`/terms${next.toString() ? `?${next}` : ""}`, { scroll: false });
  };
  const chooseTab = (next: Tab) => {
    setTab(next);
    setParam("state", next === "all" ? null : next);
  };
  const chooseCategory = (next: string) => {
    setCategory(next);
    setParam("category", next === "All" ? null : next);
  };
  const chooseView = (next: "grid" | "list") => {
    setView(next);
    window.localStorage.setItem(VIEW_KEY, next);
  };
  const chooseSort = (next: Sort) => {
    setSort(next);
    window.localStorage.setItem(SORT_KEY, next);
  };
  const clearFilters = () => {
    setQuery("");
    setCategory("All");
    setTab("all");
    router.replace("/terms", { scroll: false });
  };
  const activeFilters = (query.trim() ? 1 : 0) + (category !== "All" ? 1 : 0) + (tab !== "all" ? 1 : 0);

  const visible = useMemo(() => studyTerms(terms, session), [terms, session]);
  const isOwner = session?.user.role === "admin";
  const byCategory = useMemo(() => categoryStats(visible, progress), [visible, progress]);
  const tabCounts = {
    all: visible.length,
    new: visible.filter((term) => stateOf(progress, term.id) === "new").length,
    learning: visible.filter((term) => stateOf(progress, term.id) === "learning").length,
    mastered: visible.filter((term) => stateOf(progress, term.id) === "mastered").length,
  };
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return visible.filter((term) => {
      if (category !== "All" && term.category !== category) return false;
      if (tab !== "all" && stateOf(progress, term.id) !== tab) return false;
      if (!needle) return true;
      const haystack = [term.term, term.definition, term.spanishEquivalent, term.civilLawEquivalent, term.category, term.topic, term.id]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [visible, category, tab, query, progress]);
  const sorted = useMemo(() => {
    const rows = [...filtered];
    switch (sort) {
      case "az":
        return rows.sort((a, b) => a.term.localeCompare(b.term, locale));
      case "za":
        return rows.sort((a, b) => b.term.localeCompare(a.term, locale));
      case "recent":
        return rows.sort((a, b) => (progress[b.id]?.updatedAt || "").localeCompare(progress[a.id]?.updatedAt || "") || a.displayOrder - b.displayOrder);
      case "attempts":
        return rows.sort((a, b) => (progress[b.id]?.attempts || 0) - (progress[a.id]?.attempts || 0) || a.displayOrder - b.displayOrder);
      default:
        return rows;
    }
  }, [filtered, sort, progress, locale]);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pages);
  const slice = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <LearnerShell
      search={query}
      onSearch={(value) => {
        setQuery(value);
        setParam("search", value || null);
      }}
    >
      <div className="terms-reference-content">
        <div className="terms-reference-heading">
          <div>
            <h1>{L("libraryTitle")}</h1>
            <p>{isOwner ? L("libraryLeadOwner") : L("libraryLead")}</p>
          </div>
        </div>

        <div className="terms-library-controls">
          <div className="terms-tabs" role="tablist" aria-label="Term filters">
            {(
              [
                ["all", L("allTerms"), tabCounts.all],
                ["new", L("stateNew"), tabCounts.new],
                ["learning", L("stateLearning"), tabCounts.learning],
                ["mastered", L("stateMastered"), tabCounts.mastered],
              ] as const
            ).map(([key, label, count]) => (
              <button className={tab === key ? "active" : ""} key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => chooseTab(key)}>
                {label} ({count})
              </button>
            ))}
          </div>
          <div className="terms-view-controls" aria-label="View controls">
            <button className={view === "grid" ? "active" : ""} type="button" aria-label={L("viewGrid")} title={L("viewGrid")} aria-pressed={view === "grid"} onClick={() => chooseView("grid")}>
              <LibraryIcon name="view-grid" />
            </button>
            <button className={view === "list" ? "active" : ""} type="button" aria-label={L("viewList")} title={L("viewList")} aria-pressed={view === "list"} onClick={() => chooseView("list")}>
              <LibraryIcon name="view-list" />
            </button>
            <div className="terms-menu">
              <button className="terms-category-select" type="button" aria-expanded={categoryOpen} onClick={() => setCategoryOpen((open) => !open)}>
                {category === "All" ? L("allCategories") : categoryLabel(locale, category)}
                <LibraryIcon name="chevron-down" />
              </button>
              {categoryOpen && (
                <div className="terms-menu-list" role="menu">
                  {["All", ...CATEGORIES].map((item) => (
                    <button
                      key={item}
                      type="button"
                      role="menuitem"
                      className={category === item ? "active" : ""}
                      onClick={() => {
                        chooseCategory(item);
                        setCategoryOpen(false);
                      }}
                    >
                      {item === "All" ? L("allCategories") : categoryLabel(locale, item)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="terms-menu">
              <button className="terms-category-select terms-sort-select" type="button" aria-expanded={sortOpen} aria-label={L("sortBy")} onClick={() => setSortOpen((open) => !open)}>
                <LibraryIcon name="view-list" />
                {L(SORTS.find(([key]) => key === sort)![1])}
                <LibraryIcon name="chevron-down" />
              </button>
              {sortOpen && (
                <div className="terms-menu-list" role="menu">
                  {SORTS.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      role="menuitem"
                      className={sort === key ? "active" : ""}
                      onClick={() => {
                        chooseSort(key);
                        setSortOpen(false);
                      }}
                    >
                      {L(label)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {activeFilters > 0 && (
          <div className="terms-active-filters" aria-live="polite">
            <span>{L("filteredCount", { n: sorted.length })}</span>
            {query.trim() && (
              <button type="button" onClick={() => { setQuery(""); setParam("search", null); }}>
                “{query.trim()}” <i aria-hidden="true">×</i>
              </button>
            )}
            {category !== "All" && (
              <button type="button" onClick={() => chooseCategory("All")}>
                {categoryLabel(locale, category)} <i aria-hidden="true">×</i>
              </button>
            )}
            {tab !== "all" && (
              <button type="button" onClick={() => chooseTab("all")}>
                {L(STATE_KEY[tab])} <i aria-hidden="true">×</i>
              </button>
            )}
            {activeFilters > 1 && (
              <button type="button" className="clear" onClick={clearFilters}>
                {L("clearFilters")}
              </button>
            )}
          </div>
        )}

        <section className="terms-category-progress" aria-label="Category progress">
          {byCategory.map((item) => (
            <article
              className={`${CATEGORY_THEME[item.category]} with-photo${category === item.category ? " active" : ""}`}
              key={item.category}
              role="button"
              tabIndex={0}
              onClick={() => chooseCategory(category === item.category ? "All" : item.category)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") chooseCategory(category === item.category ? "All" : item.category);
              }}
            >
              <div className="terms-category-icon-shell with-photo">
                <Photo src={categoryPhotoAlt(item.category)} size="card" />
                <LibraryIcon name={CATEGORY_ICON[item.category]} />
              </div>
              <div>
                <strong>{categoryLabel(locale, item.category)}</strong>
                <span>{item.total === 1 ? L("termsCountOne") : L("termsCount", { n: item.total })}</span>
                <div className="terms-progress-track">
                  <i style={{ width: `${item.pct}%` }} />
                </div>
                <small>{item.pct}%</small>
              </div>
            </article>
          ))}
        </section>

        {category !== "All" && CATEGORIES.includes(category as (typeof CATEGORIES)[number]) && (
          <AreaRouteCard route={areaRoute(visible, progress, category)} locale={locale} />
        )}

        {visible.length === 0 ? (
          <div className="terms-empty">
            <strong>{L("emptyLibraryTitle")}</strong>
            <p>{L("emptyLibraryBody")}</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="terms-empty">
            <strong>{L("emptySearch")}</strong>
            <p>{L("emptySearchBody")}</p>
            <button type="button" className="primary inline" onClick={clearFilters}>
              {L("clearFilters")}
            </button>
          </div>
        ) : (
          <section className={`terms-card-grid${view === "list" ? " list" : ""}`} aria-label="Terms">
            {slice.map((term) => (
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
          </section>
        )}

        {sorted.length > 0 && (
          <div className="terms-pagination-row">
            <nav className="terms-pagination" aria-label="Pagination">
              <button className={safePage === 1 ? "disabled" : ""} type="button" aria-label={L("previous")} disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
                <LibraryIcon name="pagination-left" />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((item) => (
                <button className={item === safePage ? "active" : ""} key={item} type="button" onClick={() => setPage(item)}>
                  {item}
                </button>
              ))}
              <button className={safePage === pages ? "disabled" : ""} type="button" aria-label={L("next")} disabled={safePage === pages} onClick={() => setPage(safePage + 1)}>
                <LibraryIcon name="pagination-right" />
              </button>
            </nav>
            <span className="terms-showing">{L("showing", { from: (safePage - 1) * pageSize + 1, to: Math.min(safePage * pageSize, sorted.length), n: sorted.length })}</span>
            <div className="terms-menu">
              <button className="terms-per-page" type="button" aria-expanded={sizeOpen} onClick={() => setSizeOpen((open) => !open)}>
                <strong>{pageSize}</strong> {L("perPage")}
                <LibraryIcon name="chevron-down" />
              </button>
              {sizeOpen && (
                <div className="terms-menu-list up" role="menu">
                  {PAGE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      role="menuitem"
                      className={size === pageSize ? "active" : ""}
                      onClick={() => {
                        setPageSize(size);
                        setSizeOpen(false);
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
