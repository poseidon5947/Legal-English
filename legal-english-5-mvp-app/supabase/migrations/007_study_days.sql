-- Dated learning activity. Run after 006_insights.sql.
--
-- user_term_progress keeps one mutable row per term, so it cannot say *when*
-- a learner studied or how many answers were right overall (nine misses and
-- one hit end as "mastered", 1 attempt visible). One row per learner per
-- calendar day fixes streaks, weekly activity and answer accuracy. `day` is
-- the learner's local calendar day, sent by the browser and bounded by the
-- server (lib/study-day.ts); comparisons are on the date, so daylight-saving
-- changes never split or merge a day.

create table if not exists public.study_days (
  user_id uuid not null references public.users(id) on delete cascade,
  day date not null,
  opened integer not null default 0 check (opened >= 0),
  attempts integer not null default 0 check (attempts >= 0),
  correct integer not null default 0 check (correct >= 0 and correct <= attempts),
  saved integer not null default 0 check (saved >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

create index if not exists study_days_user_day_idx on public.study_days (user_id, day desc);

alter table public.study_days enable row level security;

create policy "users read own study days" on public.study_days for select to authenticated
using ((select auth.uid()) = user_id or public.is_admin());
create policy "users create own study days" on public.study_days for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "users update own study days" on public.study_days for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant select, insert, update on public.study_days to authenticated;

-- Account-scoped preferences (Account → Preferences / Notifications). Stored
-- server-side so they follow the learner across browsers and devices and are
-- removed with the account. Shape is validated by the app (lib/preferences.ts).
alter table public.users add column if not exists preferences jsonb not null default '{}'::jsonb;

-- Support tickets: track when the Owner last changed the status (the queue
-- in the Owner console sorts and labels on it).
alter table public.support_tickets add column if not exists updated_at timestamptz not null default now();
