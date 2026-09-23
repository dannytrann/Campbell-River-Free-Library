-- Photos no longer wait for moderation: they publish immediately and admins
-- can take one down afterwards (status -> 'rejected') from /admin/moderate.

drop policy if exists "signed-in users upload pending photos" on public.photos;

create policy "signed-in users upload photos" on public.photos for insert to authenticated
  with check (uploaded_by = auth.uid() and status in ('pending', 'approved'));

-- Anything already waiting in the queue goes live.
update public.photos set status = 'approved' where status = 'pending';
