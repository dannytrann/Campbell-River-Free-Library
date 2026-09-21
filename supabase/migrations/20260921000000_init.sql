-- Campbell River Little Library Map — initial schema
-- Run with `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ───────────────────────── profiles ─────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ───────────────────────── libraries ─────────────────────────
create type public.review_status as enum ('pending', 'approved', 'rejected');

create table public.libraries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  description text check (char_length(description) <= 2000),
  neighborhood text,
  icon text not null default 'book',          -- cute marker illustration key
  status public.review_status not null default 'pending',
  added_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index libraries_status_idx on public.libraries (status);

-- ───────────────────────── photos ─────────────────────────
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references public.libraries (id) on delete cascade,
  image_url text not null,            -- storage path of the optimized display image
  original_path text,                 -- storage path of the original upload
  uploaded_by uuid references public.profiles (id) on delete set null,
  caption text check (char_length(caption) <= 300),
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index photos_library_status_idx on public.photos (library_id, status);

-- ───────────────────────── visits ─────────────────────────
create table public.visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  library_id uuid not null references public.libraries (id) on delete cascade,
  visited_at timestamptz not null default now(),
  unique (user_id, library_id)
);

-- ───────────────────────── badges ─────────────────────────
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_type text not null check (badge_type in ('first_visit', 'five_libraries', 'full_tour', 'photographer')),
  earned_at timestamptz not null default now(),
  unique (user_id, badge_type)
);

-- ───────────────────────── badge logic ─────────────────────────
-- Awarded server-side by triggers so clients can never grant themselves badges.
create or replace function public.award_badges(uid uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  visit_count int;
  total_libraries int;
  photo_count int;
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
  if total_libraries > 0 and visit_count >= total_libraries then
    insert into badges (user_id, badge_type) values (uid, 'full_tour') on conflict do nothing;
  end if;
  if photo_count >= 5 then
    insert into badges (user_id, badge_type) values (uid, 'photographer') on conflict do nothing;
  end if;
end;
$$;

create or replace function public.on_visit_award()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform award_badges(new.user_id);
  return new;
end;
$$;

create trigger visits_award_badges
  after insert on public.visits
  for each row execute function public.on_visit_award();

create or replace function public.on_photo_award()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'approved' then
    perform award_badges(new.uploaded_by);
  end if;
  return new;
end;
$$;

create trigger photos_award_badges
  after insert or update of status on public.photos
  for each row execute function public.on_photo_award();

-- ───────────────────────── leaderboard ─────────────────────────
create or replace function public.get_leaderboard(max_rows int default 20)
returns table (user_id uuid, display_name text, avatar_url text, visit_count bigint, photo_count bigint, badge_count bigint)
language sql
stable
security definer set search_path = public
as $$
  select p.id,
         p.display_name,
         p.avatar_url,
         (select count(*) from visits v where v.user_id = p.id) as visit_count,
         (select count(*) from photos ph where ph.uploaded_by = p.id and ph.status = 'approved') as photo_count,
         (select count(*) from badges b where b.user_id = p.id) as badge_count
    from profiles p
   order by visit_count desc, photo_count desc, p.created_at asc
   limit least(greatest(max_rows, 1), 100);
$$;

-- ───────────────────────── row level security ─────────────────────────
alter table public.profiles  enable row level security;
alter table public.libraries enable row level security;
alter table public.photos    enable row level security;
alter table public.visits    enable row level security;
alter table public.badges    enable row level security;

-- profiles: public display names, users edit only their own (not is_admin)
create policy "profiles are public" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid()));

-- libraries: anyone sees approved ones; submitters see their own; admins see all
create policy "approved libraries are public" on public.libraries for select
  using (status = 'approved' or added_by = auth.uid() or public.is_admin());
create policy "signed-in users submit pending libraries" on public.libraries for insert to authenticated
  with check (added_by = auth.uid() and status = 'pending');
create policy "admins manage libraries" on public.libraries for update using (public.is_admin());
create policy "admins delete libraries" on public.libraries for delete using (public.is_admin());

-- photos: same pattern
create policy "approved photos are public" on public.photos for select
  using (status = 'approved' or uploaded_by = auth.uid() or public.is_admin());
create policy "signed-in users upload pending photos" on public.photos for insert to authenticated
  with check (uploaded_by = auth.uid() and status = 'pending');
create policy "admins moderate photos" on public.photos for update using (public.is_admin());
create policy "admins delete photos" on public.photos for delete using (public.is_admin());

-- visits: private to the visitor
create policy "users read own visits" on public.visits for select using (user_id = auth.uid());
create policy "users log own visits" on public.visits for insert to authenticated with check (user_id = auth.uid());
create policy "users remove own visits" on public.visits for delete using (user_id = auth.uid());

-- badges: readable by everyone (bragging rights), written only by award_badges()
create policy "badges are public" on public.badges for select using (true);

-- ───────────────────────── storage ─────────────────────────
insert into storage.buckets (id, name, public)
values ('library-photos', 'library-photos', false)
on conflict (id) do nothing;

-- Files live at <user_id>/<photo_id>/{original,display}.<ext>
create policy "users upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'library-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "read approved or own photos" on storage.objects for select
  using (
    bucket_id = 'library-photos' and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
      or exists (
        select 1 from public.photos p
         where p.status = 'approved'
           and (p.image_url = storage.objects.name or p.original_path = storage.objects.name)
      )
    )
  );

create policy "admins delete photo files" on storage.objects for delete
  using (bucket_id = 'library-photos' and public.is_admin());
