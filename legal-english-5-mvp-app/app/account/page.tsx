"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useApp } from "@/components/app-provider";
import { useLocale } from "@/components/locale-provider";
import { Icon } from "@/components/ui-icons";

export default function ProfilePage() {
  const router = useRouter();
  const { session, updateProfile, changePassword, deleteAccount, deactivateAccount } = useApp();
  const { t } = useLocale();
  const user = session?.user;
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!user) return null;

  async function onSaveName(event: FormEvent) {
    event.preventDefault();
    setError("");
    const result = await updateProfile(name);
    if (result.ok) setMessage(t("profileSaved"));
    else setError(result.message || t("couldNotContinue"));
  }

  async function onChangePassword(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (nextPassword !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    const result = await changePassword(currentPassword, nextPassword);
    if (result.ok) {
      setMessage(t("passwordChanged"));
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
    } else setError(result.message || t("couldNotContinue"));
  }

  async function onDeactivate() {
    setError("");
    const result = await deactivateAccount();
    if (!result.ok) setError(result.message || t("couldNotContinue"));
  }

  async function onDelete(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (confirmDelete !== "DELETE") {
      setError(t("deleteNeedConfirm"));
      return;
    }
    const result = await deleteAccount();
    if (result.ok) router.push("/login");
    else setError(result.message || t("couldNotContinue"));
  }

  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("profileEyebrow")}</span>
          <h1>{t("profileTitle")}</h1>
          <p>{t("profileLead")}</p>
        </div>
      </div>
      {message && <p className="notice">{message}</p>}
      {error && <p className="notice">{error}</p>}
      <div className="account-stack">
        <section className="account-card">
          <div className="settings-card-head profile-head">
            <Icon name="user" />
            <div>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
            </div>
            <span className={`status ${user.emailVerified ? "active" : "blocked"}`}>
              {user.emailVerified ? t("profileVerifiedYes") : t("profileVerifiedNo")}
            </span>
          </div>
          <dl className="account-meta">
            <div>
              <dt>{t("profileEmail")}</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>{t("profileRole")}</dt>
              <dd>{user.role === "admin" ? t("owner") : t("learner")}</dd>
            </div>
            <div>
              <dt>{t("profileVerified")}</dt>
              <dd>{user.emailVerified ? t("profileVerifiedYes") : t("profileVerifiedNo")}</dd>
            </div>
            <div>
              <dt>{t("navBilling")}</dt>
              <dd>{session?.subscription.status.replaceAll("_", " ")}</dd>
            </div>
          </dl>
          <form onSubmit={(event) => void onSaveName(event)}>
            <label>
              {t("profileName")}
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <button className="primary" type="submit">
              {t("profileSave")}
            </button>
          </form>
        </section>
        <section className="account-card">
          <div className="settings-card-head">
            <Icon name="lock" />
            <div>
              <h2>{t("passwordTitle")}</h2>
              <p>Keep your sign-in credentials current and private.</p>
            </div>
          </div>
          <form onSubmit={(event) => void onChangePassword(event)}>
            <label>
              {t("passwordCurrent")}
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </label>
            <label>
              {t("passwordNext")}
              <input type="password" value={nextPassword} onChange={(e) => setNextPassword(e.target.value)} minLength={8} required />
            </label>
            <label>
              {t("passwordConfirm")}
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
            </label>
            <button className="primary" type="submit">
              {t("updatePassword")}
            </button>
          </form>
        </section>
        <section className="account-card">
          <h2>{t("deactivateTitle")}</h2>
          <p>{t("deactivateLead")}</p>
          <button className="danger" onClick={() => void onDeactivate()}>
            {t("deactivateAction")}
          </button>
        </section>
        <section className="account-card">
          <h2>{t("deleteTitle")}</h2>
          <p>{t("deleteLead")}</p>
          <form onSubmit={(event) => void onDelete(event)}>
            <label>
              {t("deleteConfirm")}
              <input value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} placeholder="DELETE" />
            </label>
            <button className="danger" type="submit">
              {t("deleteAction")}
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
