-- =====================================================================
-- DIU WAY — Together on the Way
-- Initial schema: departments, profiles, weekly_schedules, RLS, RPCs.
-- Safe to run once on a fresh Supabase project (SQL editor or CLI).
-- =====================================================================

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------

-- Normalise a department name into a comparison key.
-- "  Computer Science & Engineering " -> "computer science and engineering"
create or replace function public.normalize_department(p_name text)
returns text
language sql
immutable
as $$
  select nullif(
    trim(regexp_replace(
      regexp_replace(lower(replace(coalesce(p_name, ''), '&', ' and ')), '[^a-z0-9 ]', ' ', 'g'),
      '\s+', ' ', 'g')),
    '');
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- departments
-- ---------------------------------------------------------------------
create table if not exists public.departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(trim(name)) between 2 and 80),
  long_name   text,
  slug        text not null unique,                 -- normalised key, prevents duplicates
  aliases     text[] not null default '{}',         -- normalised alternative names
  is_custom   boolean not null default false,
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists departments_name_trgm_idx
  on public.departments using gin (name gin_trgm_ops);
create index if not exists departments_aliases_idx
  on public.departments using gin (aliases);

insert into public.departments (name, long_name, slug, aliases, is_custom) values
  ('CSE',          'Computer Science & Engineering', 'cse',
     array['computer science and engineering','computer science','cs'], false),
  ('SWE',          'Software Engineering',           'swe',
     array['software engineering','software eng','se'], false),
  ('Entrepreneur', 'Innovation & Entrepreneurship',  'entrepreneur',
     array['entrepreneurship','innovation and entrepreneurship','ent'], false),
  ('Pharmacy',     'Pharmacy',                       'pharmacy',
     array['pharm','b pharm','bpharm'], false),
  ('NFE',          'Nutrition & Food Engineering',   'nfe',
     array['nutrition and food engineering','food engineering'], false)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- profiles (one row per auth user — never duplicated)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  full_name      text not null check (char_length(trim(full_name)) between 2 and 80),
  department_id  uuid not null references public.departments (id) on delete restrict,
  is_sample      boolean not null default false,   -- true only for dev seed data
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists profiles_full_name_trgm_idx
  on public.profiles using gin (full_name gin_trgm_ops);
create index if not exists profiles_full_name_lower_idx
  on public.profiles (lower(full_name));
create index if not exists profiles_department_idx
  on public.profiles (department_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- weekly_schedules (one row per user per class day)
-- Times are stored as 24h "HH:MM" strings for the fixed DIU bus slots.
-- ---------------------------------------------------------------------
create table if not exists public.weekly_schedules (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  day_of_week     text not null check (day_of_week in
                    ('saturday','sunday','monday','tuesday','wednesday','thursday')),
  going_time      text check (going_time in ('07:00','08:30','10:00','12:00')),
  returning_time  text check (returning_time in ('11:15','13:20','15:00','16:20','18:10')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint weekly_schedules_user_day_unique unique (user_id, day_of_week),
  constraint weekly_schedules_has_a_time check (going_time is not null or returning_time is not null)
);

create index if not exists weekly_schedules_day_idx       on public.weekly_schedules (day_of_week);
create index if not exists weekly_schedules_going_idx     on public.weekly_schedules (day_of_week, going_time);
create index if not exists weekly_schedules_returning_idx on public.weekly_schedules (day_of_week, returning_time);
create index if not exists weekly_schedules_user_idx      on public.weekly_schedules (user_id);

drop trigger if exists weekly_schedules_set_updated_at on public.weekly_schedules;
create trigger weekly_schedules_set_updated_at
  before update on public.weekly_schedules
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.departments      enable row level security;
alter table public.profiles         enable row level security;
alter table public.weekly_schedules enable row level security;

-- departments: everyone signed in can read; inserts only through the
-- security-definer RPC below (no direct insert/update/delete policy).
drop policy if exists "departments readable by members" on public.departments;
create policy "departments readable by members"
  on public.departments for select
  to authenticated
  using (true);

-- profiles
drop policy if exists "profiles readable by members" on public.profiles;
create policy "profiles readable by members"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id and is_sample = false);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id and is_sample = false);

drop policy if exists "users delete own profile" on public.profiles;
create policy "users delete own profile"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

-- weekly_schedules
drop policy if exists "schedules readable by members" on public.weekly_schedules;
create policy "schedules readable by members"
  on public.weekly_schedules for select
  to authenticated
  using (true);

drop policy if exists "users insert own schedule" on public.weekly_schedules;
create policy "users insert own schedule"
  on public.weekly_schedules for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "users update own schedule" on public.weekly_schedules;
create policy "users update own schedule"
  on public.weekly_schedules for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users delete own schedule" on public.weekly_schedules;
create policy "users delete own schedule"
  on public.weekly_schedules for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Newer Supabase projects do not grant table access to the API roles by
-- default. Signed-in members need these grants; RLS above still limits
-- every write to the member's own rows.
grant usage on schema public to authenticated;
grant select on public.departments to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.weekly_schedules to authenticated;

-- Visitors who are not signed in get no table access at all.
revoke all on public.departments from anon;
revoke all on public.profiles from anon;
revoke all on public.weekly_schedules from anon;

-- ---------------------------------------------------------------------
-- RPC: resolve (or create) a department by free text.
-- Matches the normalised name OR any alias, so "software engineering"
-- resolves to SWE and "eee" / "EEE " collapse into one custom row.
-- ---------------------------------------------------------------------
create or replace function public.resolve_department(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug  text := public.normalize_department(p_name);
  v_clean text := regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g');
  v_id    uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if v_slug is null or char_length(v_clean) < 2 or char_length(v_clean) > 80 then
    raise exception 'Department name must be 2–80 characters' using errcode = '22023';
  end if;

  select id into v_id
  from public.departments
  where slug = v_slug or v_slug = any (aliases)
  limit 1;

  if v_id is not null then
    return v_id;
  end if;

  -- Title-case input typed all in lower case ("civil engineering" -> "Civil Engineering")
  if v_clean = lower(v_clean) then
    v_clean := initcap(v_clean);
  end if;

  insert into public.departments (name, slug, is_custom, created_by)
  values (v_clean, v_slug, true, auth.uid())
  on conflict (slug) do update set slug = excluded.slug
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.resolve_department(text) from public, anon;
grant execute on function public.resolve_department(text) to authenticated;

-- ---------------------------------------------------------------------
-- RPC: save the caller's profile + full week in ONE transaction.
-- Runs as the caller (security invoker) so every write still passes RLS.
-- p_schedule: [{"day":"sunday","going":"08:30","returning":"16:20"}, ...]
-- Days not present in p_schedule are removed (deactivated).
-- ---------------------------------------------------------------------
create or replace function public.save_my_schedule(
  p_full_name          text,
  p_department_id      uuid,
  p_custom_department  text,
  p_schedule           jsonb
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_dept uuid := p_department_id;
  v_days text[];
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_custom_department is not null and trim(p_custom_department) <> '' then
    v_dept := public.resolve_department(p_custom_department);
  end if;
  if v_dept is null then
    raise exception 'Please choose a department' using errcode = '22023';
  end if;

  insert into public.profiles (id, full_name, department_id)
  values (v_uid, regexp_replace(trim(p_full_name), '\s+', ' ', 'g'), v_dept)
  on conflict (id) do update
    set full_name = excluded.full_name,
        department_id = excluded.department_id;

  select coalesce(array_agg(e->>'day'), '{}')
    into v_days
  from jsonb_array_elements(coalesce(p_schedule, '[]'::jsonb)) e;

  delete from public.weekly_schedules
  where user_id = v_uid and not (day_of_week = any (v_days));

  insert into public.weekly_schedules (user_id, day_of_week, going_time, returning_time)
  select v_uid,
         e->>'day',
         nullif(e->>'going', ''),
         nullif(e->>'returning', '')
  from jsonb_array_elements(coalesce(p_schedule, '[]'::jsonb)) e
  on conflict (user_id, day_of_week) do update
    set going_time = excluded.going_time,
        returning_time = excluded.returning_time;
end;
$$;

revoke all on function public.save_my_schedule(text, uuid, text, jsonb) from public, anon;
grant execute on function public.save_my_schedule(text, uuid, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------
-- RPC: public, aggregate-only stats for the landing page.
-- Exposes counts only (no names), so visitors see live numbers.
-- ---------------------------------------------------------------------
create or replace function public.get_commute_stats(p_day text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'total_friends',   (select count(*) from public.profiles),
    'going_today',     (select count(*) from public.weekly_schedules
                          where day_of_week = p_day and going_time is not null),
    'returning_today', (select count(*) from public.weekly_schedules
                          where day_of_week = p_day and returning_time is not null),
    'popular_going',   (select going_time from public.weekly_schedules
                          where day_of_week = p_day and going_time is not null
                          group by going_time
                          order by count(*) desc, going_time asc
                          limit 1),
    'popular_going_count', (select count(*) from public.weekly_schedules
                          where day_of_week = p_day and going_time is not null
                          group by going_time
                          order by count(*) desc, going_time asc
                          limit 1)
  );
$$;

revoke all on function public.get_commute_stats(text) from public;
grant execute on function public.get_commute_stats(text) to anon, authenticated;
