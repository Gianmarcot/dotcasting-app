create or replace function public.talent_can_view_casting(_casting_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.role_talents rt
    join public.casting_roles cr on cr.id = rt.casting_role_id
    join public.profiles p on p.id = rt.profile_id
    where cr.casting_id = _casting_id
      and rt.published_to_talent = true
      and p.user_id = auth.uid()
  )
$$;

create or replace function public.talent_can_view_casting_role(_role_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.role_talents rt
    join public.profiles p on p.id = rt.profile_id
    where rt.casting_role_id = _role_id
      and rt.published_to_talent = true
      and p.user_id = auth.uid()
  )
$$;

create or replace function public.casting_is_active(_casting_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.castings c where c.id = _casting_id and c.status = 'active')
$$;

drop policy if exists "Talents can view castings of their published engagements" on public.castings;
create policy "Talents can view castings of their published engagements"
on public.castings for select to authenticated
using (public.talent_can_view_casting(id));

drop policy if exists "Talents can view roles of their published engagements" on public.casting_roles;
create policy "Talents can view roles of their published engagements"
on public.casting_roles for select to authenticated
using (public.talent_can_view_casting_role(id));

drop policy if exists "Casting roles follow casting visibility" on public.casting_roles;
create policy "Casting roles follow casting visibility"
on public.casting_roles for select
using (public.casting_is_active(casting_id));