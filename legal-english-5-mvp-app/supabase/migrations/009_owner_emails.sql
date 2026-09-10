-- Promote the Owner's real Gmail (Hallazgos Hito A P01) and keep the
-- signup trigger assigning admin for the designated Owner emails.
-- Learners cannot self-promote: role is written only by this definer
-- function or by a service-role update in the app.

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  assigned_role public.app_role := 'learner';
begin
  if coalesce((new.raw_user_meta_data ->> 'privacy_accepted')::boolean, false) is not true then
    raise exception 'Registration requires accepting the data processing notice.' using errcode = '23514';
  end if;

  if lower(coalesce(new.email, '')) in ('pilarcruz640@gmail.com', 'pilar@mpclaw.studio') then
    assigned_role := 'admin';
  end if;

  insert into public.users (id, email, full_name, role, privacy_accepted_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    assigned_role,
    now()
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

update public.users
set role = 'admin', updated_at = now()
where lower(email) in ('pilarcruz640@gmail.com', 'pilar@mpclaw.studio')
  and role is distinct from 'admin';
