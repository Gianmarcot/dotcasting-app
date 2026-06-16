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
      set client_password_hash = extensions.crypt(p_password, extensions.gen_salt('bf', 10))
      where id = p_casting_id;
  end if;
end;
$$;

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
  if v_hash <> extensions.crypt(coalesce(p_password, ''), v_hash) then
    raise exception 'invalid_password';
  end if;

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