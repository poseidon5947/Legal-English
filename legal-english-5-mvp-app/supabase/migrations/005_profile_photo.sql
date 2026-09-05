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
