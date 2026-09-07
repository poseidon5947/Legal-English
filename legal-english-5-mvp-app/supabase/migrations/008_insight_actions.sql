-- Landing funnel events (Landing Page Brief v1.0 §5 "measurement hooks").
-- Run after 007. Adds kind 'action' (name 'cta' | 'trial') and a short
-- placement label so the Owner can distinguish landing visits, primary CTA
-- clicks and trial starts. Still anonymous: no cookie, IP, UA or account id.

alter table public.insights drop constraint if exists insights_kind_check;
alter table public.insights add constraint insights_kind_check check (kind in ('view', 'vital', 'action'));

alter table public.insights drop constraint if exists insights_name_check;
alter table public.insights add constraint insights_name_check check (name in ('LCP', 'CLS', 'INP', 'TTFB', 'cta', 'trial'));

alter table public.insights add column if not exists label text check (label is null or char_length(label) <= 32);
