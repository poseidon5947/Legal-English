-- NEW-01 (client revalidation, 17 Sep 2026): "Quizzes Completed" increased by
-- one after a single answer while the quiz was still on question 1 of 30.
--
-- Until now the metric was the sum of progress.attempts, i.e. QUESTION
-- attempts, and so were the Quiz Master achievement and the Progress figures.
-- This migration gives quiz SESSIONS their own record so the three counts can
-- be told apart and the metric can only move when a session is finished:
--
--   * quiz session   — the set of questions a learner starts in Quiz (mixed
--                      quiz, one Area, a Dashboard session, a practice of
--                      failed Terms). One row here, created on the first
--                      answer, completed only when every question has a
--                      recorded attempt.
--   * question attempt — one graded answer (quiz_attempts, migration 010).
--                      Now carries the session it belongs to, or NULL for a
--                      Term-page Quick Quiz.
--   * Term attempt   — progress.attempts per Term (unchanged).
--
-- Completion is decided by the server from the ledger: a session is marked
-- completed only if the number of distinct Terms answered inside it is at
-- least its declared question count. Ending a quiz early never completes it.

create table if not exists public.quiz_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  -- Opaque id minted by the browser once per session (idempotent create).
  client_key text not null,
  -- 'all' | 'area:<Area>' | 'session:<dashboard session>' | 'practice:<Area|All>' | 'term:<id>'
  scope text not null default 'all',
  total_questions integer not null check (total_questions between 1 and 500),
  answered integer not null default 0 check (answered >= 0),
  correct integer not null default 0 check (correct >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, client_key)
);

create index if not exists quiz_sessions_user_completed_idx on public.quiz_sessions (user_id, completed_at desc);

alter table public.quiz_sessions enable row level security;

create policy "users read own quiz sessions" on public.quiz_sessions for select to authenticated
using ((select auth.uid()) = user_id or public.is_admin());
create policy "users start own quiz sessions" on public.quiz_sessions for insert to authenticated
with check ((select auth.uid()) = user_id);
-- The only UPDATE the app performs is completing its own session; the row
-- never changes owner and completion cannot be undone from the app.
create policy "users complete own quiz sessions" on public.quiz_sessions for update to authenticated
using ((select auth.uid()) = user_id and completed_at is null)
with check ((select auth.uid()) = user_id);

grant select, insert, update on public.quiz_sessions to authenticated;

-- Each question attempt records the session it was answered in (NULL = Term page).
alter table public.quiz_attempts
  add column if not exists session_id bigint references public.quiz_sessions(id) on delete set null;
create index if not exists quiz_attempts_session_idx on public.quiz_attempts (session_id) where session_id is not null;

comment on table public.quiz_sessions is 'One row per quiz session started in Quiz. "Quizzes Completed" = rows with completed_at set. Completion requires a recorded attempt for every question.';
comment on column public.quiz_attempts.session_id is 'Quiz session this answer belongs to; NULL for a Term-page Quick Quiz (a Term attempt, not part of a session).';
