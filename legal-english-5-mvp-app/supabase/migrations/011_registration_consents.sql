-- Separate registration consents (Textos Web e Instrucciones de Implementación,
-- 14 Sep 2026, IMP-13 / IMP-18). The signup form now has three unchecked
-- boxes — Terms of Service (required), personal data processing (required)
-- and marketing (optional) — and each acceptance is kept with its own
-- timestamp so the account holds a durable record of what was agreed and when.
--
-- privacy_accepted_at (migration 003) keeps recording the data-processing
-- authorization. terms_accepted_at and marketing_opt_in_at are new.

alter table public.users
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists marketing_opt_in_at timestamptz;

grant update (full_name, disabled_at, privacy_accepted_at, terms_accepted_at, marketing_opt_in_at, updated_at) on public.users to authenticated;

-- Same trigger as 009 (Owner e-mails, trial row) plus the two new stamps read
-- from the signup metadata written by lib/store.supabase.ts register().
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  assigned_role public.app_role := 'learner';
begin
  if coalesce((new.raw_user_meta_data ->> 'privacy_accepted')::boolean, false) is not true then
    raise exception 'Registration requires accepting the personal data processing authorization.' using errcode = '23514';
  end if;

  if lower(coalesce(new.email, '')) in ('pilarcruz640@gmail.com', 'pilar@mpclaw.studio') then
    assigned_role := 'admin';
  end if;

  insert into public.users (id, email, full_name, role, privacy_accepted_at, terms_accepted_at, marketing_opt_in_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    assigned_role,
    now(),
    case when coalesce((new.raw_user_meta_data ->> 'terms_accepted')::boolean, false) then now() end,
    case when coalesce((new.raw_user_meta_data ->> 'marketing_opt_in')::boolean, false) then now() end
  )
  on conflict (id) do update
    set role = excluded.role
    where public.users.role is distinct from excluded.role
      and excluded.role = 'admin';

  insert into public.subscriptions (user_id, status, trial_started_at, trial_ends_at, provider)
  values (new.id, 'trialing', now(), now() + interval '7 days', 'mercadopago')
  on conflict (user_id) do nothing;

  return new;
end;
$$;
