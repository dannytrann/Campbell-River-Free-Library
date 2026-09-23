-- Audit follow-ups: badge threshold, private display names, cover-photo query.

-- ── "Full Tour Complete" needs a real tour ────────────────────────────────
-- Previously any visit counted as a full tour while only one library existed.
create or replace function public.award_badges(uid uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  visit_count int;
  total_libraries int;
  photo_count int;
  min_for_full_tour constant int := 8;
begin
  if uid is null then
    return;
  end if;

  select count(*) into visit_count
    from visits v join libraries l on l.id = v.library_id
   where v.user_id = uid and l.status = 'approved';
  select count(*) into total_libraries from libraries where status = 'approved';
  select count(*) into photo_count from photos where uploaded_by = uid and status = 'approved';

  if visit_count >= 1 then
    insert into badges (user_id, badge_type) values (uid, 'first_visit') on conflict do nothing;
  end if;
  if visit_count >= 5 then
    insert into badges (user_id, badge_type) values (uid, 'five_libraries') on conflict do nothing;
  end if;
  if total_libraries >= min_for_full_tour and visit_count >= total_libraries then
    insert into badges (user_id, badge_type) values (uid, 'full_tour') on conflict do nothing;
  end if;
  if photo_count >= 5 then
    insert into badges (user_id, badge_type) values (uid, 'photographer') on conflict do nothing;
  end if;
end;
$$;

-- Revoke any "full tour" badge handed out under the old rule.
delete from public.badges b
 where b.badge_type = 'full_tour'
   and (select count(*) from public.libraries where status = 'approved') < 8;

-- ── Don't derive display names from email addresses ───────────────────────
-- The old trigger used the part before the @, publishing it on the leaderboard.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

-- ── One cover photo per library, without hauling every row to the app ─────
create or replace function public.get_library_covers()
returns table (library_id uuid, image_url text)
language sql
stable
security definer set search_path = public
as $$
  select distinct on (p.library_id) p.library_id, p.image_url
    from photos p
    join libraries l on l.id = p.library_id
   where p.status = 'approved' and l.status = 'approved'
   order by p.library_id, p.created_at desc;
$$;

-- ── Photo uploads publish immediately (repeat of the previous migration,
--    kept idempotent so a single paste brings any database up to date) ────
drop policy if exists "signed-in users upload pending photos" on public.photos;
drop policy if exists "signed-in users upload photos" on public.photos;

create policy "signed-in users upload photos" on public.photos for insert to authenticated
  with check (uploaded_by = auth.uid() and status in ('pending', 'approved'));

update public.photos set status = 'approved' where status = 'pending';
