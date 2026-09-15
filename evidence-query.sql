with maria as (select id from public.users where lower(email) = 'law.pcruz@gmail.com')
select 'progress' as kind, p.term_id as k1, p.state as k2, p.attempts::text as k3, p.favourite::text as k4, p.updated_at::text as k5, null::text as k6
from public.user_term_progress p, maria where p.user_id = maria.id
union all
select 'study_day', sd.day::text, sd.opened::text, sd.attempts::text, sd.correct::text, sd.saved::text, sd.updated_at::text
from public.study_days sd, maria where sd.user_id = maria.id
union all
select 'auth_log', a.created_at::text, a.payload->>'action', a.payload->'traits'->>'provider', a.ip_address::text, left(coalesce(a.payload->>'user_agent',''),120), a.payload->>'actor_username'
from auth.audit_log_entries a
where a.created_at >= '2026-09-14 00:00:00+00'
  and (a.payload->>'actor_id' = (select id::text from maria) or a.payload->>'actor_username' = 'law.pcruz@gmail.com' or a.payload->'traits'->>'user_email' = 'law.pcruz@gmail.com' or a.payload->>'user_id' = (select id::text from maria))
union all
select 'sessions', s.created_at::text, s.updated_at::text, s.user_agent, s.ip::text, s.refreshed_at::text, s.id::text
from auth.sessions s, maria where s.user_id = maria.id
order by 1, 2;
