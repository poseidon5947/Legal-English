# Stage two: learning presentation

Implemented on 10 September 2026 following approval to continue the design review.

## Changes

- Library grid: three columns on wide desktops, two at tablet widths, one on phones. Stronger term headings, more readable definitions, consistent card spacing, and quieter reading backgrounds. Existing list-view rules remain separate.
- Dashboard: study and quiz actions appear before the five selected terms. Completed onboarding becomes a compact dismissible summary; unfinished steps remain visible.
- Quiz: the active question precedes statistics in the DOM and visual layout. Answer choices have more generous spacing, and buttons wrap on narrow screens.
- Scoped presentation changes live in `app/learning-flow.css`; dashboard and quiz ordering changes live in their components.

## Verification

- All 12 existing test files passed, including the selected-session regression tests added in stage one.
- Production build passed in the isolated application copy.
- Browser checks passed for Terms, Dashboard, and Quizzes in English and Spanish at 1440, 1024, 768, 390, and 320px: 30 route/language/width combinations. No document overflow or browser exceptions were detected. Grid column counts and action/question ordering were asserted. See [checks.json](checks.json).
- Completed onboarding was separately exercised by saving a term in the disposable fixture. Its completed summary appeared without the checklist in both languages.
- Saved desktop and mobile screenshots were visually reviewed. Layout captures use reduced motion.
- `git diff --check` passed. Real workspace account/content data was not changed; these checks used the existing disposable published-content fixture. No deployment, payment, or email testing was performed.

## Visual evidence

- [English desktop library](en-terms-1440.png)
- [English desktop dashboard](en-dashboard-1440.png)
- [Spanish mobile dashboard with unfinished onboarding](es-dashboard-390.png)
- [Spanish mobile dashboard with completed onboarding](es-dashboard-completed-390.png)
- [Spanish mobile quiz](es-quizzes-390.png)

## Remaining scope

This completes the core library/dashboard/quiz presentation pass, not the entire design roadmap. Further lesson-header consolidation, marketing flow, signup/pricing presentation, coordinated motion, and broader empty/error/access-state checks remain. Default mixed practice still covers the full available question pool; the short dashboard session retains its selected scope from stage one. Increased-text-size and screen-reader testing were not performed in this pass.
