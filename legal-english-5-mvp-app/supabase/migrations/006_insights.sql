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
