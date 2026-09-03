"use client";

import Link from "next/link";
import { DEMO_ACCOUNTS } from "@/lib/types";
import { IMAGES } from "@/lib/media";

const steps = [
  { title: "Open Pilar first", body: "Log in as Owner. Admin shows all 30 LC-001 terms from MCD v1.3.81: 10 Corporate Law, 10 Contracts, 10 Employment Law. Every row is Approved and has a quiz. None are Published. Publish stays blocked until AudioUS is uploaded (AudioUK also for EMP-009).", image: IMAGES.step1 },
  { title: "Then open Maria", body: "Learners only see Published terms. The glossary is empty until you publish. That is intentional: Approved is not Published. Maria already has progress on CORP-005 and CON-001 for isolation tests once those terms are published.", image: IMAGES.step2 },
  { title: "Switch to Andres", body: "Log out and enter as the second Learner. Same unpublished library, different stored progress (EMP-001, CON-010). Progress never crosses accounts.", image: IMAGES.step3 },
  { title: "Create a new account", body: "Sign up with your own email. The seven-day trial starts immediately and is persisted. The verification code arrives in the Alpha Inbox — the same slot Resend will occupy in production.", image: IMAGES.step4 },
  { title: "Expire the trial, then refresh", body: "On Access, fire the expired-trial event. Protected terms lock. Refresh the browser. They stay locked. That is the difference between a label and entitlement.", image: IMAGES.step5 },
  { title: "Reimport v1.3.81", body: "In Admin → Excel import, upload the same MCD. Preflight must show 30 terms, 10/10/10, 18 four-option and 12 three-option quizzes, and zero duplicates on the second pass. A missing row is reported, not deleted.", image: IMAGES.step6 },
];

const portraits = [IMAGES.reviewOwner, IMAGES.reviewMaria, IMAGES.reviewAndres];

export default function ReviewPage() {
  return (
    <main className="review">
      <Link className="back-link" href="/">
        ← Legal English 5
      </Link>
      <header className="page-heading">
        <div>
          <span className="eyebrow">FOR PILAR · ALPHA REVIEW</span>
          <h1>What to test in twelve minutes</h1>
          <p>This is not a visual demo. Each step maps to a criterion in your Solicitud de Cotización.</p>
        </div>
        <Link className="primary" href="/login">
          Start with Pilar
        </Link>
      </header>
      <div className="account-grid">
        {DEMO_ACCOUNTS.map((account, index) => (
          <article className="media-card" key={account.email}>
            <div className="card-media">
              <img src={portraits[index]} alt="" />
            </div>
            <span>{account.role}</span>
            <strong>{account.email}</strong>
            <code>{account.password}</code>
          </article>
        ))}
      </div>
      <ol className="walkthrough">
        {steps.map((step, index) => (
          <li key={step.title}>
            <div className="card-media">
              <img src={step.image} alt="" />
            </div>
            <div>
              <b>0{index + 1}</b>
              <h2>{step.title}</h2>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
