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
