CREATE OR REPLACE FUNCTION public.auth_email_state(p_email text)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_confirmed timestamptz;
begin
  select u.email_confirmed_at
    into v_confirmed
  from auth.users u
  where lower(u.email) = lower(trim(coalesce(p_email, '')))
  order by u.created_at desc
  limit 1;

  if not found then
    return 'none';
  end if;

  if v_confirmed is null then
    return 'unconfirmed';
  end if;

  return 'confirmed';
end;
$function$;
REVOKE ALL ON FUNCTION public.auth_email_state(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auth_email_state(text) TO service_role;