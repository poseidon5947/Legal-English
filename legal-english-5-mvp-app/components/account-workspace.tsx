"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { AvatarPicker } from "@/components/avatar-picker";
import { LearnerShell } from "@/components/learner-shell";
import { useLocale } from "@/components/locale-provider";
import { Photo } from "@/components/photo";
import { categoryLabel, entitlementLabel, subscriptionStatusLabel, type Locale } from "@/lib/i18n";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";
import { normalizePreferences, type Preferences } from "@/lib/preferences";
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

export type AccountTab = "profile" | "preferences" | "security" | "notifications";
const TABS: ReadonlyArray<AccountTab> = ["profile", "preferences", "security", "notifications"];
const TAB_LABEL: Record<AccountTab, LearnerKey> = { profile: "tabProfile", preferences: "tabPreferences", security: "tabSecurity", notifications: "tabNotifications" };
export function accountTabHref(tab: AccountTab) {
  return tab === "profile" ? "/account" : `/account/settings?tab=${tab}`;
}

type PrivacyPrefs = Pick<Preferences, "visibility" | "dataUsage" | "dataSharing">;
type NotifPrefs = Pick<Preferences, "reminders" | "progressSummary">;

function Switch({ on, onChange, label, disabled }: { on: boolean; onChange?: (next: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`account-ref-switch ${on ? "on" : ""}`}
      disabled={disabled}
      onClick={() => onChange?.(!on)}
    >
      <span />
    </button>
  );
}

export function AccountWorkspace({ tab: defaultTab = "profile" }: { tab?: AccountTab }) {
  const { session, terms, progress, progressRows, studyDays, entitlement, updateProfile, updatePreferences, changePassword, deactivateAccount, deleteAccount } = useApp();
  const { locale, setLocale, t } = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("tab");
  const active: AccountTab = TABS.includes(requested as AccountTab) ? (requested as AccountTab) : defaultTab;
  const L = (key: LearnerKey, vars?: Record<string, string | number>) => learnerText(locale, key, vars);

  // Preferences live on the account (server), so they follow the learner
  // across browsers and devices; the provider applies changes optimistically.
  const prefs = normalizePreferences(session?.user.preferences);
  const privacy: PrivacyPrefs = prefs;
  const notif: NotifPrefs = prefs;
  const notices = prefs.inboxNotices;
  const [prefsMessage, setPrefsMessage] = useState("");
  useEffect(() => {
    if (!prefsMessage) return;
    const timer = window.setTimeout(() => setPrefsMessage(""), 2200);
    return () => window.clearTimeout(timer);
  }, [prefsMessage]);
  function savePrefs(patch: Partial<Preferences>) {
    void updatePreferences(patch).then((result) => {
      if (result.ok) setPrefsMessage(L("prefsSaved"));
    });
  }
  const updatePrivacy = (patch: Partial<PrivacyPrefs>) => savePrefs(patch);
  const updateNotif = (patch: Partial<NotifPrefs>) => savePrefs(patch);
  const toggleNotices = (next: boolean) => savePrefs({ inboxNotices: next });
  const visible = useMemo(() => studyTerms(terms, session), [terms, session]);
  const counts = countsFor(visible, progress, studyDays);
  const activity = recentActivity(visible, progressRows, 4);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(session?.user.name || "");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [dangerMessage, setDangerMessage] = useState("");
  // One in-flight save at a time: the submit button shows a spinner and a
  // second click cannot send a duplicate request.
  const [saving, setSaving] = useState<"profile" | "password" | null>(null);
  // The session arrives after the first render; keep the field in sync until the user edits it.
  useEffect(() => {
    if (!editing && session) setName(session.user.name);
  }, [session, editing]);

  // All hooks are declared above this line: the session arrives after the
  // first render, and returning early before a hook changes the hook order
  // between renders (React error #310).
  if (!session) return <LearnerShell pageClass="account-reference-page">{null}</LearnerShell>;
  const user = session.user;
  const subscription = session.subscription;
  const isOwner = user.role === "admin";
  const planKey: LearnerKey = subscription.plan === "monthly" ? "planMonthly" : subscription.plan === "annual" ? "planAnnual" : subscription.status === "trialing" ? "planTrial" : "planNone";

  function saveProfile(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2 || saving) return;
    setSaving("profile");
    void updateProfile(trimmed)
      .then((result) => {
        setProfileMessage(result.ok ? L("profileSaved") : result.message || t("couldNotContinue"));
        if (result.ok) setEditing(false);
      })
      .finally(() => setSaving(null));
  }

  function savePassword(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving("password");
    void changePassword(currentPassword, nextPassword)
      .then((result) => {
        setPasswordMessage(result.ok ? L("passwordChanged") : result.message || t("couldNotContinue"));
        if (result.ok) {
          setCurrentPassword("");
          setNextPassword("");
          setPasswordOpen(false);
        }
      })
      .finally(() => setSaving(null));
  }

  return (
    <LearnerShell pageClass="account-reference-page">
      <div className="account-ref-content">
        <section className="account-ref-main-column">
          <div className="account-ref-heading">
            <h1>{L(active === "profile" ? "accountTitle" : active === "preferences" ? "prefsTitle" : active === "security" ? "securityTitle" : "notificationsTitle")}</h1>
            <p>{L(active === "profile" ? "accountLead" : active === "preferences" ? "prefsLead" : active === "security" ? "securityLead" : "notificationsLead")}</p>
          </div>

          <div className="account-ref-tabs" role="tablist" aria-label={L("accountTitle")}>
            {TABS.map((tab) => (
              <Link className={tab === active ? "active" : ""} role="tab" aria-selected={tab === active} href={accountTabHref(tab)} key={tab} scroll={false}>
                {L(TAB_LABEL[tab])}
              </Link>
            ))}
          </div>

          {active === "preferences" && (
            <section className="account-ref-settings-card" id="preferences">
              <h2>{L("language")}</h2>
              <p className="account-ref-card-lead">{L("prefsLanguageBody")}</p>
              <div className="account-ref-lang-choice" role="radiogroup" aria-label={L("language")}>
                {(["en", "es"] as Locale[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="radio"
                    aria-checked={locale === item}
                    className={locale === item ? "active" : ""}
                    onClick={() => {
                      setLocale(item);
                      setPrefsMessage(learnerText(item, "prefsSaved"));
                    }}
                  >
                    <span aria-hidden="true">{item.toUpperCase()}</span>
                    {item === "en" ? "English" : "Español"}
                  </button>
                ))}
              </div>

              <h2>{t("settingsPrivacyTitle")}</h2>
              <p className="account-ref-card-lead">{t("settingsPrivacyBody")}</p>
              <div className="account-ref-settings-list">
                <div className="account-ref-setting-row">
                  <span className="blue">
                    <AccountIcon name="security-shield" />
                  </span>
                  <div>
                    <strong>{t("settingsVisibility")}</strong>
                    <p>{t("settingsVisibilityLimited")} · {t("settingsVisibilityTeam")}</p>
                  </div>
                  <select
                    className="account-ref-select"
                    aria-label={t("settingsVisibility")}
                    value={privacy.visibility}
                    onChange={(event) => updatePrivacy({ visibility: event.target.value as PrivacyPrefs["visibility"] })}
                  >
                    <option value="limited">{t("settingsVisibilityLimited")}</option>
                    <option value="team">{t("settingsVisibilityTeam")}</option>
                  </select>
                </div>
                <div className="account-ref-setting-row">
                  <span className="green">
                    <AccountIcon name="trend-chart" />
                  </span>
                  <div>
                    <strong>{t("settingsDataUsage")}</strong>
                    <p>{t("settingsExportNote")}</p>
                  </div>
                  <Switch on={privacy.dataUsage} onChange={(next) => updatePrivacy({ dataUsage: next })} label={t("settingsDataUsage")} />
                </div>
                <div className="account-ref-setting-row">
                  <span className="red">
                    <AccountIcon name="activity-gear" />
                  </span>
                  <div>
                    <strong>{t("settingsDataSharing")}</strong>
                    <p>{L("prefsPrivacyNote")}</p>
                  </div>
                  <Switch on={privacy.dataSharing} onChange={(next) => updatePrivacy({ dataSharing: next })} label={t("settingsDataSharing")} />
                </div>
              </div>

              <h2>{L("prefsDataTitle")}</h2>
              <p className="account-ref-card-lead">{L("prefsDataBody")}</p>
              <div className="account-ref-data-actions">
                <a className="primary inline" href="/api/learn/export" download>
                  {t("settingsExport")}
                </a>
                <Link className="ghost inline" href="/privacy">
                  {t("settingsDataLink")}
                </Link>
              </div>
              {prefsMessage && <p className="account-ref-message" role="status">{prefsMessage}</p>}
            </section>
          )}

          {active === "notifications" && (
            <section className="account-ref-settings-card" id="notifications">
              <h2>{L("notificationsTitle")}</h2>
              <p className="account-ref-card-lead">{t("settingsNotifyBody")}</p>
              <div className="account-ref-settings-list">
                <div className="account-ref-setting-row">
                  <span className="blue">
                    <AccountIcon name="activity-study" />
                  </span>
                  <div>
                    <strong>{L("notifStudyReminders")}</strong>
                    <p>{L("notifStudyRemindersBody")}</p>
                    <p className="account-ref-soon">{L("notifEmailSoon")}</p>
                  </div>
                  <Switch on={notif.reminders} onChange={(next) => updateNotif({ reminders: next })} label={L("notifStudyReminders")} />
                </div>
                <div className="account-ref-setting-row">
                  <span className="green">
                    <AccountIcon name="trend-chart" />
                  </span>
                  <div>
                    <strong>{L("notifProgress")}</strong>
                    <p>{L("notifProgressBody")}</p>
                    <p className="account-ref-soon">{L("notifEmailSoon")}</p>
                  </div>
                  <Switch on={notif.progressSummary} onChange={(next) => updateNotif({ progressSummary: next })} label={L("notifProgress")} />
                </div>
                <div className="account-ref-setting-row">
                  <span className="purple">
                    <AccountIcon name="premium-badge" />
                  </span>
                  <div>
                    <strong>{L("notifBilling")}</strong>
                    <p>{L("notifBillingBody")}</p>
                  </div>
                  <Switch on disabled label={`${L("notifBilling")} — ${L("notifAlways")}`} />
                </div>
                <div className="account-ref-setting-row">
                  <span className="orange">
                    <AccountIcon name="mail-envelope" />
                  </span>
                  <div>
                    <strong>{L("notifInbox")}</strong>
                    <p>{L("notifInboxBody")}</p>
                  </div>
                  <Switch on={notices} onChange={toggleNotices} label={L("notifInbox")} />
                </div>
              </div>
              {prefsMessage && <p className="account-ref-message" role="status">{prefsMessage}</p>}
            </section>
          )}

          {active === "security" && (
            <section className="account-ref-settings-card" id="email">
              <h2>{L("emailVerification")}</h2>
              <div className="account-ref-settings-list">
                <div className="account-ref-setting-row">
                  <span className={user.emailVerified ? "green" : "orange"}>
                    <AccountIcon name={user.emailVerified ? "check-circle" : "mail-envelope"} />
                  </span>
                  <div>
                    <strong>{user.email}</strong>
                    <p>{user.emailVerified ? L("emailVerifiedBody") : L("emailUnverifiedBody")}</p>
                  </div>
                  {user.emailVerified ? (
                    <span className="account-ref-pill ok">{L("verified")}</span>
                  ) : (
                    <Link className="account-ref-row-link" href="/account/help">
                      {L("openInbox")}
                      <AccountIcon name="chevron-right" />
                    </Link>
                  )}
                </div>
                <div className="account-ref-setting-row">
                  <span className="blue">
                    <AccountIcon name="activity-gear" />
                  </span>
                  <div>
                    <strong>{t("settingsChangeEmail")}</strong>
                    <p>{L("changeEmailBody")}</p>
                  </div>
                  <Link className="account-ref-row-link" href="/account/help">
                    {L("contactSupport")}
                    <AccountIcon name="chevron-right" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          {active === "profile" && (
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
              <AvatarPicker name={user.name} src={user.avatarUrl} />
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
                  <button type="submit" className="primary inline" disabled={saving === "profile"} aria-busy={saving === "profile" || undefined}>
                    {L("saveProfile")}
                  </button>
                </div>
              )}
              {profileMessage && <p className="account-ref-message">{profileMessage}</p>}
            </form>
          </section>
          )}

          {active === "security" && (
          <section className="account-ref-settings-card" id="security">
            <h2>{L("dangerZone")}</h2>
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
                      <button type="submit" className="primary inline" disabled={saving === "password"} aria-busy={saving === "password" || undefined}>
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
          )}
        </section>

        <aside className="account-ref-right-rail">
          <section className="account-ref-panel account-ref-progress-card">
            <h2>{L("yourProgress")}</h2>
            <div className="account-ref-progress-body">
              <div className="account-ref-ring" style={{ background: `conic-gradient(var(--account-blue) 0 ${counts.masteryPct}%, #e4e1ec ${counts.masteryPct}% 100%)` }}>
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
