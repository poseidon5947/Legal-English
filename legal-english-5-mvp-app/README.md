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

### Brand and design system

The UI follows the client's **MPC LAW STUDIO Design System v2.3** (30 Aug
2026). The approved palette lives as tokens at the top of `app/globals.css`
and every role token (`--navy`, `--accent`, `--green`, …) is mapped onto it:

| Token | Value | Use (v2.3 §2) |
| --- | --- | --- |
| `--brand-purple` | `#452B84` | primary buttons, navigation, headings, key brand elements |
| `--brand-yellow` | `#F5E400` | highlights, achievements, selective accents — **never white text on yellow**; text on yellow is Brand Dark |
| `--brand-dark` | `#1A171B` | primary text, dark logo treatment |
| `--brand-gray` | `#707173` | secondary text (4.89:1 on white — do not lighten) |
| `--surface` | `#F7F7FA` | cards and secondary surfaces |
| `--success` / `--warning` / `--error` | `#2E7D32` / `#F9A825` / `#C62828` | semantic states, always paired with a label or icon |

Also from the document: type-scale and 8-point spacing tokens (`--type-*`,
`--space-*`), a 44×44 px touch-target floor on touch devices (`@media
(pointer: coarse)` block at the end of the stylesheet), 13 px minimum for
running text and 11 px for uppercase micro-labels, purple-outline secondary
buttons, and the §10 lesson sequence on the term page: Term (with part of
speech) → Pronunciation → Definition → Civil Law Equivalent (badged DIRECT
TERMINOLOGICAL or FUNCTIONAL from the MCD's ComparativeLawNote) → Use It With
→ In Context → Spanish-Speaker Alert → US/UK Variant → Quick Quiz. Optional
cards are omitted when the MCD field is empty. Drafting Tip, Legalese Watch,
Don't Confuse It With and Jurisdictional Note are not delivered by MCD
v1.3.81, so they have no card yet.

The icon packs under `public/*/icons`, the brand mark (`public/brand`,
`app/icon.svg`) and the UI mockups in `public/generated` were recoloured to
the same palette; category icons follow §6 (Contracts = document, Corporate
= building, Employment Law = briefcase).

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
   `007_study_days.sql`, in order — Supabase SQL Editor or
   `supabase db push`, either is fine pre-launch. `005` adds the private
   `avatars` bucket + `users.avatar_path` for the Account-panel profile
   photo (alpha mode keeps the file under `data/avatars/` instead); `006`
   adds the anonymous `insights` table behind the Owner's visitor panel;
   `007` adds `study_days` (one row per learner per calendar day — quiz
   accuracy and streaks are computed from it) and `users.preferences`
   (privacy/notification switches, so they follow the account across
   devices).
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

### Access rules (both modes)

`lib/access.ts` is the single place that decides who may study what.
`/api/bootstrap` sends an account without active access (trial expired,
subscription lapsed, deactivated) the term *titles* only — no definitions,
quiz items or audio URLs — and `/api/learn` + `/api/media` refuse the same
accounts, plus any term that is unpublished, archived or unknown. Every
mutation validates the term before touching progress.

The Owner's alpha "Reset store" needs a signed-in Owner **and**
`ALLOW_STORE_RESET=1` on the server; it is refused everywhere else.

## Mercado Pago (Hito C)

Checkout and cancellation go through `store.startCheckout` /
`store.cancelSubscription` (`POST /api/billing` with `action: "checkout" |
"cancel"`). In alpha mode they run against the local sandbox reducer so the
Billing screen can be exercised end-to-end; in production they create /
cancel a Mercado Pago preapproval (`lib/mercadopago.ts`) and the learner is
sent to `init_point`. Mercado Pago returns to
`/billing?checkout=success|pending|failure`; while a payment is pending the
page polls `/api/bootstrap` until the webhook has landed. Pricing and
landing CTAs carry the chosen plan through sign-up (`/signup?plan=annual` →
`/billing?plan=annual`).

`applyBilling` (the sandbox event simulator) refuses every call in
production mode on purpose — there is no authenticated write policy on
`public.subscriptions`. The only writer is
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

Still open for Hito C: the Owner's live Mercado Pago credentials and plan
ids (until they are set, the checkout button explains that payments are
not enabled and the trial keeps working), and the periodic reconciliation
job against `/preapproval/search` that the Propuesta describes as a
backstop for missed webhooks.

## Support queue

A learner's "Report a problem" (term page or Account → Help) files a
`support_tickets` row as well as the Alpha Inbox mail. The Owner console
gets a **Support** tab (open / being looked at / resolved); the learner sees
the status of their own reports under Account → Help → "Your reports".

## Tests

```bash
npm test          # node --test tests/*.test.mjs
npm run typecheck
```

The tests import the real TypeScript modules (Node 22 type stripping), so
the payment state machine, the webhook signature check, the resource
mapping, the access rules, the study-day aggregation behind accuracy and
streaks, and the preference validation are tested as shipped.
`tests/_ts-resolver-hooks.mjs` resolves the `@/` alias for modules that use
it.
