# Legal English 5 · Alpha

Production-path alpha for MPC LAW STUDIO. It is not the ChatGPT Sites prototype and it is not a browser-only simulation.

## What this alpha proves

- Accounts with email and password, verification and recovery. Codes appear in the Alpha Inbox; production uses Resend.
- Owner and Learner roles. Admin is hidden and rejected on the server.
- 30 LC-001 terms from Master Content Database v1.3.81 (10 Corporate Law, 10 Contracts, 10 Employment Law). All Approved, all with a quiz, all unpublished until AudioUS is uploaded.
- Progress states New / Learning / Mastered, isolated per Learner.
- Seven-day trial with persisted dates. Refresh does not restore access.
- Mercado Pago monthly and annual sandbox events write the same entitlement record production webhooks will update.
- Owner console: publish gate, Excel import preview, users and exceptional access.

## Review accounts

| Role | Email | Password |
| --- | --- | --- |
| Owner | pilar@mpclaw.studio | Pilar#Alpha26 |
| Learner | maria@legalenglish5.test | Maria#Alpha26 |
| Learner | andres@legalenglish5.test | Andres#Alpha26 |

Walkthrough: `/review`

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

Server state lives in `data/alpha-store.json`. Reset it from the Owner overview or delete the file.

## Switching to production mode (Supabase)

`NEXT_PUBLIC_DATA_MODE` selects the backend: `alpha` (default, above) or
`production`. In production mode, `lib/data-store.ts` routes every API route
through `lib/store.supabase.ts` instead of the local JSON file — real
Supabase Auth, real Postgres, real RLS. Alpha mode keeps working unchanged
regardless of which mode is currently set elsewhere.

1. Create the Supabase project (the Owner's account, per the Propuesta §9).
2. Run `supabase/migrations/001_initial_schema.sql` against it — Supabase
   SQL Editor or `supabase db push`, either is fine pre-launch.
3. Dashboard → Authentication → Emails → SMTP Settings: point it at Resend.
   All verification/recovery mail then sends through Resend without any app
   code change.
4. Dashboard → Authentication → Emails → Templates: switch the "Confirm
   signup" and "Reset password" templates to the OTP/code variant, not the
   magic-link variant — the app's UI collects a 6-digit code, not a link
   click.
5. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose to the client).
6. Set `NEXT_PUBLIC_DATA_MODE=production`.
7. Promote the Owner's own profile row to admin — the migration leaves this
   as a commented-out manual step on purpose (`update public.users set
   role = 'admin' where email = '...'`), run once after her first sign-up.
8. Seed content: `POST /api/admin` with the MCD Excel file (multipart) does
   preflight + commit through the existing importer, same as alpha mode.

Known gaps in this pass, tracked for Hito B/C rather than silently glossed
over:
- `replaceTerms` (bulk import commit) upserts row-by-row; it is not yet
  wrapped in a single Postgres transaction, so it is not truly atomic /
  rollback-safe per the MCD Delivery Mapping's §6–7 evidence requirements.
- Audio upload to Supabase Storage is not built (`lib/media.ts` is still
  the stock-photo placeholder layer).
- `applyBilling` deliberately refuses every call in production mode — there
  is no authenticated write policy on `public.subscriptions` by design.
  Hito C replaces it with a Mercado Pago webhook handler using the
  service-role client after verifying the webhook signature.
