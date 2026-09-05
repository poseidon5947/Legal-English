"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { LearnerShell, initialsOf } from "@/components/learner-shell";
import { useLocale } from "@/components/locale-provider";
import { Photo } from "@/components/photo";
import { categoryLabel, entitlementLabel, subscriptionStatusLabel } from "@/lib/i18n";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";
import { countsFor, formatDate, formatWhen, recentActivity, studyTerms } from "@/lib/learner-stats";

type AccountIcon =
  | "edit-pencil"
  | "calendar"
  | "mail-envelope"
  | "lock-password"
  | "trash-delete"
  | "trend-chart"
  | "premium-badge"
  | "settings-gear"
  | "chevron-right"
  | "activity-quiz"
  | "activity-book"
  | "activity-study"
  | "activity-gear"
  | "security-shield"
  | "check-circle";

function AccountIcon({ name, className = "" }: { name: AccountIcon; className?: string }) {
  return <img className={`account-ref-icon ${className}`.trim()} src={`/account-assets/icons/${name}.png`} alt="" aria-hidden="true" />;
}

const ACTIVITY_ICON = { mastered: "activity-book", attempted: "activity-quiz", studied: "activity-study", saved: "activity-gear" } as const;
const ACTIVITY_TONE = { mastered: "green", attempted: "purple", studied: "orange", saved: "blue" } as const;
const ACTIVITY_KEY: Record<string, LearnerKey> = { mastered: "mastered", attempted: "attempted", studied: "studied", saved: "savedTerm" };

export function AccountWorkspace() {
  const { session, terms, progress, progressRows, entitlement, updateProfile, changePassword, deactivateAccount, deleteAccount } = useApp();
  const { locale, t } = useLocale();
  const router = useRouter();
  const L = (key: LearnerKey, vars?: Record<string, string | number>) => learnerText(locale, key, vars);
  const visible = useMemo(() => studyTerms(terms, session), [terms, session]);
  const counts = countsFor(visible, progress);
  const activity = recentActivity(visible, progressRows, 4);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(session?.user.name || "");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [dangerMessage, setDangerMessage] = useState("");
  // The session arrives after the first render; keep the field in sync until the user edits it.
  useEffect(() => {
    if (!editing && session) setName(session.user.name);
  }, [session, editing]);

  if (!session) return <LearnerShell pageClass="account-reference-page">{null}</LearnerShell>;
  const user = session.user;
  const subscription = session.subscription;
  const isOwner = user.role === "admin";
  const planKey: LearnerKey = subscription.plan === "monthly" ? "planMonthly" : subscription.plan === "annual" ? "planAnnual" : subscription.status === "trialing" ? "planTrial" : "planNone";
  const tabs: ReadonlyArray<readonly [LearnerKey, string]> = [
    ["tabProfile", "/account"],
    ["tabPreferences", "/account/settings#preferences"],
    ["tabSecurity", "/account/settings#security"],
    ["tabNotifications", "/account/settings#notifications"],
  ];

  function saveProfile(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    void updateProfile(trimmed).then((result) => {
      setProfileMessage(result.ok ? L("profileSaved") : result.message || t("couldNotContinue"));
      if (result.ok) setEditing(false);
    });
  }

  function savePassword(event: FormEvent) {
    event.preventDefault();
    void changePassword(currentPassword, nextPassword).then((result) => {
      setPasswordMessage(result.ok ? L("passwordChanged") : result.message || t("couldNotContinue"));
      if (result.ok) {
        setCurrentPassword("");
        setNextPassword("");
        setPasswordOpen(false);
      }
    });
  }

  return (
    <LearnerShell pageClass="account-reference-page">
      <div className="account-ref-content">
        <section className="account-ref-main-column">
          <div className="account-ref-heading">
            <h1>{L("accountTitle")}</h1>
            <p>{L("accountLead")}</p>
          </div>

          <div className="account-ref-tabs" role="tablist" aria-label="Account sections">
            {tabs.map(([key, href], index) => (
              <Link className={index === 0 ? "active" : ""} role="tab" aria-selected={index === 0} href={href} key={key}>
                {L(key)}
              </Link>
            ))}
          </div>

          <section className="account-ref-profile-card">
            <div className="account-ref-cover" aria-hidden="true">
              <Photo src="/home-assets/photos/account-cover.jpg" size="wide" priority />
            </div>
            <div className="account-ref-card-heading">
              <h2>{L("profileInfo")}</h2>
              {editing ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setName(user.name);
                  }}
                >
                  {L("cancel")}
                </button>
              ) : (
                <button type="button" onClick={() => setEditing(true)}>
                  <AccountIcon name="edit-pencil" />
                  {L("editProfile")}
                </button>
              )}
            </div>

            <div className="account-ref-profile-intro">
              <div className="account-ref-avatar-wrap">
                <i className="learner-avatar large" aria-hidden="true">
                  {initialsOf(user.name)}
                </i>
              </div>
              <div>
                <div className="account-ref-name-line">
                  <h3>{user.name}</h3>
                  <span>{isOwner ? L("owner") : L("learner")}</span>
                </div>
                <p>{user.email}</p>
                <div className="account-ref-profile-meta">
                  <span>
                    <AccountIcon name="calendar" />
                    {L("joined", { date: formatDate(user.createdAt, locale) })}
                  </span>
                  <span>
                    <AccountIcon name={user.emailVerified ? "check-circle" : "mail-envelope"} />
                    {user.emailVerified ? L("verified") : L("unverified")}
                  </span>
                </div>
              </div>
            </div>

            <form className="account-ref-form" onSubmit={saveProfile}>
              <label>
                <span>{L("fullName")}</span>
                <div>
                  <input value={name} readOnly={!editing} minLength={2} required onChange={(event) => setName(event.target.value)} />
                </div>
              </label>
              <label>
                <span>{L("email")}</span>
                <div>
                  <input readOnly value={user.email} />
                </div>
              </label>
              <label>
                <span>{L("role")}</span>
                <div>
                  <input readOnly value={isOwner ? L("owner") : L("learner")} />
                </div>
              </label>
              <label>
                <span>{L("memberSince")}</span>
                <div>
                  <input readOnly value={formatDate(user.createdAt, locale)} />
                </div>
              </label>
              <label>
                <span>{L("emailStatus")}</span>
                <div>
                  <input readOnly value={user.emailVerified ? L("verified") : L("unverified")} />
                </div>
              </label>
              <label>
                <span>{L("language")}</span>
                <div>
                  <input readOnly value={locale === "es" ? "Español" : "English"} />
                </div>
              </label>
              {editing && (
                <div className="account-ref-form-actions">
                  <button type="submit" className="primary inline">
                    {L("saveProfile")}
                  </button>
                </div>
              )}
              {profileMessage && <p className="account-ref-message">{profileMessage}</p>}
            </form>
          </section>

          <section className="account-ref-settings-card" id="security">
            <h2>{L("accountSettings")}</h2>
            <div className="account-ref-settings-list">
              <div className="account-ref-setting-row">
                <span className="blue">
                  <AccountIcon name="lock-password" />
                </span>
                <div>
                  <strong>{L("changePassword")}</strong>
                  <p>{L("changePasswordBody")}</p>
                  {passwordOpen && (
                    <form className="account-ref-inline-form" onSubmit={savePassword}>
                      <input
                        type="password"
                        autoComplete="current-password"
                        placeholder={L("currentPassword")}
                        value={currentPassword}
                        required
                        onChange={(event) => setCurrentPassword(event.target.value)}
                      />
                      <input
                        type="password"
                        autoComplete="new-password"
                        placeholder={L("newPassword")}
                        value={nextPassword}
                        minLength={8}
                        required
                        onChange={(event) => setNextPassword(event.target.value)}
                      />
                      <button type="submit" className="primary inline">
                        {L("saveProfile")}
                      </button>
                    </form>
                  )}
                  {passwordMessage && <p className="account-ref-message">{passwordMessage}</p>}
                </div>
                <button type="button" onClick={() => setPasswordOpen((open) => !open)}>
                  {passwordOpen ? L("cancel") : L("changePassword")}
                  <AccountIcon name="chevron-right" />
                </button>
              </div>

              <div className="account-ref-setting-row">
                <span className="green">
                  <AccountIcon name="security-shield" />
                </span>
                <div>
                  <strong>{L("deactivate")}</strong>
                  <p>{L("deactivateBody")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void deactivateAccount().then((result) => {
                      if (!result.ok) setDangerMessage(result.message || t("couldNotContinue"));
                    });
                  }}
                >
                  {L("deactivateAction")}
                  <AccountIcon name="chevron-right" />
                </button>
              </div>

              <div className="account-ref-setting-row">
                <span className="red">
                  <AccountIcon name="trash-delete" />
                </span>
                <div>
                  <strong>{L("deleteAccount")}</strong>
                  <p>{L("deleteBody")}</p>
                  {dangerMessage && <p className="account-ref-message">{dangerMessage}</p>}
                </div>
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    if (!window.confirm(L("deleteConfirm"))) return;
                    void deleteAccount().then((result) => {
                      if (result.ok) router.push("/login");
                      else setDangerMessage(result.message || t("couldNotContinue"));
                    });
                  }}
                >
                  {L("deleteAction")}
                  <AccountIcon name="chevron-right" />
                </button>
              </div>
            </div>
          </section>
        </section>

        <aside className="account-ref-right-rail">
          <section className="account-ref-panel account-ref-progress-card">
            <h2>{L("yourProgress")}</h2>
            <div className="account-ref-progress-body">
              <div className="account-ref-ring" style={{ background: `conic-gradient(var(--account-blue) 0 ${counts.masteryPct}%, #e8eef7 ${counts.masteryPct}% 100%)` }}>
                <strong>{counts.masteryPct}%</strong>
                <span>{L("stateMastered")}</span>
              </div>
              <dl>
                <div>
                  <dt>{L("termsStudied")}</dt>
                  <dd>{counts.studied}</dd>
                </div>
                <div>
                  <dt>{L("termsMastered")}</dt>
                  <dd>{counts.mastered}</dd>
                </div>
                <div>
                  <dt>{L("quizzesCompleted")}</dt>
                  <dd>{counts.attempts}</dd>
                </div>
                <div>
                  <dt>{L("quizAccuracy")}</dt>
                  <dd>{counts.accuracyPct}%</dd>
                </div>
              </dl>
            </div>
            <Link href="/progress">
              <AccountIcon name="trend-chart" />
              {L("viewFullProgress")}
            </Link>
          </section>

          <section className="account-ref-panel account-ref-subscription-card">
            <div className="account-ref-rail-heading">
              <h2>{L("subscription")}</h2>
              <span className={entitlement.allowed ? "" : "blocked"}>{subscriptionStatusLabel(locale, subscription.status)}</span>
            </div>
            <div className="account-ref-plan-row">
              <span>
                <AccountIcon name="premium-badge" />
              </span>
              <div>
                <strong>{L(planKey)}</strong>
                <small>{entitlementLabel(locale, entitlement.label)}</small>
              </div>
            </div>
            <dl>
              {subscription.status === "trialing" && (
                <div>
                  <dt>{L("trialEnds")}</dt>
                  <dd>{formatDate(subscription.trialEndsAt, locale)}</dd>
                </div>
              )}
              {subscription.currentPeriodEnd && (
                <div>
                  <dt>{L("periodEnd")}</dt>
                  <dd>{formatDate(subscription.currentPeriodEnd, locale)}</dd>
                </div>
              )}
              {subscription.accessUntil && (
                <div>
                  <dt>{L("accessUntil")}</dt>
                  <dd>{formatDate(subscription.accessUntil, locale)}</dd>
                </div>
              )}
            </dl>
            <Link href="/billing">
              <AccountIcon name="settings-gear" />
              {L("manageSubscription")}
            </Link>
          </section>

          <section className="account-ref-panel account-ref-activity-card">
            <div className="account-ref-rail-heading">
              <h2>{L("recentActivity")}</h2>
              <Link href="/progress">{L("viewAll")}</Link>
            </div>
            <div className="account-ref-activity-list">
              {activity.length === 0 && <p className="account-ref-message">{L("noActivity")}</p>}
              {activity.map((item) => (
                <Link href={`/terms/${item.term.id}`} key={`${item.term.id}-${item.at}`}>
                  <span className={ACTIVITY_TONE[item.kind]}>
                    <AccountIcon name={ACTIVITY_ICON[item.kind]} />
                  </span>
                  <div>
                    <strong>{L(ACTIVITY_KEY[item.kind], { term: item.term.term })}</strong>
                    <small>
                      {formatWhen(item.at, locale, { today: L("today"), yesterday: L("yesterday") })} · {categoryLabel(locale, item.term.category)}
                    </small>
                  </div>
                  <AccountIcon name="chevron-right" />
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </LearnerShell>
  );
}
