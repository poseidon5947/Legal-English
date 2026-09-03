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
