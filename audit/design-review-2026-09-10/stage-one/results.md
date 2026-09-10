# Stage one — learning flow and mobile usability

Implemented on 10 September 2026 following approval of the review proposal.

## Changes

- The dashboard's five selected terms travel in the URL through study, Previous/Next navigation, and practice. The quiz uses those same accessible terms in the same order, rather than all terms in the first category. The last study term links to the session quiz, and completed practice links back to the dashboard. Reloading preserves the selection; it does not restore an unfinished quiz's question position or answers.
- Explicit session IDs are deduplicated, bounded to five, and resolved only against accessible terms. Invalid or unavailable IDs do not fall back to an unrelated full quiz. Normal category browsing and single-term quiz routes keep their existing scope.
- The public sample is immediately after the hero, with a direct English/Spanish hero action. `/sample-terms` opens the public sample. Signed-out `/how-it-works` does the same; signed-in users retain their learning-guide page.
- Mobile category cards are readable rows, status filters form a balanced two-column layout, and bottom navigation uses short labels with full accessible names.
- The lesson's fixed 10/60/100% “Understanding” meter is replaced by New / Learning / Mastered steps that highlight the actual state. Grading and mastery rules are unchanged.
- The public mobile menu contains keyboard focus and makes background content inert. Escape restores focus; resizing to desktop closes the menu and releases the background.
- Presentation changes are scoped in `app/learning-flow.css`.

## Verification

- Production build, including TypeScript: passed in an isolated copy of the updated workspace source.
- Existing test suite plus new session-order, URL, unavailable-term and bounded-input tests: all 12 test files passed.
- English and Spanish browser checks at 1440, 768, 390 and 320px: home/sample, terms library, lesson state, category word wrapping and visible navigation labels passed. No page-level horizontal overflow, broken visible images or browser exceptions detected in these checks.
- Full five-term study → five-question quiz → result flows passed in both languages, including selection persistence through reload and cross-category navigation.
- Public sample redirects, signed-in guide access, mobile keyboard containment, Escape focus restoration and desktop resize passed.
- Initial browser automation asserted a route before client navigation finished and used a nonexistent CSS class for quiz buttons. Those selectors/waits were corrected; the final run passed. No corresponding application defect was found.
- `git diff --check`: passed.

All interactive data changes occurred in disposable local fixtures. This is not a deployment or verification of live payments/email services. Stable layout checks used reduced motion. The broader 1024px, enlarged-text, loading/error and expired-access matrix from the roadmap is not claimed complete by this stage's browser run.

## Screenshots

- [Desktop hero and early sample](en-home-1440.png)
- [Mobile hero](en-home-320.png)
- [English mobile library](en-terms-320.png)
- [Spanish mobile library](es-terms-320.png)
- [Lesson progress stages](en-lesson-state-1440.png)
- [Completed session](en-session-complete.png)
- [Browser check log](checks.json)

## Remaining design stages

Wider desktop library cards, stronger task hierarchy on dashboard/quiz, the fuller homepage consolidation, signup/pricing presentation, supporting-page refinements and additional motion polish remain in the proposal. They are not included in this completed first stage.
