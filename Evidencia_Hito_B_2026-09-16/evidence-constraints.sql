-- Evidencia de restricción y RLS (sólo lectura). Ejecutar en el SQL Editor de Supabase.
select
  (select count(*) from pg_constraint where conname = 'progress_mastered_requires_correct_quiz') as mastered_check_exists,   -- esperado 1
  (select convalidated from pg_constraint where conname = 'progress_mastered_requires_correct_quiz') as validated_legacy,  -- esperado false (NOT VALID por diseño)
  (select relrowsecurity from pg_class where relname = 'quiz_attempts') as ledger_rls,                                      -- esperado true
  (select string_agg(policyname || ' [' || cmd || ']', '; ') from pg_policies where tablename = 'quiz_attempts') as policies, -- esperado 2 políticas: SELECT e INSERT
  (select count(*) from pg_policies where tablename = 'quiz_attempts' and cmd in ('UPDATE','DELETE')) as update_delete_policies; -- esperado 0

-- Prueba negativa: debe fallar con 23514 "progress_mastered_requires_correct_quiz". Se deshace sola.
begin;
insert into public.user_term_progress (user_id, term_id, state, attempts, favourite)
select id, 'CON-001', 'mastered', 0, false from public.users limit 1;
rollback;
