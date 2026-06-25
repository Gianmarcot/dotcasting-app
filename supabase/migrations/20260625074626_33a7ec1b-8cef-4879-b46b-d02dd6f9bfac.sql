CREATE OR REPLACE FUNCTION public.confirm_round_selection(p_token text, p_password text, p_selected uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_round   public.casting_rounds%rowtype;
  v_role    public.casting_roles%rowtype;
  v_casting public.castings%rowtype;
  v_latest  uuid;
  v_hash    text;
  v_valid   uuid[];
  v_confirmed int;
  v_rejected  int;
  v_total int;
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

  select * into v_role from public.casting_roles where id = v_round.casting_role_id;
  select * into v_casting from public.castings where id = v_round.casting_id;

  if v_casting.client_password_hash is null then
    raise exception 'password_not_set';
  end if;
  v_hash := v_casting.client_password_hash;
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

  select count(*) into v_total
  from public.casting_round_talents
  where round_id = v_round.id;

  insert into public.notifications (user_id, type, payload_json)
  select ur.user_id,
         'round_selection_confirmed',
         jsonb_build_object(
           'round_id', v_round.id,
           'casting_id', v_casting.id,
           'casting_title', v_casting.title,
           'role_name', v_role.name,
           'confirmed', v_confirmed,
           'total', v_total
         )
  from public.user_roles ur
  where ur.role in ('owner','admin');

  return jsonb_build_object('ok', true, 'confirmed', v_confirmed, 'rejected', v_rejected);
end;
$function$;