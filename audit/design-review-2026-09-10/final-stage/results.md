# Remaining roadmap implementation and final review

Status update: the previously blocked local checks are now complete. See [final verification](../verification/results.md). The report below retains the implementation history and original findings; its pending-check section describes the earlier state.

## Implemented

- Lesson: removed the decorative photo band and repeated category chip, compacted the title/pronunciation/status area, improved reading size and section spacing, and grouped study actions. The quiz shortcut now moves keyboard focus to the quiz and respects reduced motion. Existing session navigation and approved lesson content remain intact.
- Homepage: hero → interactive sample → practice areas → consolidated method → named editorial ownership → pricing → FAQ → final action. Component details remain available in a native expandable disclosure. Removed repeated problem/solution and audience sections.
- About: named editorial ownership leads the page, followed by the review process and sample access. Photography remains contextual; no stock portrait is attributed to the editor.
- Signup: visible create-account / activate-trial / start-learning sequence, one consent sentence with policy links, appropriate autocomplete, and status announcements. The sign-in footer no longer appears on signup/recovery forms.
- Auth flow: retains `plan` and `next` query parameters when removing recovery/status flags. Previously the full query string was removed before redirecting, losing purchase intent. Submission failures also clear the busy state and show an error.
- Pricing: one complete monthly card/renewal disclosure adjacent to its CTA. Prices, cancellation terms, annual selection timing, and billing actions are preserved.
- Supporting pages: actionable empty library states without publication diagnostics; saved terms appear without a decorative banner; Progress leads with a study action and replaces an empty chart with guidance; account forms appear without a decorative cover and settings omit unrelated activity/progress panels.
- Motion: carousel camera and slide timers share hover/focus/offscreen/visibility/reduced-motion pause conditions. Removed the extra hero scroll drift and unused count-up code. Reveal behavior responds to preference changes and keyboard focus.
- CSS: scoped learning and marketing files, with shared learning surface/spacing/radius tokens. Existing global CSS is retained; this is incremental consolidation, not a full stylesheet rewrite.

## Completed checks

- All 12 test files passed after the functional changes.
- Final isolated production build passed, including TypeScript, after the layout corrections below.
- `git diff --check` passed.
- Browser sweep completed 150 combinations: EN/ES × 1440/1024/768/390/320px × five public and ten learner routes. See [raw layout results](layouts.json).
- No browser exceptions or broken visible images were recorded. Eight combinations reported document overflow; see below. The other 142 passed those layout checks.
- The sweep also asserted sample placement, editorial placement before pricing, signup steps/policy links, and removal of the lesson photo band.
- English mobile homepage height at 390px changed from approximately 10,335px in the original review to 8,374px (about 19% shorter). Spanish measured 8,575px. These are fixture measurements, not conversion or performance claims; the provisional 25–30% reduction target was not reached.
- Desktop and mobile screenshots were inspected for lesson, signup, pricing, About, account, and Progress presentation.

## Corrections after the sweep

The sweep flagged home/About/pricing at 1024px and Progress at 320px in both languages. Source review identified an overly narrow five-column public footer and a higher-specificity desktop progress-category grid that survived the mobile rules. Applied a two-column tablet footer, wrapping contact text, and scoped narrow-screen progress grid/spacing constraints.

These corrections are included in the passing final production build but have **not been rechecked in a browser**. Screenshots and `layouts.json` deliberately retain the pre-correction evidence.

## Pending verification and blocker

Automatic approval review rejected the additional local browser command because the account usage limit was reached. The rejection explicitly prohibited bypassing it. Consequently these checks remain pending:

1. Rerun the eight flagged layouts against the corrections.
2. Exercise annual-plan and return-path preservation through actual local sign-in.
3. Check empty, expired-access, delayed-loading, and failed-load/retry states in both languages.
4. Check 200% text enlargement and final keyboard navigation.
5. Exercise hover/focus/offscreen pausing and live reduced-motion changes.

No claim of final browser sign-off, screen-reader validation, or deployment is made. Account/content writes during earlier browser checks were confined to the disposable local fixture. Live checkout, real email delivery, production account changes, and deployed-site performance were not tested.

## Screenshots

- [Spanish mobile lesson](es-_terms_CON-001-390.png)
- [Spanish mobile signup](es-_signup-390.png)
- [Spanish mobile pricing](es-_pricing-390.png)
- [English desktop About](en-_about-1440.png)
- [English desktop account](en-_account-1440.png)
- [Spanish mobile Progress](es-_progress-390.png)
- [English mobile homepage](en-_-390.png)

The original proposal remains the reference for broader future work, including real-user analytics, an approved editor portrait if supplied, and continued CSS consolidation.
