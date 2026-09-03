-- Legal English 5 MVP — production schema baseline
-- Run through the normal Supabase migration workflow; do not paste into production ad hoc.

create type public.app_role as enum ('learner', 'admin');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'payment_failed', 'cancelled', 'expired', 'exceptional_access');
create type public.subscription_plan as enum ('monthly', 'annual');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.app_role not null default 'learner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.terms (
  id text primary key,
  term text not null,
  definition text not null,
  spanish_equivalent text not null,
  civil_law_equivalent text,
  spanish_speaker_alert text,
  category text not null check (category in ('Corporate Law', 'Contracts', 'Employment Law')),
  topic text,
  display_order integer,
  jurisdiction_us boolean not null default true,
  jurisdiction_uk boolean not null default false,
  audio_us_path text,
  audio_uk_path text,
  us_variant jsonb,
  uk_variant jsonb,
  use_it_with jsonb not null default '[]'::jsonb,
  in_context jsonb,
  mcd_status text not null default 'Approved',
  published boolean not null default false,
  archived_at timestamptz,
  source_editorial_version text,
  source_last_reviewed_at date,
  source_workbook_version text,
  source_content_hash text,
  admin_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quiz_items (
  id text primary key,
  term_id text not null unique references public.terms(id) on delete cascade,
  prompt text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text,
  correct_option text not null check (correct_option in ('A', 'B', 'C', 'D')),
  explanation text not null,
  display_order integer not null default 1,
  mcd_status text not null default 'Approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_term_progress (
  user_id uuid not null references public.users(id) on delete cascade,
  term_id text not null references public.terms(id) on delete cascade,
  favourite boolean not null default false,
  state text not null default 'new' check (state in ('new', 'learning', 'mastered')),
  attempts integer not null default 0 check (attempts >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, term_id)
);

create table public.subscriptions (
  user_id uuid primary key references public.users(id) on delete cascade,
  status public.subscription_status not null default 'trialing',
  plan public.subscription_plan,
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default (now() + interval '7 days'),
  access_until timestamptz,
  provider text not null default 'mercadopago',
  provider_reference text,
  -- Mercado Pago's own payment id, used to reconcile webhooks idempotently:
  -- a stale or out-of-order webhook for an id older than the one on file is
  -- ignored instead of overwriting a good state. Wired up in Hito C.
  last_payment_id text,
  last_event_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  summary text not null,
  detail text not null,
  severity text not null default 'unclassified' check (severity in ('unclassified', 'low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'acknowledged', 'resolved')),
  created_at timestamptz not null default now()
);

create index terms_public_idx on public.terms (published, archived_at);
create index progress_user_idx on public.user_term_progress (user_id);
create index subscriptions_status_idx on public.subscriptions (status);

alter table public.users enable row level security;
alter table public.terms enable row level security;
alter table public.quiz_items enable row level security;
alter table public.user_term_progress enable row level security;
alter table public.subscriptions enable row level security;
alter table public.support_tickets enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.users where id = (select auth.uid()) and role = 'admin') $$;

create policy "users read own profile" on public.users for select to authenticated
using ((select auth.uid()) = id or public.is_admin());
create policy "users update own name" on public.users for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "learners read published terms" on public.terms for select to authenticated
using ((published and archived_at is null) or public.is_admin());
create policy "admins insert terms" on public.terms for insert to authenticated with check (public.is_admin());
create policy "admins update terms" on public.terms for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "learners read quizzes for visible terms" on public.quiz_items for select to authenticated
using (exists(select 1 from public.terms t where t.id=term_id and ((t.published and t.archived_at is null) or public.is_admin())));
create policy "admins insert quizzes" on public.quiz_items for insert to authenticated with check (public.is_admin());
create policy "admins update quizzes" on public.quiz_items for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "users read own progress" on public.user_term_progress for select to authenticated
using ((select auth.uid()) = user_id or public.is_admin());
create policy "users create own progress" on public.user_term_progress for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "users update own progress" on public.user_term_progress for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "users read own subscription" on public.subscriptions for select to authenticated
using ((select auth.uid()) = user_id or public.is_admin());
-- Subscription mutations are server-only through the service role. No authenticated write policy is granted.

create policy "users create own ticket" on public.support_tickets for insert to authenticated
with check ((select auth.uid()) = reporter_id);
create policy "reporter or admin reads ticket" on public.support_tickets for select to authenticated
using ((select auth.uid()) = reporter_id or public.is_admin());
create policy "admins update ticket status" on public.support_tickets for update to authenticated
using (public.is_admin()) with check (public.is_admin());

grant usage on schema public to authenticated;
grant select on public.terms, public.quiz_items to authenticated;
grant select on public.users, public.subscriptions to authenticated;
grant select, insert, update on public.user_term_progress to authenticated;
grant insert, update on public.terms, public.quiz_items to authenticated;
grant select, insert, update on public.support_tickets to authenticated;

-- Every Supabase Auth signup (email/password, RFP §3.1/3.2) provisions its
-- own profile row and a fresh 7-day trial automatically, so app code never
-- has to insert into public.users with elevated privileges just to bootstrap
-- an account. security definer is required: the inserting role here is the
-- auth admin API, not the new user, so RLS on public.users would otherwise
-- block it.
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'learner'
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, status, trial_started_at, trial_ends_at, provider)
  values (new.id, 'trialing', now(), now() + interval '7 days', 'mercadopago')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- One-time, run by hand after the Owner's own Supabase Auth signup during
-- kickoff: promote her profile row from the 'learner' default to 'admin'.
-- Not part of the trigger — nobody should be able to self-promote.
-- update public.users set role = 'admin' where email = 'owner@example.com';
