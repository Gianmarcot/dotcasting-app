create table if not exists public.signup_notice_throttle (
  email text primary key,
  last_sent_at timestamptz not null default now()
);

grant all on public.signup_notice_throttle to service_role;

alter table public.signup_notice_throttle enable row level security;

create or replace function public.auth_email_state(p_email text)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_confirmed timestamptz;
  v_found boolean := false;
begin
  select u.email_confirmed_at, true
    into v_confirmed, v_found
  from auth.users u
  where lower(u.email) = lower(trim(coalesce(p_email, '')))
  order by u.created_at desc
  limit 1;

  if not v_found then
    return 'none';
  end if;

  if v_confirmed is null then
    return 'unconfirmed';
  end if;

  return 'confirmed';
end;
$$;

revoke all on function public.auth_email_state(text) from public;
revoke all on function public.auth_email_state(text) from anon;
revoke all on function public.auth_email_state(text) from authenticated;
grant execute on function public.auth_email_state(text) to service_role;