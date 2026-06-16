create extension if not exists pgcrypto;

alter table public.castings
  add column if not exists client_password_hash text;

-- Set / clear casting client password (staff only)
create or replace function public.set_casting_client_password(p_casting_id uuid, p_password text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_staff(auth.uid()) then
    raise exception 'forbidden';
  end if;
  if p_password is null or length(trim(p_password)) = 0 then
    update public.castings set client_password_hash = null where id = p_casting_id;
  else
    update public.castings
      set client_password_hash = crypt(p_password, gen_salt('bf', 10))
      where id = p_casting_id;
  end if;
end;
$$;

grant execute on function public.set_casting_client_password(uuid, text) to authenticated;

-- Status (boolean) of casting password (staff only)
create or replace function public.get_casting_client_password_status(p_casting_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v boolean;
begin
  if auth.uid() is null or not public.is_staff(auth.uid()) then
    raise exception 'forbidden';
  end if;
  select client_password_hash is not null into v from public.castings where id = p_casting_id;
  return coalesce(v, false);
end;
$$;

grant execute on function public.get_casting_client_password_status(uuid) to authenticated;

-- Client confirmation RPC (public, password-protected)
create or replace function public.confirm_round_selection(p_token text, p_password text, p_selected uuid[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_round   public.casting_rounds%rowtype;
  v_latest  uuid;
  v_hash    text;
  v_valid   uuid[];
  v_confirmed int;
  v_rejected  int;
begin
  if p_token is null or length(p_token) < 16 then
    raise exception 'invalid_link';
  end if;

  select * into v_round
  from public.casting_rounds
  where share_token = p_token and status = 'shared'
  limit 1;
  if not found then
    raise exception 'invalid_link';
  end if;

  select id into v_latest
  from public.casting_rounds
  where casting_role_id = v_round.casting_role_id
  order by created_at desc
  limit 1;
  if v_latest is distinct from v_round.id then
    raise exception 'round_locked';
  end if;

  select c.client_password_hash into v_hash
  from public.castings c where c.id = v_round.casting_id;
  if v_hash is null then
    raise exception 'password_not_set';
  end if;
  if v_hash <> crypt(coalesce(p_password, ''), v_hash) then
    raise exception 'invalid_password';
  end if;

  -- Restrict to role_talents actually included in this round
  select coalesce(array_agg(rt.id), '{}'::uuid[]) into v_valid
  from public.role_talents rt
  join public.casting_round_talents crt on crt.role_talent_id = rt.id
  where crt.round_id = v_round.id
    and rt.id = any(coalesce(p_selected, '{}'::uuid[]));

  update public.role_talents rt
    set company_status = 'confirmed', updated_at = now()
    from public.casting_round_talents crt
    where crt.round_id = v_round.id
      and crt.role_talent_id = rt.id
      and rt.id = any(v_valid);
  get diagnostics v_confirmed = row_count;

  update public.role_talents rt
    set company_status = 'rejected', updated_at = now()
    from public.casting_round_talents crt
    where crt.round_id = v_round.id
      and crt.role_talent_id = rt.id
      and not (rt.id = any(v_valid));
  get diagnostics v_rejected = row_count;

  return jsonb_build_object('ok', true, 'confirmed', v_confirmed, 'rejected', v_rejected);
end;
$$;

grant execute on function public.confirm_round_selection(text, text, uuid[]) to anon, authenticated;

-- Extend get_shared_round with is_latest_round, has_password, company_status per talent
create or replace function public.get_shared_round(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_round   public.casting_rounds%rowtype;
  v_role    public.casting_roles%rowtype;
  v_casting public.castings%rowtype;
  v_talents jsonb;
  v_branding jsonb;
  v_latest_id uuid;
  v_is_latest boolean;
  v_has_password boolean;
begin
  if p_token is null or length(p_token) < 16 then
    return '{}'::jsonb;
  end if;

  select * into v_round
  from public.casting_rounds
  where share_token = p_token and status = 'shared'
  limit 1;
  if not found then
    return '{}'::jsonb;
  end if;

  select * into v_role from public.casting_roles where id = v_round.casting_role_id;
  select * into v_casting from public.castings where id = v_round.casting_id;

  select id into v_latest_id
  from public.casting_rounds
  where casting_role_id = v_round.casting_role_id
  order by created_at desc
  limit 1;
  v_is_latest := (v_latest_id = v_round.id);
  v_has_password := (v_casting.client_password_hash is not null);

  select jsonb_build_object(
    'agency_name', agency_name,
    'agency_logo_url', agency_logo_url,
    'contact_email', contact_email
  ) into v_branding
  from public.app_settings where id = true;

  select coalesce(jsonb_agg(t order by t->>'role_talent_id'), '[]'::jsonb)
  into v_talents
  from (
    select jsonb_build_object(
      'role_talent_id', crt.role_talent_id,
      'pdf_path', crt.pdf_path,
      'company_status', rt.company_status,
      'profile', jsonb_build_object(
        'id', p.id,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'stage_name', p.stage_name,
        'gender', p.gender,
        'ethnicity', p.ethnicity,
        'birth_date', p.birth_date,
        'city', p.city,
        'country', p.country,
        'nationality', p.nationality,
        'work_cities', p.work_cities,
        'phone_prefix', p.phone_prefix,
        'phone_number', p.phone_number,
        'whatsapp_prefix', p.whatsapp_prefix,
        'whatsapp_number', p.whatsapp_number,
        'website_url', p.website_url,
        'contact_email', p.contact_email,
        'driving_licenses', p.driving_licenses,
        'travel_availability', p.travel_availability
      ),
      'attributes', to_jsonb(ta.*) - 'id' - 'profile_id' - 'created_at' - 'updated_at',
      'media', coalesce((
        select jsonb_agg(jsonb_build_object(
          'url', tm.url,
          'sort_order', tm.sort_order,
          'media_type', tm.media_type,
          'category', tm.category
        ) order by tm.sort_order)
        from public.talent_media tm
        where tm.profile_id = p.id
          and tm.media_type = 'photo'
          and coalesce(tm.category, 'main_photos') = 'main_photos'
      ), '[]'::jsonb)
    ) as t
    from public.casting_round_talents crt
    join public.role_talents rt    on rt.id = crt.role_talent_id
    join public.profiles p         on p.id = rt.talent_profile_id
    left join public.talent_attributes ta on ta.profile_id = p.id
    where crt.round_id = v_round.id
  ) sub;

  return jsonb_build_object(
    'round', jsonb_build_object(
      'id', v_round.id,
      'label', v_round.label,
      'field_preset', v_round.field_preset,
      'shared_at', v_round.shared_at
    ),
    'casting', jsonb_build_object('title', v_casting.title),
    'role', jsonb_build_object('name', v_role.name),
    'branding', coalesce(v_branding, '{}'::jsonb),
    'talents', v_talents,
    'is_latest_round', v_is_latest,
    'has_password', v_has_password
  );
end;
$$;