-- Legal English 5 · migrations 001–007 concatenated in order.
-- Paste the whole file into the Supabase SQL Editor and Run once on a fresh project.
-- Regenerate after adding a migration: cat migrations/0*.sql

-- ===== migrations/001_initial_schema.sql =====
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

-- ===== migrations/002_import_and_audio.sql =====
-- Hito B: atomic MCD import commit + audio storage.
-- Run after 001_initial_schema.sql.

-- ---------------------------------------------------------------------
-- Atomic import commit (MCD Delivery Mapping §6.1/§7 — commit atómico por
-- lote o rollback automático; nunca una carga parcialmente confirmada).
--
-- A single plpgsql function invocation is one transaction: if anything
-- inside raises, every write in the function — both tables — rolls back
-- together. This replaces the previous row-by-row upsert loop in
-- lib/store.supabase.ts, which committed each term independently.
-- ---------------------------------------------------------------------
create or replace function public.import_terms_batch(terms_payload jsonb, quiz_payload jsonb)
returns table (term_id text, action text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.users where id = (select auth.uid()) and role = 'admin') then
    raise exception 'Owner access required.' using errcode = '42501';
  end if;

  return query
  with upserted as (
    insert into public.terms as t (
      id, term, definition, spanish_equivalent, civil_law_equivalent, spanish_speaker_alert,
      category, topic, display_order, jurisdiction_us, jurisdiction_uk,
      audio_us_path, audio_uk_path, us_variant, uk_variant, use_it_with, in_context,
      mcd_status, published, source_editorial_version, source_last_reviewed_at,
      source_workbook_version, source_content_hash, admin_metadata, updated_at
    )
    select
      x.id, x.term, x.definition, x.spanish_equivalent, x.civil_law_equivalent, x.spanish_speaker_alert,
      x.category, x.topic, x.display_order, x.jurisdiction_us, x.jurisdiction_uk,
      x.audio_us_path, x.audio_uk_path, x.us_variant, x.uk_variant, x.use_it_with, x.in_context,
      x.mcd_status, coalesce((select published from public.terms where id = x.id), false),
      x.source_editorial_version, x.source_last_reviewed_at, x.source_workbook_version,
      x.source_content_hash, x.admin_metadata, now()
    from jsonb_to_recordset(terms_payload) as x(
      id text, term text, definition text, spanish_equivalent text, civil_law_equivalent text,
      spanish_speaker_alert text, category text, topic text, display_order int,
      jurisdiction_us boolean, jurisdiction_uk boolean, audio_us_path text, audio_uk_path text,
      us_variant jsonb, uk_variant jsonb, use_it_with jsonb, in_context jsonb,
      mcd_status text, source_editorial_version text, source_last_reviewed_at date,
      source_workbook_version text, source_content_hash text, admin_metadata jsonb
    )
    on conflict (id) do update set
      term = excluded.term,
      definition = excluded.definition,
      spanish_equivalent = excluded.spanish_equivalent,
      civil_law_equivalent = excluded.civil_law_equivalent,
      spanish_speaker_alert = excluded.spanish_speaker_alert,
      category = excluded.category,
      topic = excluded.topic,
      display_order = excluded.display_order,
      jurisdiction_us = excluded.jurisdiction_us,
      jurisdiction_uk = excluded.jurisdiction_uk,
      -- Audio paths are owned by the upload flow (see storage section
      -- below), not the MCD importer — never overwrite what the Owner
      -- already uploaded just because a reimport ran.
      us_variant = excluded.us_variant,
      uk_variant = excluded.uk_variant,
      use_it_with = excluded.use_it_with,
      in_context = excluded.in_context,
      mcd_status = excluded.mcd_status,
      source_editorial_version = excluded.source_editorial_version,
      source_last_reviewed_at = excluded.source_last_reviewed_at,
      source_workbook_version = excluded.source_workbook_version,
      source_content_hash = excluded.source_content_hash,
      admin_metadata = excluded.admin_metadata,
      updated_at = now()
    returning t.id, (xmax = 0) as was_insert
  )
  select id as term_id, case when was_insert then 'insert' else 'update' end as action from upserted;

  insert into public.quiz_items as q (
    id, term_id, prompt, option_a, option_b, option_c, option_d,
    correct_option, explanation, display_order, mcd_status, updated_at
  )
  select
    x.id, x.term_id, x.prompt, x.option_a, x.option_b, x.option_c, x.option_d,
    x.correct_option, x.explanation, x.display_order, x.mcd_status, now()
  from jsonb_to_recordset(quiz_payload) as x(
    id text, term_id text, prompt text, option_a text, option_b text, option_c text, option_d text,
    correct_option text, explanation text, display_order int, mcd_status text
  )
  on conflict (id) do update set
    term_id = excluded.term_id,
    prompt = excluded.prompt,
    option_a = excluded.option_a,
    option_b = excluded.option_b,
    option_c = excluded.option_c,
    option_d = excluded.option_d,
    correct_option = excluded.correct_option,
    explanation = excluded.explanation,
    display_order = excluded.display_order,
    mcd_status = excluded.mcd_status,
    updated_at = now();
end;
$$;

grant execute on function public.import_terms_batch(jsonb, jsonb) to authenticated;

-- ---------------------------------------------------------------------
-- Import rollback (MCD Delivery Mapping §7 — "Ejecutar rollback en
-- ambiente de prueba y reconciliar los IDs y counts"). Every commit
-- snapshots the pre-import state of every touched TermID/QuizItemID
-- before writing anything; rollback restores exactly that snapshot inside
-- one more all-or-nothing function call, and deletes any term the import
-- created that did not exist before it ran.
-- ---------------------------------------------------------------------
create table public.import_runs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.users(id),
  touched_term_ids text[] not null,
  before_terms jsonb not null default '[]'::jsonb,
  before_quiz_items jsonb not null default '[]'::jsonb,
  missing_term_ids text[] not null default '{}',
  inserted_count int not null default 0,
  updated_count int not null default 0,
  status text not null default 'committed' check (status in ('committed', 'rolled_back')),
  created_at timestamptz not null default now(),
  rolled_back_at timestamptz
);

alter table public.import_runs enable row level security;
create policy "admins manage import runs" on public.import_runs for all to authenticated
using (public.is_admin()) with check (public.is_admin());
grant select, insert, update on public.import_runs to authenticated;

create or replace function public.rollback_import_run(run_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  run record;
  before_term jsonb;
  term_ids_restored text[] := '{}';
  deleted_count int := 0;
begin
  if not exists (select 1 from public.users where id = (select auth.uid()) and role = 'admin') then
    raise exception 'Owner access required.' using errcode = '42501';
  end if;

  select * into run from public.import_runs where id = run_id;
  if not found then
    raise exception 'Import run % not found.', run_id;
  end if;
  if run.status = 'rolled_back' then
    raise exception 'Import run % was already rolled back.', run_id;
  end if;

  delete from public.quiz_items where term_id = any(run.touched_term_ids);

  for before_term in select * from jsonb_array_elements(run.before_terms)
  loop
    insert into public.terms (
      id, term, definition, spanish_equivalent, civil_law_equivalent, spanish_speaker_alert,
      category, topic, display_order, jurisdiction_us, jurisdiction_uk,
      audio_us_path, audio_uk_path, us_variant, uk_variant, use_it_with, in_context,
      mcd_status, published, archived_at, source_editorial_version, source_last_reviewed_at,
      source_workbook_version, source_content_hash, admin_metadata, created_at, updated_at
    )
    select
      x.id, x.term, x.definition, x.spanish_equivalent, x.civil_law_equivalent, x.spanish_speaker_alert,
      x.category, x.topic, x.display_order, x.jurisdiction_us, x.jurisdiction_uk,
      x.audio_us_path, x.audio_uk_path, x.us_variant, x.uk_variant, x.use_it_with, x.in_context,
      x.mcd_status, x.published, x.archived_at, x.source_editorial_version, x.source_last_reviewed_at,
      x.source_workbook_version, x.source_content_hash, x.admin_metadata, x.created_at, x.updated_at
    from jsonb_to_record(before_term) as x(
      id text, term text, definition text, spanish_equivalent text, civil_law_equivalent text,
      spanish_speaker_alert text, category text, topic text, display_order int,
      jurisdiction_us boolean, jurisdiction_uk boolean, audio_us_path text, audio_uk_path text,
      us_variant jsonb, uk_variant jsonb, use_it_with jsonb, in_context jsonb,
      mcd_status text, published boolean, archived_at timestamptz, source_editorial_version text,
      source_last_reviewed_at date, source_workbook_version text, source_content_hash text,
      admin_metadata jsonb, created_at timestamptz, updated_at timestamptz
    )
    on conflict (id) do update set
      term = excluded.term,
      definition = excluded.definition,
      spanish_equivalent = excluded.spanish_equivalent,
      civil_law_equivalent = excluded.civil_law_equivalent,
      spanish_speaker_alert = excluded.spanish_speaker_alert,
      category = excluded.category,
      topic = excluded.topic,
      display_order = excluded.display_order,
      jurisdiction_us = excluded.jurisdiction_us,
      jurisdiction_uk = excluded.jurisdiction_uk,
      audio_us_path = excluded.audio_us_path,
      audio_uk_path = excluded.audio_uk_path,
      us_variant = excluded.us_variant,
      uk_variant = excluded.uk_variant,
      use_it_with = excluded.use_it_with,
      in_context = excluded.in_context,
      mcd_status = excluded.mcd_status,
      published = excluded.published,
      archived_at = excluded.archived_at,
      source_editorial_version = excluded.source_editorial_version,
      source_last_reviewed_at = excluded.source_last_reviewed_at,
      source_workbook_version = excluded.source_workbook_version,
      source_content_hash = excluded.source_content_hash,
      admin_metadata = excluded.admin_metadata,
      updated_at = excluded.updated_at;
    term_ids_restored := array_append(term_ids_restored, before_term->>'id');
  end loop;

  -- Any touched TermID not present in the snapshot did not exist before
  -- this import created it — remove it to fully revert.
  delete from public.terms t
  where t.id = any(run.touched_term_ids)
    and not (t.id = any(term_ids_restored));
  get diagnostics deleted_count = row_count;

  insert into public.quiz_items (
    id, term_id, prompt, option_a, option_b, option_c, option_d,
    correct_option, explanation, display_order, mcd_status, created_at, updated_at
  )
  select
    x.id, x.term_id, x.prompt, x.option_a, x.option_b, x.option_c, x.option_d,
    x.correct_option, x.explanation, x.display_order, x.mcd_status, x.created_at, x.updated_at
  from jsonb_to_recordset(run.before_quiz_items) as x(
    id text, term_id text, prompt text, option_a text, option_b text, option_c text, option_d text,
    correct_option text, explanation text, display_order int, mcd_status text,
    created_at timestamptz, updated_at timestamptz
  );

  update public.import_runs set status = 'rolled_back', rolled_back_at = now() where id = run_id;

  return jsonb_build_object(
    'restoredTerms', coalesce(array_length(term_ids_restored, 1), 0),
    'deletedTerms', deleted_count
  );
end;
$$;

grant execute on function public.rollback_import_run(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- Audio storage. Private bucket: nothing is publicly fetchable by path.
-- Admin uploads through the service-role client (app/api/admin/audio),
-- which also writes terms.audio_us_path / audio_uk_path as the object
-- path (not a URL). Learner playback URLs are short-lived signed URLs
-- generated server-side in lib/store.supabase.ts's listTerms(), after the
-- normal RLS-scoped term query already decided the learner may see that
-- term at all — signing does not introduce a new authorization boundary,
-- it stands in for one already enforced by the terms/quiz_items policies.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('term-audio', 'term-audio', false)
on conflict (id) do nothing;

create policy "admins manage term audio" on storage.objects for all to authenticated
using (bucket_id = 'term-audio' and public.is_admin())
with check (bucket_id = 'term-audio' and public.is_admin());

-- ===== migrations/003_account_and_backup.sql =====
-- Closes three gaps against the Solicitud de Cotización found on review:
-- account deactivation (§3.2, separate from deletion), Colombian data-law
-- consent at registration (§4, Ley 1581/2012 + Decreto 1377/2013), and true
-- Term deletion (§3.8, distinct from archiving).
--
-- Also fixes a real bug found while adding these: 001_initial_schema.sql
-- never granted UPDATE on public.users to `authenticated` at all, so
-- lib/store.supabase.ts's updateProfile() has been failing silently in
-- production mode since Hito A. Column-level grants below fix it AND close
-- a privilege-escalation gap the table-wide grant would have opened: the
-- existing "users update own name" RLS policy checks row ownership, not
-- which columns are being written, so a blanket UPDATE grant would have let
-- a Learner set their own role to 'admin' via a direct API call.

alter table public.users add column if not exists disabled_at timestamptz;
alter table public.users add column if not exists privacy_accepted_at timestamptz;

grant update (full_name, disabled_at, privacy_accepted_at, updated_at) on public.users to authenticated;

-- True delete, for an Owner who wants a Term gone entirely rather than
-- retired/archived. app code (saveTerm/deleteTerm in lib/store.supabase.ts)
-- refuses to delete a currently-published Term — archive first — but that
-- is an application-level rail, not something RLS can express, so it is
-- re-checked here as a defense-in-depth backstop.
create policy "admins delete terms" on public.terms for delete to authenticated
using (public.is_admin() and not published);
create policy "admins delete quizzes" on public.quiz_items for delete to authenticated
using (public.is_admin());
grant delete on public.terms, public.quiz_items to authenticated;

-- handle_new_auth_user() (001_initial_schema.sql) already provisions a
-- profile + trial row on signup. Extend it to record consent timestamp
-- from the signUp() call's user metadata, and to reject the trigger
-- itself if consent wasn't given — belt-and-suspenders alongside the
-- application-level check in lib/store.supabase.ts's register().
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce((new.raw_user_meta_data ->> 'privacy_accepted')::boolean, false) is not true then
    raise exception 'Registration requires accepting the data processing notice.' using errcode = '23514';
  end if;

  insert into public.users (id, email, full_name, role, privacy_accepted_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'learner',
    now()
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, status, trial_started_at, trial_ends_at, provider)
  values (new.id, 'trialing', now(), now() + interval '7 days', 'mercadopago')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- ===== migrations/004_billing_states.sql =====
-- Hito C: payment states promised in the Propuesta (Estados de cobro y acceso)
-- and webhook idempotency. Run after 003_account_and_backup.sql.
--
--   active          pago acreditado                     abierto
--   past_due        rechazo; Mercado Pago reintenta     se mantiene (grace_until)
--   payment_failed  reintentos agotados / API confirma  bloqueado
--   cancelled       el usuario canceló                  abierto hasta current_period_end
--   expired         venció trial o periodo              bloqueado
--
-- The enum in 001 already contains every status above; this only adds the
-- two dates the reducer in lib/billing-state.ts needs and the event ledger.

alter table public.subscriptions add column if not exists current_period_end timestamptz;
alter table public.subscriptions add column if not exists grace_until timestamptz;

-- Every Mercado Pago notification is recorded once, keyed by the provider's
-- notification id, before any state change. A redelivery of the same id is
-- answered 200 and skipped; an out-of-order event is rejected by the reducer
-- (last_event_at) and still logged here with applied = false for audit.
create table if not exists public.billing_events (
  id bigserial primary key,
  provider text not null default 'mercadopago',
  notification_id text not null,
  topic text not null,
  resource_id text not null,
  preapproval_id text,
  user_id uuid references public.users(id) on delete set null,
  event_type text,
  applied boolean not null default false,
  reason text,
  payload jsonb,
  received_at timestamptz not null default now(),
  unique (provider, notification_id)
);

alter table public.billing_events enable row level security;
-- Only the Owner can read the ledger; nobody writes it through an
-- authenticated session — the webhook uses the service role.
create policy "admins read billing events" on public.billing_events for select to authenticated
using (public.is_admin());
grant select on public.billing_events to authenticated;

-- Lookup used by the webhook to find whose subscription a preapproval is.
create index if not exists subscriptions_provider_reference_idx on public.subscriptions (provider_reference);

-- ===== migrations/005_profile_photo.sql =====
-- Profile photo (Account panel). Run after 004_billing_states.sql.
--
-- The image itself lives in a private Storage bucket as
-- <auth.uid()>/avatar.<webp|jpg|png>; users.avatar_path holds that object
-- path and lib/store.supabase.ts hands the browser a short-lived signed URL
-- (same pattern as term audio). The browser crops/resizes to 256x256 WebP and
-- the API route re-validates format, size (<=512 KB) and dimensions before
-- upload, so the bucket never receives a raw camera photo.

alter table public.users add column if not exists avatar_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 524288, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- A learner may only touch the folder named after their own auth uid.
-- Admins do not get a blanket policy: the app writes through the service
-- role, and there is no product reason for an Owner to browse learner photos.
create policy "users manage own avatar" on storage.objects for all to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ===== migrations/006_insights.sql =====
-- Visitor insights (Owner console → Overview). Run after 005_profile_photo.sql.
--
-- Anonymous, first-party analytics: one row per page view or Core Web Vital
-- sample. No IP address, user agent, cookie or account id is stored; `sid`
-- is a random per-tab value from sessionStorage. The API route writes with
-- the service role (visitors have no session), and reads are Owner-only.
-- Rows older than 90 days are deleted by the same route.

create table if not exists public.insights (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('view', 'vital')),
  path text not null,
  locale text not null check (locale in ('en', 'es')),
  device text not null check (device in ('mobile', 'desktop')),
  sid text not null,
  name text check (name in ('LCP', 'CLS', 'INP', 'TTFB')),
  value double precision,
  at timestamptz not null default now()
);

create index if not exists insights_at_idx on public.insights (at desc);

alter table public.insights enable row level security;

-- Only the Owner may read; nobody writes through RLS (service role bypasses it).
create policy "owner reads insights" on public.insights for select to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

-- ===== migrations/007_study_days.sql =====
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
