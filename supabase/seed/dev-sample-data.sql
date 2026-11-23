-- =====================================================================
-- DIU WAY — DEVELOPMENT-ONLY SAMPLE DATA
-- ---------------------------------------------------------------------
-- DO NOT run this on the production project your friends use.
-- Creates 14 fictional students (emails end in @sample.diuway.test,
-- no password, cannot sign in) flagged with profiles.is_sample = true.
-- Remove everything again with: supabase/seed/remove-sample-data.sql
-- =====================================================================

begin;

-- Custom departments (as if typed via "Other")
insert into public.departments (name, slug, is_custom) values
  ('EEE',                                'eee',                                true),
  ('Civil Engineering',                  'civil engineering',                  true),
  ('BBA',                                'bba',                                true),
  ('Multimedia and Creative Technology', 'multimedia and creative technology', true)
on conflict (slug) do nothing;

-- Fictional students
with students(n, full_name, dept_slug) as (
  values
    (1,  'Jaki Tahsin',        'swe'),
    (2,  'Nusrat Jahan',       'cse'),
    (3,  'Arif Hossain',       'cse'),
    (4,  'Tanvir Ahmed',       'swe'),
    (5,  'Sadia Islam',        'pharmacy'),
    (6,  'Rafiul Karim',       'entrepreneur'),
    (7,  'Mehjabin Chowdhury', 'nfe'),
    (8,  'Fahim Rahman',       'eee'),
    (9,  'Ishrat Sultana',     'bba'),
    (10, 'Shakib Hasan',       'civil engineering'),
    (11, 'Tasnim Akter',       'multimedia and creative technology'),
    (12, 'Mahmudul Hasan',     'cse'),
    (13, 'Raisa Anjum',        'swe'),
    (14, 'Zahid Hasan',        'pharmacy')
),
ids as (
  select n, full_name, dept_slug,
         ('5a000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid as id
  from students
),
users as (
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new
  )
  select '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated',
         'sample' || n || '@sample.diuway.test', '',
         now(), '{"provider":"email","providers":["email"]}', '{"sample":true}',
         now(), now(), '', '', '', ''
  from ids
  on conflict (id) do nothing
  returning id
)
insert into public.profiles (id, full_name, department_id, is_sample)
select i.id, i.full_name, d.id, true
from ids i
join public.departments d on d.slug = i.dept_slug
where exists (select 1 from users u where u.id = i.id)
   or exists (select 1 from auth.users au where au.id = i.id)
on conflict (id) do nothing;

-- Weekly schedules: (student, day, going, returning)
insert into public.weekly_schedules (user_id, day_of_week, going_time, returning_time)
select ('5a000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid, day, going, ret
from (values
  (1,  'saturday',  '07:00', '16:20'),
  (1,  'sunday',    '08:30', '15:00'),
  (1,  'tuesday',   '07:00', '13:20'),
  (1,  'wednesday', '10:00', '18:10'),
  (2,  'saturday',  '07:00', '13:20'),
  (2,  'sunday',    '08:30', '16:20'),
  (2,  'monday',    '08:30', '15:00'),
  (2,  'thursday',  '12:00', '18:10'),
  (3,  'sunday',    '08:30', null),
  (3,  'monday',    '07:00', '11:15'),
  (3,  'wednesday', '10:00', '16:20'),
  (4,  'saturday',  '08:30', '15:00'),
  (4,  'sunday',    '08:30', '15:00'),
  (4,  'monday',    '10:00', '16:20'),
  (4,  'tuesday',   '07:00', '13:20'),
  (4,  'wednesday', '08:30', '15:00'),
  (4,  'thursday',  '07:00', '11:15'),
  (5,  'saturday',  '10:00', '16:20'),
  (5,  'monday',    '12:00', '18:10'),
  (5,  'tuesday',   '08:30', '15:00'),
  (6,  'sunday',    '10:00', '16:20'),
  (6,  'tuesday',   '10:00', '15:00'),
  (6,  'thursday',  '08:30', '13:20'),
  (7,  'saturday',  '07:00', '13:20'),
  (7,  'monday',    '08:30', '16:20'),
  (7,  'wednesday', '07:00', '15:00'),
  (8,  'sunday',    '12:00', '18:10'),
  (8,  'tuesday',   null,    '16:20'),
  (8,  'thursday',  '10:00', '16:20'),
  (9,  'saturday',  '08:30', '15:00'),
  (9,  'monday',    '10:00', '13:20'),
  (9,  'wednesday', '08:30', '16:20'),
  (10, 'sunday',    '07:00', '13:20'),
  (10, 'monday',    '07:00', '15:00'),
  (10, 'thursday',  '08:30', '15:00'),
  (11, 'saturday',  '12:00', '18:10'),
  (11, 'tuesday',   '10:00', '16:20'),
  (11, 'wednesday', '12:00', '18:10'),
  (12, 'saturday',  '07:00', '11:15'),
  (12, 'sunday',    '10:00', '16:20'),
  (12, 'monday',    '08:30', '15:00'),
  (12, 'tuesday',   '08:30', '16:20'),
  (12, 'wednesday', '07:00', '13:20'),
  (12, 'thursday',  '10:00', '15:00'),
  (13, 'sunday',    '08:30', '13:20'),
  (13, 'wednesday', '08:30', '15:00'),
  (13, 'thursday',  '07:00', '13:20'),
  (14, 'saturday',  '08:30', '16:20'),
  (14, 'tuesday',   '12:00', '18:10'),
  (14, 'thursday',  '12:00', null)
) as s(n, day, going, ret)
on conflict (user_id, day_of_week) do nothing;

commit;
