import Link from "next/link";

type ProgressIconName =
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
  | "stat-book"
  | "stat-graduation"
  | "stat-target"
  | "stat-clock"
  | "flame-streak"
  | "calendar"
  | "check-circle"
  | "activity-book"
  | "activity-quiz"
  | "achievement-award"
  | "achievement-shield"
  | "achievement-trophy"
  | "courthouse"
  | "people-group";

function ProgressIcon({ name, className = "" }: { name: ProgressIconName; className?: string }) {
  return <img className={`progress-ref-icon ${className}`.trim()} src={`/progress-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

const navMain: ReadonlyArray<readonly [string, ProgressIconName, string, boolean]> = [
  ["Home", "nav-home", "/", false],
  ["Terms Library", "nav-book", "/terms", false],
  ["Categories", "nav-categories", "/categories", false],
  ["Progress", "nav-progress", "/progress", true],
  ["Quizzes", "nav-quiz", "/quizzes", false],
  ["My Library", "nav-library", "/terms", false],
];

const navAccount: ReadonlyArray<readonly [string, ProgressIconName, string]> = [
  ["Account", "nav-user", "/account"],
  ["Billing", "nav-billing-card", "/billing"],
  ["Help & Support", "nav-help-globe", "/account/help"],
];

const stats = [
  { label: "Terms Studied", value: "82", change: "18% vs last month", icon: "stat-book" as const, tone: "green" },
  { label: "Terms Mastered", value: "56", change: "22% vs last month", icon: "stat-graduation" as const, tone: "purple" },
  { label: "Quizzes Completed", value: "24", change: "14% vs last month", icon: "stat-target" as const, tone: "gold" },
  { label: "Time Spent", value: "18h 35m", change: "25% vs last month", icon: "stat-clock" as const, tone: "blue" },
] as const;

const categories = [
  { name: "Contracts", icon: "activity-book" as const, width: 80, count: "28 / 35", percent: "80%", tone: "blue" },
  { name: "Corporate Law", icon: "courthouse" as const, width: 73, count: "22 / 30", percent: "73%", tone: "green" },
  { name: "Employment Law", icon: "people-group" as const, width: 72, count: "18 / 25", percent: "72%", tone: "purple" },
  { name: "Intellectual Property", icon: "achievement-award" as const, width: 60, count: "12 / 20", percent: "60%", tone: "orange" },
] as const;

const recentActivity = [
  { title: 'Mastered "Indemnity"', time: "Today, 10:24 AM", icon: "stat-book" as const, tone: "green" },
  { title: "Completed quiz: Contracts", time: "Yesterday, 4:15 PM", icon: "activity-quiz" as const, tone: "purple" },
  { title: "Studied 8 new terms", time: "May 30, 8:30 AM", icon: "activity-book" as const, tone: "orange" },
  { title: 'Mastered "Liquidated Damages"', time: "May 29, 11:10 AM", icon: "achievement-shield" as const, tone: "blue" },
] as const;

const achievements = [
  { title: "First Steps", body: "Study 10 terms", tag: "Completed", icon: "achievement-shield" as const, tone: "green" },
  { title: "Quiz Master", body: "Complete 10 quizzes", tag: "Completed", icon: "achievement-trophy" as const, tone: "purple" },
  { title: "Consistent Learner", body: "Maintain a 7-day streak", tag: "12 / 7", icon: "achievement-award" as const, tone: "orange" },
] as const;

function ActivityChart() {
  return (
    <svg className="progress-activity-chart" viewBox="0 0 662 222" role="img" aria-label="Learning activity chart">
      <defs>
        <linearGradient id="termsArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2e7de6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2e7de6" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="quizArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#19a875" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#19a875" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[20, 58, 96, 134, 172].map((y, index) => (
        <g key={y}>
          <line x1="42" x2="636" y1={y} y2={y} />
          <text x="14" y={y + 4}>{100 - index * 20}</text>
        </g>
      ))}
      <text x="20" y="210">0</text>
      <path d="M56 168 C96 150 128 136 176 126 C235 115 280 96 332 84 C390 70 440 58 496 50 C548 42 592 33 636 24 L636 190 L56 190 Z" fill="url(#termsArea)" />
      <path d="M56 184 C112 174 148 162 176 160 C238 154 284 146 332 137 C390 128 442 120 496 109 C548 98 596 86 636 80 L636 190 L56 190 Z" fill="url(#quizArea)" />
      <path d="M56 168 C96 150 128 136 176 126 C235 115 280 96 332 84 C390 70 440 58 496 50 C548 42 592 33 636 24" className="terms-line" />
      <path d="M56 184 C112 174 148 162 176 160 C238 154 284 146 332 137 C390 128 442 120 496 109 C548 98 596 86 636 80" className="quiz-line" />
      {[
        [56, 168],
        [176, 126],
        [332, 84],
        [454, 56],
        [520, 45],
        [636, 24],
      ].map(([x, y]) => (
        <circle className="terms-dot" cx={x} cy={y} key={`${x}-${y}`} r="4" />
      ))}
      {[
        [56, 184],
        [176, 160],
        [332, 137],
        [454, 119],
        [520, 106],
        [636, 80],
      ].map(([x, y]) => (
        <circle className="quiz-dot" cx={x} cy={y} key={`${x}-${y}`} r="4" />
      ))}
      {["Apr 28", "May 5", "May 12", "May 19", "May 26", "Jun 2"].map((label, index) => (
        <text className="date-label" x={56 + index * 116} y="214" key={label}>{label}</text>
      ))}
    </svg>
  );
}

export default function ProgressPage() {
  return (
    <main className="progress-reference-page">
      <aside className="progress-ref-sidebar">
        <div>
          <Link className="progress-ref-brand" href="/">
            <ProgressIcon name="logo-shield" />
            <span>
              <strong>LEGAL ENGLISH 5</strong>
              <small>MPC LAW STUDIO</small>
            </span>
          </Link>

          <nav className="progress-ref-nav" aria-label="Main navigation">
            {navMain.map(([label, icon, href, active]) => (
              <Link className={active ? "active" : ""} href={href} key={label}>
                <ProgressIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="progress-ref-sidebar-bottom">
          <nav className="progress-ref-nav account" aria-label="Account navigation">
            {navAccount.map(([label, icon, href]) => (
              <Link href={href} key={label}>
                <ProgressIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
            <button type="button">
              <ProgressIcon name="nav-signout" />
              <span>Sign Out</span>
            </button>
          </nav>

          <section className="progress-upgrade-card" aria-label="Upgrade to Premium">
            <span>
              <ProgressIcon name="crown" />
            </span>
            <strong>Upgrade to Premium</strong>
            <p>Unlock advanced quizzes, in-depth explanations, and personalized learning.</p>
            <Link href="/billing">Upgrade Now</Link>
          </section>
        </div>
      </aside>

      <section className="progress-ref-workspace">
        <header className="progress-ref-topbar">
          <label className="progress-ref-search">
            <input placeholder="Search terms, categories, or content..." aria-label="Search terms, categories, or content" />
            <ProgressIcon name="search" />
          </label>
          <div className="progress-ref-user-tools">
            <button className="progress-ref-notification" type="button" aria-label="Notifications">
              <ProgressIcon name="bell" />
              <span>3</span>
            </button>
            <Link className="progress-ref-user-pill" href="/account">
              <img src="/progress-assets/people/alex-johnson.png" alt="" />
              <span>
                <strong>Alex Johnson</strong>
                <small>Learner</small>
              </span>
              <ProgressIcon name="chevron-down" />
            </Link>
          </div>
        </header>

        <div className="progress-ref-content">
          <section className="progress-ref-main">
            <div className="progress-ref-heading">
              <div>
                <h1>My Progress</h1>
                <p>Track your learning journey and see how you&apos;re improving.</p>
              </div>
              <div className="progress-date-controls">
                <button type="button">
                  This Month
                  <ProgressIcon name="chevron-down" />
                </button>
                <button type="button" aria-label="Open calendar">
                  <ProgressIcon name="calendar" />
                </button>
              </div>
            </div>

            <section className="progress-ref-stats" aria-label="Progress statistics">
              {stats.map((stat) => (
                <article className={stat.tone} key={stat.label}>
                  <span>
                    <ProgressIcon name={stat.icon} />
                  </span>
                  <div>
                    <p>{stat.label}</p>
                    <strong>{stat.value}</strong>
                    <small>↑ {stat.change}</small>
                  </div>
                </article>
              ))}
            </section>

            <section className="progress-panel progress-chart-panel">
              <div className="progress-section-top">
                <h2>Learning Activity</h2>
                <button type="button">
                  Weekly
                  <ProgressIcon name="chevron-down" />
                </button>
              </div>
              <div className="progress-chart-legend">
                <span><i className="blue" />Terms Studied</span>
                <span><i className="green" />Quizzes Completed</span>
              </div>
              <ActivityChart />
            </section>

            <section className="progress-panel progress-category-panel">
              <div className="progress-section-top">
                <h2>Progress by Category</h2>
                <Link href="/terms">View all categories</Link>
              </div>
              <div className="progress-category-list">
                {categories.map((category) => (
                  <article className={category.tone} key={category.name}>
                    <span>
                      <ProgressIcon name={category.icon} />
                    </span>
                    <strong>{category.name}</strong>
                    <div>
                      <i style={{ width: `${category.width}%` }} />
                    </div>
                    <small>{category.count}</small>
                    <b>{category.percent}</b>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <aside className="progress-ref-rail">
            <section className="progress-panel progress-streak-card">
              <h2>Current Streak</h2>
              <div className="progress-streak-main">
                <span>
                  <ProgressIcon name="flame-streak" />
                </span>
                <div>
                  <strong>12 <small>days</small></strong>
                  <p>Great job! Keep it up!</p>
                </div>
              </div>
              <div className="progress-week-row">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                  <span className={index < 6 ? "done" : ""} key={`${day}-${index}`}>
                    <b>{day}</b>
                    <i>{index < 6 ? "✓" : ""}</i>
                  </span>
                ))}
              </div>
              <p className="progress-longest">Longest streak: 21 days</p>
            </section>

            <section className="progress-panel progress-recent-card">
              <div className="progress-section-top">
                <h2>Recent Activity</h2>
                <Link href="/review">View all</Link>
              </div>
              <div className="progress-activity-list">
                {recentActivity.map((item) => (
                  <Link className={item.tone} href="/terms" key={item.title}>
                    <span>
                      <ProgressIcon name={item.icon} />
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.time}</small>
                    </div>
                    <b>&rsaquo;</b>
                  </Link>
                ))}
              </div>
            </section>

            <section className="progress-panel progress-achievement-card">
              <div className="progress-section-top">
                <h2>Achievements</h2>
                <Link href="/account/achievements">View all</Link>
              </div>
              <div className="progress-achievement-list">
                {achievements.map((achievement) => (
                  <article className={achievement.tone} key={achievement.title}>
                    <span>
                      <ProgressIcon name={achievement.icon} />
                    </span>
                    <div>
                      <strong>{achievement.title}</strong>
                      <small>{achievement.body}</small>
                    </div>
                    <b>{achievement.tag}</b>
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
