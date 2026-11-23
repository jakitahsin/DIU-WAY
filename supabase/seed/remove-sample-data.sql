-- =====================================================================
-- DIU WAY — remove ALL development sample data.
-- Deletes the fictional auth users (cascades to profiles + schedules)
-- and any custom department nobody real is using any more.
-- =====================================================================

begin;

delete from auth.users
where email like '%@sample.diuway.test';

delete from public.profiles where is_sample = true;  -- belt and braces

delete from public.departments d
where d.is_custom = true
  and d.created_by is null
  and not exists (select 1 from public.profiles p where p.department_id = d.id);

commit;
