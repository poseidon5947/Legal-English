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
