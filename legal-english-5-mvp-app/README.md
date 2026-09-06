# Legal English 5 · Alpha

Production-path alpha for MPC LAW STUDIO. It is not the ChatGPT Sites prototype and it is not a browser-only simulation.

## What this alpha proves

- Accounts with email and password, verification and recovery. Codes appear in the Alpha Inbox; production uses Resend.
- Owner and Learner roles. Admin is hidden and rejected on the server.
- 30 LC-001 terms from Master Content Database v1.3.81 (10 Corporate Law, 10 Contracts, 10 Employment Law). All Approved, all with a quiz, all unpublished until AudioUS is uploaded.
- Progress states New / Learning / Mastered, isolated per Learner.
- Seven-day trial with persisted dates. Refresh does not restore access.
- Mercado Pago monthly and annual sandbox events run through the same state machine the production webhook uses (`lib/billing-state.ts`): `active` → `past_due` (charge rejected, 5-day grace, access kept) → `payment_failed` (retries exhausted) ; `cancelled` keeps access until the paid period ends; stale or duplicate events are ignored.
- Owner console: publish gate, Excel import preview + commit + rollback, bulk audio upload by filename, users and exceptional access, JSON export.
- Audio: files named `{TermID}_US.mp3` / `{TermID}_UK.mp3` (also m4a, wav, ogg) are associated by name; anything else is rejected and listed. Alpha stores them under `data/audio/` and serves them only through `/api/media/...` after session + publication + entitlement checks. Production uses the private `term-audio` bucket with signed URLs.
- AUDIO-PROD-01 (2026-09-05): the Owner's 31 approved static files (30 AudioUS + `EMP-009_UK`, ElevenLabs, MP3 44.1 kHz / 128 kbps) are versioned under `data/audio/{TermID}/{us|uk}.mp3` with the delivery `MANIFEST.json`. `tests/audio-assets.test.mjs` is the 31-asset gate (nothing missing, nothing extra, SHA-256 identical to the manifest); a fresh alpha store re-associates them automatically. For production, upload the same files through the Owner console's bulk upload (they land at `term-audio/{TermID}/{us|uk}.mp3`). TTS generation stays outside the app by the Owner's rule.

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

`npm run dev` compiles each page on first visit, so the first open of a route is slow by design. To judge real loading speed run the production build: `npm run build && npm start`.

### Images

Photos are rendered through `components/photo.tsx`, which serves pre-built WebP variants (160/480/800/1200 px) from a sibling `w/` folder and lets the browser pick the smallest one that fits. After adding or replacing a JPG under `public/home-assets/photos`, `public/home-assets/hero` or `public/auth-assets/backgrounds`, run:

```bash
python3 scripts/build-photos.py      # WebP variants + lib/photo-manifest.json
python3 scripts/optimize-icons.py    # palette-quantise new icon/badge PNGs
```

### Profile photo

Account → Profile lets a learner add, change or remove a profile photo. The browser centre-crops and downsizes it to 256×256 WebP (`components/avatar-picker.tsx`) before upload, and `POST /api/account/avatar` re-checks the bytes (real JPG/PNG/WebP, ≤512 KB, ≤1024 px). Alpha mode stores `data/avatars/<userId>.webp` and serves it only to that signed-in user; production stores it in the private `avatars` bucket and returns a signed URL. The photo is included in the learner's data export and deleted together with the account.

### Visitor insights (Owner console → Overview)

The site measures itself instead of loading a third-party analytics script. `components/insight-beacon.tsx` sends anonymous page views and Core Web Vitals (LCP, CLS, INP, TTFB) to `POST /api/insights` — no cookie, no IP, no user agent, no account id; the only identifier is a random per-tab value so visits can be counted. The Owner's Overview tab shows visits per day, p75 vitals against Google's thresholds and the most viewed pages (`GET /api/admin/insights?days=7|14|30`). Alpha mode keeps 90 days in `data/insights.json`; production uses the `insights` table from migration `006`. Automated browsers (`navigator.webdriver`) are excluded so tests never inflate the numbers.

SEO is handled in `lib/site.ts`: per-route titles/canonicals/`noindex`, `sitemap.xml`, `robots.txt`, Open Graph/Twitter cards, and schema.org JSON-LD (`Organization` + `WebSite` on every page, `Course` on the home page, `FAQPage` on Pricing).

## Switching to production mode (Supabase)

`NEXT_PUBLIC_DATA_MODE` selects the backend: `alpha` (default, above) or
`production`. In production mode, `lib/data-store.ts` routes every API route
through `lib/store.supabase.ts` instead of the local JSON file — real
Supabase Auth, real Postgres, real RLS. Alpha mode keeps working unchanged
regardless of which mode is currently set elsewhere.

1. Create the Supabase project (the Owner's account, per the Propuesta §9).
2. Run `supabase/migrations/001_initial_schema.sql` through
   `006_insights.sql`, in order — Supabase SQL Editor or
   `supabase db push`, either is fine pre-launch. `005` adds the private
   `avatars` bucket + `users.avatar_path` for the Account-panel profile
   photo (alpha mode keeps the file under `data/avatars/` instead); `006`
   adds the anonymous `insights` table behind the Owner's visitor panel.
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

## Mercado Pago (Hito C)

`applyBilling` refuses every call in production mode on purpose — there is
no authenticated write policy on `public.subscriptions`. The only writer is
`app/api/webhooks/mercadopago/route.ts`, which:

1. verifies the `x-signature` HMAC (manifest `id:{data.id};request-id:{x-request-id};ts:{ts};`, 10-minute replay window);
2. records the notification id in `public.billing_events` (a redelivery is answered 200 and skipped);
3. fetches the resource from Mercado Pago — the body is a pointer, not the truth;
4. maps it (`lib/mercadopago.ts`): `subscription_preapproval` authorized/paused/cancelled, `subscription_authorized_payment` processed/recycling/cancelled;
5. reduces with `applyBillingEvent` and persists with the service role.

Set `PAYMENT_PROVIDER=mercadopago`, `MERCADOPAGO_ACCESS_TOKEN`,
`MERCADOPAGO_WEBHOOK_SECRET`, `MERCADOPAGO_PLAN_MONTHLY_ID`,
`MERCADOPAGO_PLAN_ANNUAL_ID`, and register
`https://<domain>/api/webhooks/mercadopago` for the "Plans and
Subscriptions" events in the Owner's Mercado Pago application. The checkout
that creates the preapproval must set `external_reference` to the learner's
user id so the first notification can be matched before
`provider_reference` is on file.

Still open for Hito C: the checkout/preapproval creation itself (needs the
Owner's Mercado Pago account and plan prices), and the periodic
reconciliation job against `/preapproval/search` that the Propuesta
describes as a backstop for missed webhooks.

## Tests

```bash
npm test          # node --test tests/*.test.mjs
npm run typecheck
```

`tests/billing-state.test.mjs` imports the real TypeScript modules (Node 22
type stripping), so the payment state machine, the webhook signature check,
the resource mapping and the audio filename convention are tested as shipped.
