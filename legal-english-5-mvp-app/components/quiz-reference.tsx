import Link from "next/link";

type QuizIconName =
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
  | "bookmark-outline"
  | "target-accuracy"
  | "clipboard-quizzes"
  | "flame-streak"
  | "graduation-cap"
  | "check-circle"
  | "arrow-right"
  | "document-row"
  | "courthouse"
  | "people-group"
  | "balance-scales"
  | "rising-trend"
  | "trophy-achievement"
  | "history-document"
  | "calendar"
  | "report-bars"
  | "crown";

function QuizIcon({ name, className = "" }: { name: QuizIconName; className?: string }) {
  return <img className={`quiz-ref-icon ${className}`.trim()} src={`/quiz-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

const navMain: ReadonlyArray<readonly [string, QuizIconName, string, boolean]> = [
  ["Home", "nav-home", "/", false],
  ["Terms Library", "nav-book", "/terms", false],
  ["Categories", "nav-categories", "/categories", false],
  ["Progress", "nav-progress", "/progress", false],
  ["Quizzes", "nav-quiz", "/quizzes", true],
  ["My Library", "nav-library", "/terms", false],
];

const navAccount: ReadonlyArray<readonly [string, QuizIconName, string]> = [
  ["Account", "nav-user", "/account"],
  ["Billing", "nav-billing-card", "/billing"],
  ["Help & Support", "nav-help-globe", "/account/help"],
];

const stats = [
  { label: "Overall Accuracy", value: "72%", sub: "8% vs last 7 days", icon: "target-accuracy" as const, tone: "green" },
  { label: "Quizzes Completed", value: "18", sub: "4 this week", icon: "clipboard-quizzes" as const, tone: "blue" },
  { label: "Current Streak", value: "7 Days", sub: "Best: 12 days", icon: "flame-streak" as const, tone: "gold" },
  { label: "Terms Mastered", value: "48", sub: "6 this week", icon: "graduation-cap" as const, tone: "purple" },
] as const;

const quizOptions = [
  ["A legal duty imposed by law.", false],
  ["Something of value exchanged between parties.", true],
  ["A promise without any exchange.", false],
  ["An optional term added later.", false],
] as const;

const history = [
  ["Contracts Quiz", "80%", "May 2, 2025", "Contracts", "Passed"],
  ["Employment Law Basics", "60%", "May 1, 2025", "Employment Law", "Completed"],
  ["Corporate Law Fundamentals", "90%", "Apr 30, 2025", "Corporate Law", "Passed"],
  ["Consideration & Offer", "40%", "Apr 29, 2025", "Contracts", "Review"],
  ["Breach of Contract", "70%", "Apr 28, 2025", "Contracts", "Completed"],
] as const;

const practice = [
  { name: "Contracts", icon: "document-row" as const, accuracy: "56%", tag: "Needs Practice", tone: "gold", progress: 56 },
  { name: "Corporate Law", icon: "courthouse" as const, accuracy: "70%", tag: "Good Progress", tone: "green", progress: 70 },
  { name: "Employment Law", icon: "people-group" as const, accuracy: "62%", tag: "Needs Practice", tone: "gold", progress: 62 },
] as const;

const achievements = [
  { title: "7-Day Streak", body: "Keep it up! You've studied 7 days in a row.", icon: "flame-streak" as const, time: "Today", tone: "gold" },
  { title: "5 Quizzes Completed", body: "You've completed 5 quizzes this week.", icon: "check-circle" as const, time: "2d ago", tone: "green" },
  { title: "Contracts Improving", body: "Your accuracy in Contracts improved by 12%.", icon: "rising-trend" as const, time: "3d ago", tone: "purple" },
] as const;

const categoryAccuracy = [
  ["Contracts", "document-row" as const, "76%", "green"],
  ["Corporate Law", "courthouse" as const, "70%", "green"],
  ["Employment Law", "people-group" as const, "62%", "gold"],
  ["Civil Law", "balance-scales" as const, "58%", "blue"],
] as const;

export function QuizReference() {
  return (
    <main className="quiz-reference-page">
      <aside className="quiz-ref-sidebar">
        <div>
          <Link className="quiz-ref-brand" href="/">
            <QuizIcon name="logo-shield" />
            <span>
              <strong>LEGAL ENGLISH 5</strong>
              <small>MPC LAW STUDIO</small>
            </span>
          </Link>

          <nav className="quiz-ref-nav" aria-label="Main navigation">
            {navMain.map(([label, icon, href, active]) => (
              <Link className={active ? "active" : ""} href={href} key={label}>
                <QuizIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="quiz-ref-sidebar-bottom">
          <nav className="quiz-ref-nav account" aria-label="Account navigation">
            {navAccount.map(([label, icon, href]) => (
              <Link href={href} key={label}>
                <QuizIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
            <button type="button">
              <QuizIcon name="nav-signout" />
              <span>Sign Out</span>
            </button>
          </nav>

          <section className="quiz-ref-trial-card" aria-label="Trial status">
            <span>
              <QuizIcon name="crown" />
            </span>
            <strong>7-Day Free Trial</strong>
            <p>You have 6 days left in your free trial.</p>
            <Link href="/billing">Upgrade Now</Link>
          </section>
        </div>
      </aside>

      <section className="quiz-ref-workspace">
        <header className="quiz-ref-topbar">
          <label className="quiz-ref-search">
            <QuizIcon name="search" />
            <input placeholder="Search terms, categories, or content..." aria-label="Search terms, categories, or content" />
          </label>
          <div className="quiz-ref-user-tools">
            <button className="quiz-ref-notification" type="button" aria-label="Notifications">
              <QuizIcon name="bell" />
              <span />
            </button>
            <Link className="quiz-ref-user-pill" href="/account">
              <img src="/quiz-assets/people/alex-johnson.png" alt="" />
              <span>
                <strong>Alex Johnson</strong>
                <small>Learner</small>
              </span>
              <QuizIcon name="chevron-down" />
            </Link>
          </div>
        </header>

        <div className="quiz-ref-content">
          <section className="quiz-ref-main-column">
            <div className="quiz-ref-heading">
              <div>
                <div>
                  <h1>Quiz &amp; Progress</h1>
                  <button type="button" aria-label="Save Quiz & Progress">
                    <QuizIcon name="bookmark-outline" />
                  </button>
                </div>
                <p>Test your knowledge and track your mastery over legal terms.</p>
              </div>
            </div>

            <section className="quiz-ref-stat-grid" aria-label="Quiz statistics">
              {stats.map((stat) => (
                <article className={stat.tone} key={stat.label}>
                  <span>
                    <QuizIcon name={stat.icon} />
                  </span>
                  <div>
                    <p>{stat.label}</p>
                    <strong>{stat.value}</strong>
                    <small>{stat.sub}</small>
                  </div>
                </article>
              ))}
            </section>

            <section className="quiz-active-card">
              <div className="quiz-active-topline">
                <span>Active Quiz</span>
                <strong>Question 2 of 5</strong>
              </div>
              <h2>Contracts Quiz</h2>
              <p>What is the fundamental element in contract law that requires something of value exchanged between parties?</p>
              <div className="quiz-active-options">
                {quizOptions.map(([label, selected]) => (
                  <label className={selected ? "selected" : ""} key={label}>
                    <span />
                    <b>{label}</b>
                    {selected && <QuizIcon name="check-circle" />}
                  </label>
                ))}
              </div>
              <div className="quiz-correct-row">
                <QuizIcon name="check-circle" />
                <span>Correct! Consideration is the value exchanged between parties that makes a promise enforceable.</span>
              </div>
              <div className="quiz-active-actions">
                <button type="button">End Quiz</button>
                <button type="button">
                  Next Question
                  <QuizIcon name="arrow-right" />
                </button>
              </div>
            </section>

            <section className="quiz-history-card">
              <div className="quiz-section-heading">
                <h2>Recent Quiz History</h2>
                <Link href="/quizzes">
                  View All History
                  <QuizIcon name="arrow-right" />
                </Link>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Quiz</th>
                    <th>Score</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(([quiz, score, date, category, status]) => (
                    <tr key={quiz}>
                      <td>
                        <QuizIcon name="document-row" />
                        {quiz}
                      </td>
                      <td>{score}</td>
                      <td>{date}</td>
                      <td>{category}</td>
                      <td>
                        <span className={status.toLowerCase()}>{status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="quiz-practice-card">
              <h2>Recommended Practice</h2>
              <p>Focus on areas to improve your mastery.</p>
              <div className="quiz-practice-grid">
                {practice.map((item) => (
                  <article className={item.tone} key={item.name}>
                    <span>
                      <QuizIcon name={item.icon} />
                    </span>
                    <div>
                      <h3>{item.name}</h3>
                      <small>{item.tag}</small>
                      <p>Accuracy: {item.accuracy}</p>
                      <i>
                        <b style={{ width: `${item.progress}%` }} />
                      </i>
                      <button type="button">
                        Practice Now
                        <QuizIcon name="arrow-right" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <aside className="quiz-ref-right-rail">
            <section className="quiz-overall-card">
              <h2>Overall Mastery</h2>
              <div className="quiz-overall-body">
                <div className="quiz-mastery-ring">
                  <strong>72%</strong>
                  <span>Mastery</span>
                </div>
                <ul>
                  <li><i /> <strong>72%</strong> Mastered</li>
                  <li><i /> <strong>18%</strong> Learning</li>
                  <li><i /> <strong>10%</strong> New</li>
                </ul>
              </div>
              <p>Great progress! Keep practicing to strengthen your understanding.</p>
            </section>

            <section className="quiz-snapshot-card">
              <h2>Mastery Snapshot</h2>
              <div>
                <span><b>New</b><strong>24</strong><small>10%</small></span>
                <span><b>Learning</b><strong>45</strong><small>18%</small></span>
                <span><b>Mastered</b><strong>171</strong><small>72%</small></span>
              </div>
            </section>

            <section className="quiz-achievements-card">
              <div className="quiz-section-heading">
                <h2>Recent Achievements</h2>
                <Link href="/progress">
                  View All
                  <QuizIcon name="arrow-right" />
                </Link>
              </div>
              <div className="quiz-achievement-list">
                {achievements.map((item) => (
                  <article className={item.tone} key={item.title}>
                    <span>
                      <QuizIcon name={item.icon} />
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.body}</p>
                    </div>
                    <small>{item.time}</small>
                  </article>
                ))}
              </div>
            </section>

            <section className="quiz-accuracy-card">
              <div className="quiz-section-heading">
                <h2>Category Accuracy</h2>
                <Link href="/progress">
                  View Full Report
                  <QuizIcon name="arrow-right" />
                </Link>
              </div>
              <div className="quiz-accuracy-list">
                {categoryAccuracy.map(([name, icon, value, tone]) => (
                  <article className={tone} key={name}>
                    <span>
                      <QuizIcon name={icon} />
                      <strong>{name}</strong>
                    </span>
                    <i>
                      <b style={{ width: value }} />
                    </i>
                    <em>{value}</em>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
