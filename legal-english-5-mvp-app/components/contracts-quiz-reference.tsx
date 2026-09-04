import Link from "next/link";

type ContractsQuizIconName =
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
  | "crown"
  | "back-arrow"
  | "clock-timer"
  | "pause-control"
  | "check-circle"
  | "related-book"
  | "external-arrow"
  | "help-question"
  | "progress-chart";

function ContractsQuizIcon({ name, className = "" }: { name: ContractsQuizIconName; className?: string }) {
  return <img className={`contracts-quiz-icon ${className}`.trim()} src={`/contracts-quiz-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

const navMain: ReadonlyArray<readonly [string, ContractsQuizIconName, string, boolean]> = [
  ["Home", "nav-home", "/", false],
  ["Terms Library", "nav-book", "/terms", false],
  ["Categories", "nav-categories", "/categories", false],
  ["Progress", "nav-progress", "/progress", false],
  ["Quizzes", "nav-quiz", "/quizzes", true],
  ["My Library", "nav-library", "/terms", false],
];

const navAccount: ReadonlyArray<readonly [string, ContractsQuizIconName, string]> = [
  ["Account", "nav-user", "/account"],
  ["Billing", "nav-billing-card", "/billing"],
  ["Help & Support", "nav-help-globe", "/account/help"],
];

const options = [
  ["A", "Offer", false],
  ["B", "Acceptance", false],
  ["C", "Consideration", true],
  ["D", "Intention to create legal relations", false],
] as const;

const navigator = [
  { label: "1", state: "correct" },
  { label: "2", state: "correct" },
  { label: "3", state: "current" },
  { label: "4", state: "empty" },
  { label: "5", state: "empty" },
  { label: "6", state: "empty" },
  { label: "7", state: "empty" },
  { label: "8", state: "empty" },
  { label: "9", state: "empty" },
  { label: "10", state: "empty" },
] as const;

export function ContractsQuizReference() {
  return (
    <main className="contracts-quiz-page">
      <aside className="contracts-quiz-sidebar">
        <div>
          <Link className="contracts-quiz-brand" href="/">
            <ContractsQuizIcon name="logo-shield" />
            <span>
              <strong>LEGAL ENGLISH 5</strong>
              <small>MPC LAW STUDIO</small>
            </span>
          </Link>

          <nav className="contracts-quiz-nav" aria-label="Main navigation">
            {navMain.map(([label, icon, href, active]) => (
              <Link className={active ? "active" : ""} href={href} key={label}>
                <ContractsQuizIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="contracts-quiz-sidebar-bottom">
          <nav className="contracts-quiz-nav account" aria-label="Account navigation">
            {navAccount.map(([label, icon, href]) => (
              <Link href={href} key={label}>
                <ContractsQuizIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
            <button type="button">
              <ContractsQuizIcon name="nav-signout" />
              <span>Sign Out</span>
            </button>
          </nav>

          <section className="contracts-quiz-upgrade" aria-label="Upgrade to Premium">
            <span>
              <ContractsQuizIcon name="crown" />
            </span>
            <strong>Upgrade to Premium</strong>
            <p>Unlock unlimited quizzes, AI explanations, and advanced progress analytics.</p>
            <Link href="/billing">Upgrade Now</Link>
          </section>
        </div>
      </aside>

      <section className="contracts-quiz-workspace">
        <header className="contracts-quiz-topbar">
          <label className="contracts-quiz-search">
            <input placeholder="Search terms, categories, or content..." aria-label="Search terms, categories, or content" />
            <ContractsQuizIcon name="search" />
          </label>
          <div className="contracts-quiz-user-tools">
            <button className="contracts-quiz-bell" type="button" aria-label="Notifications">
              <ContractsQuizIcon name="bell" />
              <span>6</span>
            </button>
            <Link className="contracts-quiz-user" href="/account">
              <img src="/contracts-quiz-assets/people/alex-johnson.png" alt="" />
              <span>
                <strong>Alex Johnson</strong>
                <small>Learner</small>
              </span>
              <ContractsQuizIcon name="chevron-down" />
            </Link>
          </div>
        </header>

        <div className="contracts-quiz-content">
          <section className="contracts-quiz-main">
            <Link className="contracts-quiz-back" href="/quizzes">
              <ContractsQuizIcon name="back-arrow" />
              Back to Quizzes
            </Link>

            <div className="contracts-quiz-title-row">
              <div>
                <h1>Contracts Quiz <span>Term 1 of 10</span></h1>
                <p>Test your understanding of key legal terms.</p>
              </div>
              <aside className="contracts-quiz-timer">
                <ContractsQuizIcon name="clock-timer" />
                <div>
                  <strong>14:32</strong>
                  <span>Time remaining</span>
                </div>
                <button type="button" aria-label="Pause quiz">
                  <ContractsQuizIcon name="pause-control" />
                </button>
              </aside>
            </div>

            <div className="contracts-quiz-progress-line">
              <div>
                <strong>Question 3 of 10</strong>
                <span>30% Complete</span>
              </div>
              <i><b /></i>
            </div>

            <section className="contracts-question-card">
              <h2>Which of the following is NOT an essential element of a valid contract?</h2>
              <div className="contracts-answer-list">
                {options.map(([letter, label, selected]) => (
                  <button className={selected ? "selected" : ""} type="button" key={letter}>
                    <span>{letter}</span>
                    <strong>{label}</strong>
                    {selected && <ContractsQuizIcon name="check-circle" />}
                  </button>
                ))}
              </div>

              <div className="contracts-correct-panel">
                <ContractsQuizIcon name="check-circle" />
                <div>
                  <strong>Correct Answer: C. Consideration</strong>
                  <p>
                    Consideration is an essential element of a valid contract. Without it, the agreement may be considered a mere promise and not legally enforceable.
                  </p>
                  <Link href="/terms/consideration">
                    <ContractsQuizIcon name="related-book" />
                    Related Term: <b>Consideration</b>
                  </Link>
                </div>
                <Link href="/terms/consideration">
                  View in Terms Library
                  <ContractsQuizIcon name="external-arrow" />
                </Link>
              </div>
            </section>

            <div className="contracts-quiz-actions">
              <button type="button">
                <ContractsQuizIcon name="back-arrow" />
                Previous Question
              </button>
              <button type="button">
                Next Question
                <ContractsQuizIcon name="external-arrow" />
              </button>
            </div>
          </section>

          <aside className="contracts-quiz-rail">
            <section className="contracts-quiz-panel contracts-progress-card">
              <h2>Your Progress</h2>
              <div className="contracts-progress-body">
                <div className="contracts-progress-ring">
                  <strong>56%</strong>
                  <span>Progress</span>
                </div>
                <dl>
                  <div>
                    <dt>Terms Studied</dt>
                    <dd>82</dd>
                  </div>
                  <div>
                    <dt>Terms Mastered</dt>
                    <dd>56</dd>
                  </div>
                  <div>
                    <dt>Quizzes Completed</dt>
                    <dd>24</dd>
                  </div>
                  <div>
                    <dt>Avg. Score</dt>
                    <dd>78%</dd>
                  </div>
                </dl>
              </div>
              <Link href="/progress">
                <ContractsQuizIcon name="progress-chart" />
                View Full Progress
              </Link>
            </section>

            <section className="contracts-quiz-panel contracts-navigator-card">
              <h2>Question Navigator</h2>
              <div className="contracts-navigator-grid">
                {navigator.map((item) => (
                  <button className={item.state} type="button" key={item.label}>
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="contracts-navigator-legend">
                <span><i className="correct" />Correct</span>
                <span><i className="incorrect" />Incorrect</span>
                <span><i className="unanswered" />Not answered</span>
              </div>
            </section>

            <section className="contracts-quiz-panel contracts-overview-card">
              <h2>Quiz Overview</h2>
              <dl>
                {[
                  ["Total Questions", "10", ""],
                  ["Answered", "3", ""],
                  ["Correct", "2", "good"],
                  ["Incorrect", "0", "bad"],
                  ["Not Answered", "1", ""],
                ].map(([label, value, tone]) => (
                  <div className={tone} key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="contracts-quiz-panel contracts-help-card">
              <span>
                <ContractsQuizIcon name="help-question" />
              </span>
              <div>
                <h2>Need Help?</h2>
                <p>Review related terms or contact support if you need assistance.</p>
                <Link href="/account/help">Get Help</Link>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
