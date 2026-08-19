create or replace function public.casting_is_active(_casting_id uuid)
returns boolean language sql stable security invoker set search_path = public as $$
  select exists (select 1 from public.castings c where c.id = _casting_id and c.status = 'active')
$$;

revoke execute on function public.talent_can_view_casting(uuid) from anon;
revoke execute on function public.talent_can_view_casting_role(uuid) from anon;