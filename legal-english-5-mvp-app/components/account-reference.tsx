import Link from "next/link";

type AccountIconName =
  | "activity-book"
  | "activity-gear"
  | "activity-quiz"
  | "activity-study"
  | "bell"
  | "calendar"
  | "camera"
  | "check-circle"
  | "chevron-down"
  | "chevron-right"
  | "crown"
  | "edit-pencil"
  | "help-circle"
  | "language-globe"
  | "location-pin"
  | "lock-password"
  | "logo-shield"
  | "mail-envelope"
  | "nav-billing-card"
  | "nav-book"
  | "nav-categories"
  | "nav-help-globe"
  | "nav-home"
  | "nav-library"
  | "nav-progress"
  | "nav-quiz"
  | "nav-signout"
  | "nav-user"
  | "plus"
  | "premium-badge"
  | "search"
  | "settings-gear"
  | "subscription-card"
  | "trash-delete"
  | "trend-chart";

function AccountIcon({ name, className = "" }: { name: AccountIconName; className?: string }) {
  return <img className={`account-ref-icon ${className}`.trim()} src={`/account-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

const navMain: ReadonlyArray<readonly [string, AccountIconName, string, boolean]> = [
  ["Home", "nav-home", "/", false],
  ["Terms Library", "nav-book", "/terms", false],
  ["Categories", "nav-categories", "/categories", false],
  ["Quizzes", "nav-quiz", "/quizzes", false],
  ["Progress", "nav-progress", "/progress", false],
  ["My Library", "nav-library", "/terms", false],
];

const navAccount: ReadonlyArray<readonly [string, AccountIconName, string, boolean]> = [
  ["Account", "nav-user", "/account", true],
  ["Billing", "nav-billing-card", "/billing", false],
  ["Help & Support", "nav-help-globe", "/account/help", false],
  ["Settings", "settings-gear", "/account/settings", false],
];

const tabs = ["Profile", "Preferences", "Security", "Notifications"] as const;

const profileFields = [
  ["Full Name", "Alex Johnson"],
  ["Username", "alexjohnson"],
  ["Email Address", "alex.johnson@example.com"],
  ["Location", "San Francisco, CA, USA"],
  ["Phone Number (Optional)", "+1 (415) 555-0198"],
  ["Timezone", "(GMT-07:00) Pacific Time (US & Canada)"],
] as const;

const settingsRows: ReadonlyArray<readonly [string, string, AccountIconName, string, "blue" | "green" | "red"]> = [
  ["Change Password", "Update your password to keep your account secure.", "lock-password", "Change Password", "blue"],
  ["Email Address", "Update your email address.", "mail-envelope", "Change Email", "green"],
  ["Delete Account", "Permanently delete your account and all data.", "trash-delete", "Delete Account", "red"],
];

const activities: ReadonlyArray<readonly [string, string, AccountIconName, "purple" | "green" | "orange" | "blue"]> = [
  ["Completed quiz: Contracts", "Today, 10:24 AM", "activity-quiz", "purple"],
  ["Mastered \"Indemnity\"", "Yesterday, 4:15 PM", "activity-book", "green"],
  ["Studied 8 new terms", "May 30, 8:30 AM", "activity-study", "orange"],
  ["Updated account information", "May 28, 11:05 AM", "activity-gear", "blue"],
];

export function AccountReference() {
  return (
    <main className="account-reference-page">
      <aside className="account-ref-sidebar">
        <div>
          <Link className="account-ref-brand" href="/">
            <AccountIcon name="logo-shield" />
            <span>
              <strong>LEGAL ENGLISH 5</strong>
              <small>MPC LAW STUDIO</small>
            </span>
          </Link>

          <nav className="account-ref-nav" aria-label="Main navigation">
            {navMain.map(([label, icon, href, active]) => (
              <Link className={active ? "active" : ""} href={href} key={label}>
                <AccountIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="account-ref-sidebar-bottom">
          <nav className="account-ref-nav account" aria-label="Account navigation">
            {navAccount.map(([label, icon, href, active]) => (
              <Link className={active ? "active" : ""} href={href} key={label}>
                <AccountIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
            <button type="button">
              <AccountIcon name="nav-signout" />
              <span>Sign Out</span>
            </button>
          </nav>

          <section className="account-ref-upgrade-card" aria-label="Upgrade to Premium">
            <span>
              <AccountIcon name="crown" />
            </span>
            <strong>Upgrade to Premium</strong>
            <p>Unlock unlimited access to all terms, quizzes, and advanced learning features.</p>
            <Link href="/billing">Upgrade Now</Link>
          </section>
        </div>
      </aside>

      <section className="account-ref-workspace">
        <header className="account-ref-topbar">
          <label className="account-ref-search">
            <input placeholder="Search terms, categories, or content..." aria-label="Search terms, categories, or content" />
            <AccountIcon name="search" />
          </label>
          <div className="account-ref-header-tools">
            <button type="button">
              <AccountIcon name="language-globe" />
              <span>English</span>
              <AccountIcon name="chevron-down" />
            </button>
            <Link href="/account/help">
              <AccountIcon name="help-circle" />
              <span>Need help?</span>
            </Link>
            <button className="account-ref-bell" type="button" aria-label="Notifications">
              <AccountIcon name="bell" />
              <b>6</b>
            </button>
            <Link className="account-ref-user-pill" href="/account">
              <img src="/account-assets/people/alex-johnson.png" alt="" />
              <span>
                <strong>Alex Johnson</strong>
                <small>Learner</small>
              </span>
              <AccountIcon name="chevron-down" />
            </Link>
          </div>
        </header>

        <div className="account-ref-content">
          <section className="account-ref-main-column">
            <div className="account-ref-heading">
              <h1>Account</h1>
              <p>Manage your profile, preferences, and account settings.</p>
            </div>

            <div className="account-ref-tabs" role="tablist" aria-label="Account sections">
              {tabs.map((tab, index) => (
                <button className={index === 0 ? "active" : ""} type="button" role="tab" aria-selected={index === 0} key={tab}>
                  {tab}
                </button>
              ))}
            </div>

            <section className="account-ref-profile-card">
              <div className="account-ref-card-heading">
                <h2>Profile Information</h2>
                <button type="button">
                  <AccountIcon name="edit-pencil" />
                  Edit Profile
                </button>
              </div>

              <div className="account-ref-profile-intro">
                <div className="account-ref-avatar-wrap">
                  <img src="/account-assets/people/alex-johnson.png" alt="" />
                  <button type="button" aria-label="Update profile photo">
                    <AccountIcon name="camera" />
                  </button>
                </div>
                <div>
                  <div className="account-ref-name-line">
                    <h3>Alex Johnson</h3>
                    <span>Learner</span>
                  </div>
                  <p>alex.johnson@example.com</p>
                  <div className="account-ref-profile-meta">
                    <span><AccountIcon name="location-pin" />San Francisco, CA, USA</span>
                    <span><AccountIcon name="calendar" />Joined April 28, 2024</span>
                  </div>
                </div>
              </div>

              <form className="account-ref-form">
                {profileFields.map(([label, value], index) => (
                  <label key={label}>
                    <span>{label}</span>
                    <div>
                      <input readOnly value={value} />
                      {(index === 3 || index === 5) && <AccountIcon name="chevron-down" />}
                    </div>
                  </label>
                ))}
              </form>
            </section>

            <section className="account-ref-settings-card">
              <h2>Account Settings</h2>
              <div className="account-ref-settings-list">
                {settingsRows.map(([title, text, icon, action, tone]) => (
                  <div className="account-ref-setting-row" key={title}>
                    <span className={tone}>
                      <AccountIcon name={icon} />
                    </span>
                    <div>
                      <strong>{title}</strong>
                      <p>{text}</p>
                    </div>
                    <button className={tone === "red" ? "danger" : ""} type="button">
                      {action}
                      <AccountIcon name="chevron-right" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <aside className="account-ref-right-rail">
            <section className="account-ref-panel account-ref-progress-card">
              <h2>Your Progress</h2>
              <div className="account-ref-progress-body">
                <div className="account-ref-ring">
                  <strong>90%</strong>
                  <span>Mastered</span>
                </div>
                <dl>
                  <div><dt>Terms Studied</dt><dd>82</dd></div>
                  <div><dt>Terms Mastered</dt><dd>56</dd></div>
                  <div><dt>Quizzes Completed</dt><dd>24</dd></div>
                  <div><dt>Avg. Score</dt><dd>78%</dd></div>
                </dl>
              </div>
              <Link href="/progress">
                <AccountIcon name="trend-chart" />
                View Full Progress
              </Link>
            </section>

            <section className="account-ref-panel account-ref-subscription-card">
              <div className="account-ref-rail-heading">
                <h2>Subscription</h2>
                <span>Premium</span>
              </div>
              <div className="account-ref-plan-row">
                <span><AccountIcon name="premium-badge" /></span>
                <div>
                  <strong>Premium Plan</strong>
                  <small>Billed monthly</small>
                </div>
              </div>
              <dl>
                <div><dt>Next billing date</dt><dd>June 28, 2024</dd></div>
                <div><dt>Amount</dt><dd>$9.99 / month</dd></div>
              </dl>
              <Link href="/billing">
                <AccountIcon name="settings-gear" />
                Manage Subscription
              </Link>
            </section>

            <section className="account-ref-panel account-ref-activity-card">
              <div className="account-ref-rail-heading">
                <h2>Recent Activity</h2>
                <Link href="/progress">View all</Link>
              </div>
              <div className="account-ref-activity-list">
                {activities.map(([title, time, icon, tone]) => (
                  <Link href="/progress" key={title}>
                    <span className={tone}><AccountIcon name={icon} /></span>
                    <div>
                      <strong>{title}</strong>
                      <small>{time}</small>
                    </div>
                    <AccountIcon name="chevron-right" />
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
