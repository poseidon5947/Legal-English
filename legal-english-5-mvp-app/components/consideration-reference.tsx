import Link from "next/link";

type ConsiderationIconName =
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
  | "search"
  | "bell"
  | "chevron-down"
  | "chevron-right"
  | "arrow-left"
  | "arrow-right"
  | "bookmark-outline"
  | "speaker"
  | "crown"
  | "contract-document"
  | "status-learning"
  | "definition-book"
  | "spanish-globe"
  | "civil-scales"
  | "warning-triangle"
  | "chain-link"
  | "quote-marks"
  | "mastered-check"
  | "notes-page";

function ConsiderationIcon({ name, className = "" }: { name: ConsiderationIconName; className?: string }) {
  return <img className={`consideration-icon ${className}`.trim()} src={`/consideration-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

const navMain: ReadonlyArray<readonly [string, ConsiderationIconName, string, boolean]> = [
  ["Home", "nav-home", "/", false],
  ["Terms Library", "nav-book", "/terms", true],
  ["Categories", "nav-categories", "/categories", false],
  ["Progress", "nav-progress", "/progress", false],
  ["Quizzes", "nav-quiz", "/quizzes", false],
  ["My Library", "nav-library", "/terms", false],
];

const navAccount: ReadonlyArray<readonly [string, ConsiderationIconName, string]> = [
  ["Account", "nav-user", "/account"],
  ["Billing", "nav-billing-card", "/billing"],
  ["Help & Support", "nav-help-globe", "/account/help"],
];

const detailSections = [
  {
    title: "Definition",
    icon: "definition-book" as const,
    theme: "blue",
    body: "Something of value exchanged between parties that induces each to enter into a contract. It is a fundamental element required for a valid, enforceable contract in common law.",
  },
  {
    title: "Spanish Equivalent",
    icon: "spanish-globe" as const,
    theme: "green",
    body: "Contraprestación",
    badge: "Common Translation",
  },
  {
    title: "Civil Law Equivalent",
    icon: "civil-scales" as const,
    theme: "purple",
    body: "Causa (causa del contrato)",
    badge: "Legal System Note",
  },
  {
    title: "Spanish-Speaker Alert",
    icon: "warning-triangle" as const,
    theme: "orange",
    body: 'Do not confuse "consideration" with "consideración" (courtesy or thought). In contracts, "consideration" means the value exchanged, not polite regard.',
  },
  {
    title: "Use It With",
    icon: "chain-link" as const,
    theme: "indigo",
    body: "contract, promise, offer, acceptance, bargain, performance, mutual obligation, enforceable agreement",
  },
] as const;

export function ConsiderationReference() {
  return (
    <main className="consideration-reference-page">
      <aside className="consideration-sidebar">
        <div>
          <Link className="consideration-brand" href="/">
            <ConsiderationIcon name="logo-shield" />
            <span>
              <strong>LEGAL ENGLISH 5</strong>
              <small>MPC LAW STUDIO</small>
            </span>
          </Link>

          <nav className="consideration-nav" aria-label="Main navigation">
            {navMain.map(([label, icon, href, active]) => (
              <Link className={active ? "active" : ""} href={href} key={label}>
                <ConsiderationIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="consideration-sidebar-bottom">
          <nav className="consideration-nav account" aria-label="Account navigation">
            {navAccount.map(([label, icon, href]) => (
              <Link href={href} key={label}>
                <ConsiderationIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
            <button type="button">
              <ConsiderationIcon name="nav-signout" />
              <span>Sign Out</span>
            </button>
          </nav>

          <section className="consideration-trial-card" aria-label="Trial status">
            <span>
              <ConsiderationIcon name="crown" />
            </span>
            <strong>7-Day Free Trial</strong>
            <p>You have 6 days left in your free trial.</p>
            <Link href="/billing">Upgrade Now</Link>
          </section>
        </div>
      </aside>

      <section className="consideration-workspace">
        <header className="consideration-topbar">
          <label className="consideration-search">
            <ConsiderationIcon name="search" />
            <input placeholder="Search terms, categories, or content..." aria-label="Search terms, categories, or content" />
          </label>
          <div className="consideration-user-tools">
            <button className="consideration-notification" type="button" aria-label="Notifications">
              <ConsiderationIcon name="bell" />
              <span />
            </button>
            <Link className="consideration-user-pill" href="/account">
              <img src="/consideration-assets/people/alex-johnson.png" alt="" />
              <span>
                <strong>Alex Johnson</strong>
                <small>Learner</small>
              </span>
              <ConsiderationIcon name="chevron-down" />
            </Link>
          </div>
        </header>

        <div className="consideration-content">
          <section className="consideration-main-column">
            <nav className="consideration-breadcrumb" aria-label="Breadcrumb">
              <Link href="/terms">Terms Library</Link>
              <ConsiderationIcon name="chevron-right" />
              <Link href="/terms">Contracts</Link>
              <ConsiderationIcon name="chevron-right" />
              <span>Consideration</span>
            </nav>

            <div className="consideration-title-row">
              <div>
                <div className="consideration-title-line">
                  <h1>Consideration</h1>
                  <button type="button" aria-label="Save Consideration">
                    <ConsiderationIcon name="bookmark-outline" />
                  </button>
                </div>
                <div className="consideration-pronunciation">
                  <button type="button" aria-label="Play pronunciation">
                    <ConsiderationIcon name="speaker" />
                  </button>
                  <span>/kənˌsɪd.əˈreɪ.ʃən/</span>
                  <strong>kuhn-sid-uh-RAY-shun</strong>
                </div>
              </div>
              <div className="consideration-term-actions">
                <span className="consideration-category-chip">
                  <ConsiderationIcon name="contract-document" />
                  Contracts
                </span>
                <label className="consideration-status-select">
                  <span>Learning Status</span>
                  <button type="button">
                    <i />
                    Learning
                    <ConsiderationIcon name="chevron-down" />
                  </button>
                </label>
              </div>
            </div>

            <div className="consideration-detail-stack">
              {detailSections.map((section) => (
                <article className={`consideration-info-card ${section.theme}`} key={section.title}>
                  <div className="consideration-info-icon">
                    <ConsiderationIcon name={section.icon} />
                  </div>
                  <div>
                    <div className="consideration-info-heading">
                      <h2>{section.title}</h2>
                      {"badge" in section && <span>{section.badge}</span>}
                    </div>
                    <p>{section.body}</p>
                  </div>
                </article>
              ))}

              <article className="consideration-info-card quote">
                <div className="consideration-info-icon">
                  <ConsiderationIcon name="quote-marks" />
                </div>
                <div>
                  <h2>In Context</h2>
                  <p>
                    The contractor's agreement to complete the work on time provided <strong>valuable consideration</strong> for the client's promise to pay
                    the agreed fees.
                  </p>
                  <span>Real-World Example</span>
                </div>
              </article>
            </div>

            <div className="consideration-bottom-actions">
              <button type="button">
                <ConsiderationIcon name="mastered-check" />
                Mark as Mastered
              </button>
              <button type="button">
                <ConsiderationIcon name="bookmark-outline" />
                Add to My Library
              </button>
              <Link href="/terms/breach-of-contract">
                Next Term: Breach of Contract
                <ConsiderationIcon name="arrow-right" />
              </Link>
            </div>
          </section>

          <aside className="consideration-right-rail">
            <div className="consideration-term-nav">
              <button type="button">
                <ConsiderationIcon name="arrow-left" />
                Previous Term
              </button>
              <button type="button">
                Next Term
                <ConsiderationIcon name="arrow-right" />
              </button>
            </div>

            <section className="consideration-quiz-card">
              <div className="consideration-rail-heading">
                <h2>
                  <ConsiderationIcon name="nav-quiz" />
                  Quick Quiz
                </h2>
                <span>1 of 3</span>
              </div>
              <p>What is consideration in contract law?</p>
              <div className="consideration-options">
                {([
                  ["Something of value exchanged between parties to form a binding contract.", true],
                  ["A legal duty imposed by law.", false],
                  ["A promise without any exchange.", false],
                  ["An optional term added later.", false],
                ] as const).map(([label, selected]) => (
                  <label className={selected ? "selected" : ""} key={label}>
                    <span>{selected ? "" : ""}</span>
                    <b>{label}</b>
                    {selected && <ConsiderationIcon name="mastered-check" />}
                  </label>
                ))}
              </div>
              <button className="consideration-primary" type="button">
                Check Answer
              </button>
              <Link href="/terms/consideration">View Explanation</Link>
            </section>

            <section className="consideration-progress-card">
              <h2>Your Progress</h2>
              <div className="consideration-progress-body">
                <div className="consideration-ring">
                  <strong>60%</strong>
                  <span>Understanding</span>
                </div>
                <p>
                  You've marked this term as <strong>Learning.</strong>
                  <br />
                  Keep reviewing to build full confidence.
                </p>
              </div>
              <div className="consideration-progress-scale">
                <span>New</span>
                <span>Learning</span>
                <span>Mastered</span>
              </div>
            </section>

            <section className="consideration-related-card">
              <div className="consideration-rail-heading">
                <h2>Related Terms</h2>
                <Link href="/terms">View All in Contracts</Link>
              </div>
              <div>
                {["Offer", "Acceptance", "Bargain", "Promise", "Contract"].map((term) => (
                  <span key={term}>{term}</span>
                ))}
              </div>
            </section>

            <section className="consideration-notes-card">
              <div className="consideration-rail-heading">
                <h2>Your Notes</h2>
                <button type="button">Edit</button>
              </div>
              <div>
                <ConsiderationIcon name="notes-page" />
                <p>
                  <strong>Key takeaway:</strong> Consideration must be real and of value, but it does not have to be equal in value.
                </p>
                <span>Added May 2, 2025</span>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
