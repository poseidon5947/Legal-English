import Link from "next/link";

type IndemnityIconName =
  | "logo-shield"
  | "nav-home"
  | "nav-book"
  | "nav-categories"
  | "nav-quiz"
  | "nav-progress"
  | "bookmark-outline"
  | "nav-user"
  | "nav-billing-card"
  | "nav-help-globe"
  | "nav-signout"
  | "search"
  | "bell"
  | "chevron-down"
  | "crown"
  | "back-arrow"
  | "share"
  | "contract-folder"
  | "essential-key"
  | "mastered-badge"
  | "quote-marks"
  | "check-circle"
  | "liability-shield"
  | "warranty-shield"
  | "hold-harmless"
  | "damages-money"
  | "plus"
  | "arrow-right"
  | "refresh-review"
  | "tip-bulb";

function IndemnityIcon({ name, className = "" }: { name: IndemnityIconName; className?: string }) {
  return <img className={`indemnity-icon ${className}`.trim()} src={`/indemnity-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

const navMain: ReadonlyArray<readonly [string, IndemnityIconName, string, boolean]> = [
  ["Home", "nav-home", "/", false],
  ["Terms Library", "nav-book", "/terms", true],
  ["Categories", "nav-categories", "/categories", false],
  ["Quizzes", "nav-quiz", "/quizzes", false],
  ["Progress", "nav-progress", "/progress", false],
  ["My Library", "bookmark-outline", "/terms", false],
];

const navAccount: ReadonlyArray<readonly [string, IndemnityIconName, string]> = [
  ["Account", "nav-user", "/account"],
  ["Billing", "nav-billing-card", "/billing"],
  ["Help & Support", "nav-help-globe", "/account/help"],
];

const relatedTerms = [
  ["Liability", "liability-shield"],
  ["Warranty", "warranty-shield"],
  ["Hold Harmless", "hold-harmless"],
  ["Damages", "damages-money"],
] as const;

const recentlyViewed = [
  ["Force Majeure", "May 31, 10:24 AM", "liability-shield"],
  ["Liquidated Damages", "May 30, 2:15 PM", "nav-quiz"],
  ["Breach of Contract", "May 29, 9:40 AM", "damages-money"],
] as const;

export function IndemnityReference() {
  return (
    <main className="indemnity-reference-page">
      <aside className="indemnity-sidebar">
        <div>
          <Link className="indemnity-brand" href="/">
            <IndemnityIcon name="logo-shield" />
            <span>
              <strong>LEGAL ENGLISH 5</strong>
              <small>MPC LAW STUDIO</small>
            </span>
          </Link>

          <nav className="indemnity-nav" aria-label="Main navigation">
            {navMain.map(([label, icon, href, active]) => (
              <Link className={active ? "active" : ""} href={href} key={label}>
                <IndemnityIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="indemnity-sidebar-bottom">
          <nav className="indemnity-nav account" aria-label="Account navigation">
            {navAccount.map(([label, icon, href]) => (
              <Link href={href} key={label}>
                <IndemnityIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
            <button type="button">
              <IndemnityIcon name="nav-signout" />
              <span>Sign Out</span>
            </button>
          </nav>

          <section className="indemnity-upgrade-card" aria-label="Upgrade to Premium">
            <span>
              <IndemnityIcon name="crown" />
            </span>
            <strong>Upgrade to Premium</strong>
            <p>Get unlimited access to all terms, quizzes, and advanced learning features.</p>
            <Link href="/billing">Upgrade Now</Link>
          </section>
        </div>
      </aside>

      <section className="indemnity-workspace">
        <header className="indemnity-topbar">
          <label className="indemnity-search">
            <input placeholder="Search terms, categories, or content..." aria-label="Search terms, categories, or content" />
            <IndemnityIcon name="search" />
          </label>
          <div className="indemnity-user-tools">
            <button className="indemnity-bell" type="button" aria-label="Notifications">
              <IndemnityIcon name="bell" />
              <span>6</span>
            </button>
            <Link className="indemnity-user-pill" href="/account">
              <img src="/indemnity-assets/people/alex-johnson.png" alt="" />
              <span>
                <strong>Alex Johnson</strong>
                <small>Learner</small>
              </span>
              <IndemnityIcon name="chevron-down" />
            </Link>
          </div>
        </header>

        <div className="indemnity-content">
          <section className="indemnity-main-column">
            <Link className="indemnity-back-link" href="/terms">
              <IndemnityIcon name="back-arrow" />
              Back to Terms Library
            </Link>

            <div className="indemnity-title-row">
              <div>
                <h1>Indemnity</h1>
                <div className="indemnity-badges">
                  <span className="contracts"><IndemnityIcon name="contract-folder" />Contracts</span>
                  <span className="essential"><IndemnityIcon name="essential-key" />Essential Term</span>
                  <span className="mastered"><IndemnityIcon name="mastered-badge" />Mastered</span>
                </div>
              </div>
              <div className="indemnity-term-tools">
                <button type="button" aria-label="Save Indemnity">
                  <IndemnityIcon name="bookmark-outline" />
                </button>
                <button type="button" aria-label="Share Indemnity">
                  <IndemnityIcon name="share" />
                </button>
              </div>
            </div>

            <p className="indemnity-definition">A legal agreement by which one party agrees to compensate or protect another party against loss or damage.</p>

            <section className="indemnity-example-section">
              <h2>Example in Context</h2>
              <blockquote>
                <IndemnityIcon name="quote-marks" />
                <p>The contractor provided an indemnity to the client against any claims arising from third-party property damage during the project.</p>
              </blockquote>
            </section>

            <section className="indemnity-key-section">
              <h2>Key Points</h2>
              <ul>
                <li><IndemnityIcon name="check-circle" />The indemnifier agrees to protect the indemnitee from specific losses.</li>
                <li><IndemnityIcon name="check-circle" />Common in contracts, insurance, and service agreements.</li>
                <li><IndemnityIcon name="check-circle" />Indemnities must be clear and unambiguous to be enforceable.</li>
                <li><IndemnityIcon name="check-circle" />May cover legal costs, damages, or other liabilities.</li>
              </ul>
            </section>

            <section className="indemnity-related-section">
              <h2>Related Terms</h2>
              <div>
                {relatedTerms.map(([term, icon]) => (
                  <Link href="/terms" key={term}>
                    <IndemnityIcon name={icon as IndemnityIconName} />
                    <span>{term}</span>
                    <IndemnityIcon name="arrow-right" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="indemnity-library-row">
              <div>
                <h2>Add to My Library</h2>
                <p>Save this term to review later.</p>
              </div>
              <button type="button">
                <IndemnityIcon name="plus" />
                Add to My Library
              </button>
            </section>

            <div className="indemnity-bottom-nav">
              <Link href="/terms/force-majeure">
                <IndemnityIcon name="back-arrow" />
                Previous Term
              </Link>
              <Link href="/terms/liquidated-damages">
                Next Term
                <IndemnityIcon name="arrow-right" />
              </Link>
            </div>
          </section>

          <aside className="indemnity-right-rail">
            <section className="indemnity-panel indemnity-progress-card">
              <h2>Your Progress</h2>
              <div className="indemnity-progress-body">
                <div className="indemnity-ring">
                  <strong>90%</strong>
                  <span>Mastered</span>
                </div>
                <dl>
                  <div><dt>Terms Studied</dt><dd>82</dd></div>
                  <div><dt>Terms Mastered</dt><dd>56</dd></div>
                  <div><dt>Categories</dt><dd>4 / 8</dd></div>
                  <div><dt>Avg. Score</dt><dd>78%</dd></div>
                </dl>
              </div>
              <Link href="/progress">
                <IndemnityIcon name="nav-progress" />
                View Progress Details
              </Link>
            </section>

            <section className="indemnity-panel indemnity-mastery-card">
              <div className="indemnity-rail-heading">
                <h2>Mastery Level</h2>
                <span>Mastered</span>
              </div>
              <div className="indemnity-mastery-steps">
                {["1", "2", "3", "4"].map((step, index) => (
                  <span className={index === 3 ? "active" : ""} key={step}>
                    <b>{step}</b>
                    <small>{["New", "Learning", "Reviewing", "Mastered"][index]}</small>
                  </span>
                ))}
              </div>
              <strong>You&apos;ve mastered this term!</strong>
              <p>Great job! Keep reviewing to maintain your knowledge.</p>
              <button type="button">
                <IndemnityIcon name="refresh-review" />
                Review This Term
              </button>
            </section>

            <section className="indemnity-panel indemnity-recent-card">
              <div className="indemnity-rail-heading">
                <h2>Recently Viewed</h2>
                <Link href="/terms">View all</Link>
              </div>
              <div className="indemnity-recent-list">
                {recentlyViewed.map(([title, time, icon]) => (
                  <Link href="/terms" key={title}>
                    <span><IndemnityIcon name={icon as IndemnityIconName} /></span>
                    <div>
                      <strong>{title}</strong>
                      <small>{time}</small>
                    </div>
                    <b>...</b>
                  </Link>
                ))}
              </div>
            </section>

            <section className="indemnity-tip-card">
              <IndemnityIcon name="tip-bulb" />
              <div>
                <h2>Learning Tip</h2>
                <p>Review terms regularly to reinforce understanding and improve retention.</p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
