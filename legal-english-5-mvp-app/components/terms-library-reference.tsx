"use client";

import Link from "next/link";

type LibraryIconName =
  | "logo-shield"
  | "nav-home"
  | "nav-book"
  | "nav-categories"
  | "nav-progress"
  | "nav-quiz"
  | "nav-bookmark"
  | "nav-user"
  | "nav-billing-card"
  | "nav-help"
  | "nav-signout"
  | "search"
  | "bell"
  | "chevron-down"
  | "view-grid"
  | "view-list"
  | "crown"
  | "category-contract"
  | "category-corporate"
  | "category-employment"
  | "bookmark-outline"
  | "status-check"
  | "status-learning"
  | "pagination-left"
  | "pagination-right";

type TermStatus = "Mastered" | "Learning" | "New";

function LibraryIcon({ name, className = "" }: { name: LibraryIconName; className?: string }) {
  return <img className={`terms-library-icon ${className}`.trim()} src={`/terms-library-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

const navMain: ReadonlyArray<readonly [string, LibraryIconName, string, boolean]> = [
  ["Home", "nav-home", "/", false],
  ["Terms Library", "nav-book", "/terms", true],
  ["Categories", "nav-categories", "/categories", false],
  ["Progress", "nav-progress", "/progress", false],
  ["Quizzes", "nav-quiz", "/quizzes", false],
  ["My Library", "nav-bookmark", "/terms", false],
];

const navAccount: ReadonlyArray<readonly [string, LibraryIconName, string]> = [
  ["Account", "nav-user", "/account"],
  ["Billing", "nav-billing-card", "/billing"],
  ["Help & Support", "nav-help", "/account/help"],
];

const categories = [
  {
    name: "Contracts",
    icon: "category-contract" as const,
    count: "10 Terms",
    progress: 33,
    theme: "contracts",
  },
  {
    name: "Corporate Law",
    icon: "category-corporate" as const,
    count: "10 Terms",
    progress: 40,
    theme: "corporate",
  },
  {
    name: "Employment Law",
    icon: "category-employment" as const,
    count: "10 Terms",
    progress: 20,
    theme: "employment",
  },
] as const;

const terms: ReadonlyArray<{
  term: string;
  category: string;
  theme: "contracts" | "corporate" | "employment";
  definition: string;
  status: TermStatus;
}> = [
  {
    term: "Force Majeure",
    category: "Contracts",
    theme: "contracts",
    definition: "An unforeseeable event that prevents a party from fulfilling a contract.",
    status: "Mastered",
  },
  {
    term: "Indemnity",
    category: "Contracts",
    theme: "contracts",
    definition: "A clause that protects one party from loss or damage caused by another.",
    status: "Learning",
  },
  {
    term: "Liquidated Damages",
    category: "Contracts",
    theme: "contracts",
    definition: "A pre-agreed amount paid for breach of contract instead of actual damages.",
    status: "New",
  },
  {
    term: "Consideration",
    category: "Contracts",
    theme: "contracts",
    definition: "Something of value exchanged between parties to form a contract.",
    status: "Mastered",
  },
  {
    term: "Breach of Contract",
    category: "Contracts",
    theme: "contracts",
    definition: "Failure to fulfill a contractual obligation without legal justification.",
    status: "Learning",
  },
  {
    term: "Shareholder",
    category: "Corporate Law",
    theme: "corporate",
    definition: "A person or entity that owns shares in a corporation.",
    status: "Mastered",
  },
  {
    term: "Board of Directors",
    category: "Corporate Law",
    theme: "corporate",
    definition: "A group responsible for making key decisions and overseeing the company.",
    status: "Learning",
  },
  {
    term: "Merger",
    category: "Corporate Law",
    theme: "corporate",
    definition: "The combination of two companies into one legal entity.",
    status: "New",
  },
  {
    term: "At-Will Employment",
    category: "Employment Law",
    theme: "employment",
    definition: "Employment that can be terminated by either party at any time.",
    status: "Learning",
  },
  {
    term: "Non-Compete Clause",
    category: "Employment Law",
    theme: "employment",
    definition: "A restriction that prevents an employee from working for competitors.",
    status: "New",
  },
];

function StatusBadge({ status }: { status: TermStatus }) {
  return (
    <span className={`terms-status ${status.toLowerCase()}`}>
      {status === "Mastered" && <LibraryIcon name="status-check" />}
      {status === "Learning" && <LibraryIcon name="status-learning" />}
      {status}
    </span>
  );
}

export function TermsLibraryReference() {
  return (
    <main className="terms-reference-page">
      <aside className="terms-reference-sidebar">
        <div>
          <Link className="terms-reference-brand" href="/">
            <LibraryIcon name="logo-shield" />
            <span>
              <strong>LEGAL ENGLISH 5</strong>
              <small>MPC LAW STUDIO</small>
            </span>
          </Link>

          <nav className="terms-reference-nav" aria-label="Main navigation">
            {navMain.map(([label, icon, href, active]) => (
              <Link className={active ? "active" : ""} href={href} key={label}>
                <LibraryIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="terms-reference-sidebar-bottom">
          <nav className="terms-reference-nav account" aria-label="Account navigation">
            {navAccount.map(([label, icon, href]) => (
              <Link href={href} key={label}>
                <LibraryIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
            <button type="button">
              <LibraryIcon name="nav-signout" />
              <span>Sign Out</span>
            </button>
          </nav>

          <section className="terms-trial-card" aria-label="Trial status">
            <span>
              <LibraryIcon name="crown" />
            </span>
            <strong>7-Day Free Trial</strong>
            <p>You have 6 days left in your free trial.</p>
            <Link href="/billing">Upgrade Now</Link>
          </section>
        </div>
      </aside>

      <section className="terms-reference-workspace">
        <header className="terms-reference-topbar">
          <label className="terms-reference-search">
            <LibraryIcon name="search" />
            <input placeholder="Search terms, categories, or content..." aria-label="Search terms, categories, or content" />
          </label>
          <div className="terms-reference-user-tools">
            <button className="terms-notification" type="button" aria-label="Notifications">
              <LibraryIcon name="bell" />
              <span />
            </button>
            <Link className="terms-user-pill" href="/account">
              <img src="/terms-library-assets/people/alex-johnson.png" alt="" />
              <span>
                <strong>Alex Johnson</strong>
                <small>Learner</small>
              </span>
              <LibraryIcon name="chevron-down" />
            </Link>
          </div>
        </header>

        <div className="terms-reference-content">
          <div className="terms-reference-heading">
            <div>
              <h1>Terms Library</h1>
              <p>Explore and master essential legal terminology.</p>
            </div>
          </div>

          <div className="terms-library-controls">
            <div className="terms-tabs" role="tablist" aria-label="Term filters">
              {["All Terms (30)", "New (8)", "Learning (12)", "Mastered (10)"].map((tab, index) => (
                <button className={index === 0 ? "active" : ""} key={tab} type="button">
                  {tab}
                </button>
              ))}
            </div>
            <div className="terms-view-controls" aria-label="View controls">
              <button className="active" type="button" aria-label="Grid view">
                <LibraryIcon name="view-grid" />
              </button>
              <button type="button" aria-label="List view">
                <LibraryIcon name="view-list" />
              </button>
              <button className="terms-category-select" type="button">
                All Categories
                <LibraryIcon name="chevron-down" />
              </button>
            </div>
          </div>

          <section className="terms-category-progress" aria-label="Category progress">
            {categories.map((category) => (
              <article className={category.theme} key={category.name}>
                <div className="terms-category-icon-shell">
                  <LibraryIcon name={category.icon} />
                </div>
                <div>
                  <strong>{category.name}</strong>
                  <span>{category.count}</span>
                  <div className="terms-progress-track">
                    <i style={{ width: `${category.progress}%` }} />
                  </div>
                  <small>{category.progress}%</small>
                </div>
              </article>
            ))}
          </section>

          <section className="terms-card-grid" aria-label="Terms">
            {terms.map((item) => (
              <article className={`terms-card ${item.theme}`} key={item.term}>
                <div className="terms-card-topline">
                  <span>{item.category}</span>
                  <button type="button" aria-label={`Save ${item.term}`}>
                    <LibraryIcon name="bookmark-outline" />
                  </button>
                </div>
                <h2>{item.term}</h2>
                <p>{item.definition}</p>
                <StatusBadge status={item.status} />
              </article>
            ))}
          </section>

          <div className="terms-pagination-row">
            <nav className="terms-pagination" aria-label="Pagination">
              <button className="disabled" type="button" aria-label="Previous page">
                <LibraryIcon name="pagination-left" />
              </button>
              {[1, 2, 3].map((page) => (
                <button className={page === 1 ? "active" : ""} key={page} type="button">
                  {page}
                </button>
              ))}
              <button type="button" aria-label="Next page">
                <LibraryIcon name="pagination-right" />
              </button>
            </nav>
            <button className="terms-per-page" type="button">
              Show <strong>10</strong> per page
              <LibraryIcon name="chevron-down" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
