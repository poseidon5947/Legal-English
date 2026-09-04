import Link from "next/link";

type ForceQuizIconName =
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
  | "crown"
  | "clock-timer"
  | "progress-detail"
  | "refresh-review"
  | "external-link"
  | "previous-arrow"
  | "next-arrow"
  | "selected-check"
  | "explanation-bulb"
  | "mastered-check"
  | "question-one"
  | "question-two"
  | "question-blank"
  | "bookmark-outline"
  | "term-badge";

function ForceQuizIcon({ name, className = "" }: { name: ForceQuizIconName; className?: string }) {
  return <img className={`force-quiz-icon ${className}`.trim()} src={`/force-quiz-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

const navMain: ReadonlyArray<readonly [string, ForceQuizIconName, string, boolean]> = [
  ["Home", "nav-home", "/", false],
  ["Terms Library", "nav-book", "/terms", false],
  ["Categories", "nav-categories", "/categories", false],
  ["Progress", "nav-progress", "/progress", false],
  ["Quizzes", "nav-quiz", "/quizzes", true],
  ["My Library", "nav-library", "/terms", false],
];

const navAccount: ReadonlyArray<readonly [string, ForceQuizIconName, string]> = [
  ["Account", "nav-user", "/account"],
  ["Billing", "nav-billing-card", "/billing"],
  ["Help & Support", "nav-help-globe", "/account/help"],
];

const options = [
  ["A", "An event that makes a contract more profitable for one party.", false],
  ["B", "An unforeseeable event beyond the control of the parties that prevents them from fulfilling a contractual obligation.", true],
  ["C", "A minor delay in performance caused by normal business operations.", false],
  ["D", "A clause that allows either party to cancel the contract at any time.", false],
] as const;

const overview = [
  ["question-one", "Question 1", "Correct"],
  ["question-two", "Question 2", "Correct"],
  ["question-blank", "Question 3", "Not answered"],
  ["question-blank", "Question 4", "Not answered"],
  ["question-blank", "Question 5", "Not answered"],
] as const;

export function ForceQuizReference() {
  return (
    <main className="force-quiz-reference-page">
      <aside className="force-quiz-sidebar">
        <div>
          <Link className="force-quiz-brand" href="/">
            <ForceQuizIcon name="logo-shield" />
            <span>
              <strong>LEGAL ENGLISH 5</strong>
              <small>MPC LAW STUDIO</small>
            </span>
          </Link>

          <nav className="force-quiz-nav" aria-label="Main navigation">
            {navMain.map(([label, icon, href, active]) => (
              <Link className={active ? "active" : ""} href={href} key={label}>
                <ForceQuizIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="force-quiz-sidebar-bottom">
          <nav className="force-quiz-nav account" aria-label="Account navigation">
            {navAccount.map(([label, icon, href]) => (
              <Link href={href} key={label}>
                <ForceQuizIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
            <button type="button">
              <ForceQuizIcon name="nav-signout" />
              <span>Sign Out</span>
            </button>
          </nav>

          <section className="force-quiz-trial-card" aria-label="Trial status">
            <span>
              <ForceQuizIcon name="crown" />
            </span>
            <strong>7-Day Free Trial</strong>
            <p>You have 6 days left in your free trial.</p>
            <Link href="/billing">Upgrade Now</Link>
          </section>
        </div>
      </aside>

      <section className="force-quiz-workspace">
        <header className="force-quiz-topbar">
          <Link className="force-quiz-back-link" href="/terms/force-majeure">
            <ForceQuizIcon name="back-arrow" />
            Back to Term
          </Link>
          <div className="force-quiz-topbar-right">
            <label className="force-quiz-search">
              <input placeholder="Search terms..." aria-label="Search terms" />
              <ForceQuizIcon name="search" />
            </label>
            <button className="force-quiz-notification" type="button" aria-label="Notifications">
              <ForceQuizIcon name="bell" />
              <span>3</span>
            </button>
            <Link className="force-quiz-user-pill" href="/account">
              <img src="/force-quiz-assets/people/alex-johnson.png" alt="" />
              <span>
                <strong>Alex Johnson</strong>
                <small>Learner</small>
              </span>
              <ForceQuizIcon name="chevron-down" />
            </Link>
          </div>
        </header>

        <div className="force-quiz-content">
          <section className="force-quiz-main-column">
            <div className="force-quiz-title-panel">
              <div>
                <span className="force-quiz-category-label">Contracts</span>
                <div className="force-quiz-title-line">
                  <h1>Force Majeure &ndash; Quiz</h1>
                  <span>
                    <ForceQuizIcon name="term-badge" />
                    Term 1 of 10
                  </span>
                </div>
                <p>Test your understanding of this term.</p>
              </div>
              <section className="force-quiz-timer-card" aria-label="Time remaining">
                <ForceQuizIcon name="clock-timer" />
                <strong>12:45</strong>
                <span>Time remaining</span>
              </section>
            </div>

            <section className="force-quiz-progress-strip">
              <div>
                <strong>Question 2 of 5</strong>
                <span>40% Complete</span>
              </div>
              <i>
                <b />
              </i>
            </section>

            <section className="force-quiz-question-card">
              <h2>Which of the following best describes force majeure?</h2>
              <div className="force-quiz-options">
                {options.map(([letter, label, selected]) => (
                  <label className={selected ? "selected" : ""} key={letter}>
                    <span>{letter}</span>
                    <b>{label}</b>
                    {selected && <ForceQuizIcon name="selected-check" />}
                  </label>
                ))}
              </div>
              <div className="force-quiz-explanation">
                <span>
                  <ForceQuizIcon name="explanation-bulb" />
                </span>
                <div>
                  <strong>Explanation</strong>
                  <p>Force majeure refers to events that are unexpected, beyond the parties' control, and make performance impossible or impracticable.</p>
                </div>
              </div>
            </section>

            <div className="force-quiz-bottom-actions">
              <button type="button">
                <ForceQuizIcon name="previous-arrow" />
                Previous
              </button>
              <button type="button">
                Next Question
                <ForceQuizIcon name="next-arrow" />
              </button>
            </div>
          </section>

          <aside className="force-quiz-right-rail">
            <section className="force-quiz-progress-card">
              <h2>Your Progress</h2>
              <div className="force-quiz-progress-body">
                <div className="force-quiz-ring">
                  <strong>90%</strong>
                  <span>Mastered</span>
                </div>
                <dl>
                  <dt>Terms Studied</dt>
                  <dd>30</dd>
                  <dt>Mastered</dt>
                  <dd>27</dd>
                  <dt>Learning</dt>
                  <dd>3</dd>
                  <dt>New</dt>
                  <dd>0</dd>
                </dl>
              </div>
              <Link href="/progress">
                <ForceQuizIcon name="progress-detail" />
                View Progress Details
              </Link>
            </section>

            <section className="force-quiz-status-card">
              <div>
                <h2>Term Status</h2>
                <span>Mastered</span>
              </div>
              <p>You've answered 5 of 5 questions correctly.</p>
              <i>
                <b />
              </i>
              <strong>Excellent! You've mastered this term.</strong>
              <button type="button">
                <ForceQuizIcon name="refresh-review" />
                Review Term
              </button>
            </section>

            <section className="force-quiz-overview-card">
              <h2>Quiz Overview</h2>
              <div>
                {overview.map(([icon, label, status], index) => (
                  <article className={status === "Correct" ? "correct" : ""} key={label}>
                    <ForceQuizIcon name={icon} />
                    <span>{label}</span>
                    <strong>{status}</strong>
                  </article>
                ))}
              </div>
            </section>

            <section className="force-quiz-help-card">
              <h2>Need Help?</h2>
              <p>Review the term content again before retaking the quiz.</p>
              <Link href="/terms/force-majeure">
                Go to Term
                <ForceQuizIcon name="external-link" />
              </Link>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
