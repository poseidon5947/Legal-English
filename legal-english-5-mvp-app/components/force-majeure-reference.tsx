import Link from "next/link";

type ForceIconName =
  | "logo-shield"
  | "nav-home"
  | "nav-book"
  | "nav-categories"
  | "nav-progress"
  | "nav-quiz"
  | "nav-library"
  | "nav-user"
  | "nav-billing-card"
  | "nav-help-globe"
  | "nav-signout"
  | "back-arrow"
  | "search"
  | "bell"
  | "chevron-down"
  | "bookmark-outline"
  | "mastered-check"
  | "term-badge"
  | "plus"
  | "previous-chevron"
  | "next-chevron"
  | "definition-book"
  | "speaker"
  | "balance-scales"
  | "spanish-globe"
  | "courthouse"
  | "warning-triangle"
  | "refresh-review"
  | "sparkle-summary"
  | "quote-marks"
  | "crown";

function ForceIcon({ name, className = "" }: { name: ForceIconName; className?: string }) {
  return <img className={`force-icon ${className}`.trim()} src={`/force-majeure-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

const navMain: ReadonlyArray<readonly [string, ForceIconName, string, boolean]> = [
  ["Home", "nav-home", "/", false],
  ["Terms Library", "nav-book", "/terms", true],
  ["Categories", "nav-categories", "/categories", false],
  ["Progress", "nav-progress", "/progress", false],
  ["Quizzes", "nav-quiz", "/quizzes", false],
  ["My Library", "nav-library", "/terms", false],
];

const navAccount: ReadonlyArray<readonly [string, ForceIconName, string]> = [
  ["Account", "nav-user", "/account"],
  ["Billing", "nav-billing-card", "/billing"],
  ["Help & Support", "nav-help-globe", "/account/help"],
];

const overviewRows = [
  {
    title: "Definition",
    icon: "definition-book" as const,
    tone: "blue",
    body: "An unforeseeable event beyond the control of the parties that prevents them from fulfilling a contractual obligation.",
  },
  {
    title: "Pronunciation",
    icon: "speaker" as const,
    tone: "purple",
    body: "/fɔːrs məˈʒɜːr/",
    audio: true,
  },
  {
    title: "Category",
    icon: "balance-scales" as const,
    tone: "blue",
    chip: "Contracts",
  },
  {
    title: "Spanish Equivalent",
    icon: "spanish-globe" as const,
    tone: "green",
    body: "Fuerza mayor",
    highlight: true,
  },
  {
    title: "Civil Law Equivalent (Conditional)",
    icon: "courthouse" as const,
    tone: "gold",
    body: "Caso fortuito o fuerza mayor",
  },
  {
    title: "Spanish-Speaker Alert (Conditional)",
    icon: "warning-triangle" as const,
    tone: "red",
    alert: 'No confundir con "caso fortuito" únicamente. En el common law, incluye eventos fuera del control de las partes que hacen imposible el cumplimiento.',
  },
] as const;

export function ForceMajeureReference() {
  return (
    <main className="force-reference-page">
      <aside className="force-sidebar">
        <div>
          <Link className="force-brand" href="/">
            <ForceIcon name="logo-shield" />
            <span>
              <strong>LEGAL ENGLISH 5</strong>
              <small>MPC LAW STUDIO</small>
            </span>
          </Link>

          <nav className="force-nav" aria-label="Main navigation">
            {navMain.map(([label, icon, href, active]) => (
              <Link className={active ? "active" : ""} href={href} key={label}>
                <ForceIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="force-sidebar-bottom">
          <nav className="force-nav account" aria-label="Account navigation">
            {navAccount.map(([label, icon, href]) => (
              <Link href={href} key={label}>
                <ForceIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
            <button type="button">
              <ForceIcon name="nav-signout" />
              <span>Sign Out</span>
            </button>
          </nav>

          <section className="force-trial-card" aria-label="Trial status">
            <span>
              <ForceIcon name="crown" />
            </span>
            <strong>7-Day Free Trial</strong>
            <p>You have 6 days left in your free trial.</p>
            <Link href="/billing">Upgrade Now</Link>
          </section>
        </div>
      </aside>

      <section className="force-workspace">
        <header className="force-topbar">
          <Link className="force-back-link" href="/terms">
            <ForceIcon name="back-arrow" />
            Back to Terms Library
          </Link>
          <div className="force-topbar-right">
            <label className="force-search">
              <input placeholder="Search terms..." aria-label="Search terms" />
              <ForceIcon name="search" />
            </label>
            <button className="force-notification" type="button" aria-label="Notifications">
              <ForceIcon name="bell" />
              <span />
            </button>
            <Link className="force-user-pill" href="/account">
              <img src="/force-majeure-assets/people/alex-johnson.png" alt="" />
              <span>
                <strong>Alex Johnson</strong>
                <small>Learner</small>
              </span>
              <ForceIcon name="chevron-down" />
            </Link>
          </div>
        </header>

        <div className="force-content">
          <section className="force-main-column">
            <span className="force-category-label">Contracts</span>
            <div className="force-title-row">
              <div>
                <div className="force-title-line">
                  <h1>Force Majeure</h1>
                  <button type="button" aria-label="Save Force Majeure">
                    <ForceIcon name="bookmark-outline" />
                  </button>
                </div>
                <div className="force-badges">
                  <span className="mastered">
                    <ForceIcon name="mastered-check" />
                    Mastered
                  </span>
                  <span className="term">
                    <ForceIcon name="term-badge" />
                    Term 1 of 10
                  </span>
                  <button type="button">
                    <ForceIcon name="plus" />
                    Add to My Library
                  </button>
                </div>
              </div>
              <div className="force-term-nav">
                <button type="button">
                  <ForceIcon name="previous-chevron" />
                  Previous
                </button>
                <button type="button">
                  Next
                  <ForceIcon name="next-chevron" />
                </button>
              </div>
            </div>

            <nav className="force-tabs" aria-label="Force Majeure sections">
              <button className="active" type="button">
                Overview
              </button>
              <button type="button">In Context</button>
              <button type="button">Use It With</button>
              <Link href="/terms/force-majeure/quiz">Quiz (5)</Link>
            </nav>

            <div className="force-overview-list">
              {overviewRows.map((row) => (
                <article className={`force-overview-row ${row.tone}`} key={row.title}>
                  <div className="force-row-icon">
                    <ForceIcon name={row.icon} />
                  </div>
                  <div>
                    <h2>{row.title}</h2>
                    {"chip" in row && <span className="force-contract-chip">{row.chip}</span>}
                    {"body" in row && (
                      <p className={"highlight" in row && row.highlight ? "highlight" : ""}>
                        {row.body}
                        {"audio" in row && (
                          <button type="button" aria-label="Play pronunciation">
                            <ForceIcon name="speaker" />
                          </button>
                        )}
                      </p>
                    )}
                    {"alert" in row && <p className="force-alert-copy">{row.alert}</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="force-right-rail">
            <section className="force-progress-card">
              <h2>Your Progress</h2>
              <div className="force-progress-body">
                <div className="force-ring">
                  <strong>90%</strong>
                  <span>Mastered</span>
                </div>
                <dl>
                  <dt>First studied</dt>
                  <dd>May 20, 2026</dd>
                  <dt>Last reviewed</dt>
                  <dd>May 24, 2026</dd>
                  <dt>Times reviewed</dt>
                  <dd>3</dd>
                </dl>
              </div>
              <button type="button">
                <ForceIcon name="refresh-review" />
                Review Again
              </button>
            </section>

            <section className="force-summary-card">
              <h2>
                <ForceIcon name="sparkle-summary" />
                Quick Summary
              </h2>
              <p>Force Majeure excuses performance when an unforeseeable event beyond the parties' control makes it impossible or impracticable to perform the contract.</p>
            </section>

            <section className="force-examples-card">
              <h2>
                <ForceIcon name="quote-marks" />
                Examples of Use
              </h2>
              <ul>
                <li>The contract includes a force majeure clause.</li>
                <li>The pandemic was considered a force majeure event.</li>
                <li>Neither party shall be liable for delays caused by force majeure.</li>
              </ul>
            </section>

            <section className="force-related-card">
              <h2>
                <ForceIcon name="plus" />
                Related Terms
              </h2>
              <div>
                <span>Impossibility</span>
                <span>Hardship</span>
                <span>Frustration of Purpose</span>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
