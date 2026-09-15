-- Hito B — progress-state audit trail (client finding "Inconsistencia grave en
-- los estados de progreso", 14 Sep 2026).
--
-- Until now user_term_progress kept ONE mutable row per (user, term): state,
-- an attempts counter and updated_at. That is enough to render the UI but it
-- cannot answer "who answered what, when, from which page" — which is exactly
-- what the Owner needed when the Learner account showed 30 Mastered terms and
-- 45 attempts she did not recognise. This migration makes every future
-- Mastered state and every attempt traceable and non-repudiable:
--
--  1. quiz_attempts — an append-only ledger with one row per graded answer
--     (option chosen, correct or not, page it came from, client key). RLS lets
--     a learner INSERT and SELECT only her own rows; nobody but the service
--     role can UPDATE or DELETE, so the history cannot be rewritten from the app.
--  2. user_term_progress gains the fields the Owner asked to see per Term:
--     opened_at, quiz_completed, quiz_correct, mastered_at, last_activity_at.
--     They are written only by the server on real learner actions.
--
-- Nothing here changes existing rows' state or attempts: the current data is
-- preserved as evidence. The new columns are back-filled from what the old
-- row can prove (attempts > 0 ⇒ quiz_completed; state = mastered ⇒ quiz_correct
-- and mastered_at = updated_at) so the audit columns are never NULL for an
-- old row, and are exact from this migration onwards.

create table if not exists public.quiz_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  term_id text not null references public.terms(id) on delete cascade,
  option text not null check (option in ('A', 'B', 'C', 'D')),
  correct boolean not null,
  -- Where the answer was submitted: the Term Detail Quick Quiz ("term"), the
  -- global quiz runner ("runner") or a dashboard session ("session").
  source text not null default 'term' check (source in ('term', 'runner', 'session')),
  -- Opaque id minted by the browser for each Check Answer press. A retried or
  -- duplicated request carrying the same key is a no-op instead of a second
  -- attempt (unique index below).
  client_key text,
  answered_at timestamptz not null default now()
);

create unique index if not exists quiz_attempts_client_key_idx on public.quiz_attempts (user_id, client_key) where client_key is not null;
create index if not exists quiz_attempts_user_term_idx on public.quiz_attempts (user_id, term_id, answered_at desc);
create index if not exists quiz_attempts_answered_idx on public.quiz_attempts (answered_at desc);

alter table public.quiz_attempts enable row level security;

create policy "users read own attempts" on public.quiz_attempts for select to authenticated
using ((select auth.uid()) = user_id or public.is_admin());
create policy "users append own attempts" on public.quiz_attempts for insert to authenticated
with check ((select auth.uid()) = user_id);
-- No UPDATE / DELETE policy on purpose: the ledger is append-only for the app.

grant select, insert on public.quiz_attempts to authenticated;

alter table public.user_term_progress
  add column if not exists opened_at timestamptz,
  add column if not exists quiz_completed boolean not null default false,
  add column if not exists quiz_correct boolean not null default false,
  add column if not exists mastered_at timestamptz,
  add column if not exists last_activity_at timestamptz;

-- Back-fill from the only facts the legacy row can prove. Evidence rows are
-- not otherwise modified (state / attempts / updated_at stay as captured).
update public.user_term_progress
set quiz_completed = attempts > 0,
    quiz_correct = state = 'mastered',
    mastered_at = case when state = 'mastered' then updated_at end,
    last_activity_at = updated_at,
    opened_at = case when state <> 'new' then updated_at end
where last_activity_at is null;

-- Invariant the Owner asked for: a Term can only be Mastered when a correct
-- answer was actually recorded for it. Enforced by the database, not just the
-- app, so no code path (present or future) can set Mastered on its own.
alter table public.user_term_progress
  drop constraint if exists progress_mastered_requires_correct_quiz;
-- NOT VALID: enforced for every row written from now on; legacy evidence rows
-- are left untouched rather than made to fail the migration.
alter table public.user_term_progress
  add constraint progress_mastered_requires_correct_quiz
  check (state <> 'mastered' or (quiz_completed and quiz_correct and attempts > 0 and mastered_at is not null)) not valid;

comment on table public.quiz_attempts is 'Append-only ledger: one row per graded Quick Quiz answer. Source of truth for QuizCompleted / QuizCorrect / MasteredAt.';
comment on column public.user_term_progress.opened_at is 'First time the learner opened the Term (New → Learning).';
comment on column public.user_term_progress.quiz_completed is 'At least one answer was submitted for this Term.';
comment on column public.user_term_progress.quiz_correct is 'The most recent submitted answer was correct.';
comment on column public.user_term_progress.mastered_at is 'When the first correct answer moved the Term to Mastered.';
comment on column public.user_term_progress.last_activity_at is 'Last open, save or answer on this Term.';
