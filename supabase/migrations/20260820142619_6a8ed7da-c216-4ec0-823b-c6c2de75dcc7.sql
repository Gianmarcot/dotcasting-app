-- 1. guardian_user_id su profiles
alter table public.profiles
  add column if not exists guardian_user_id uuid references auth.users(id) on delete set null;

comment on column public.profiles.user_id is
  'utente auth che gestisce il profilo; per i profili tutelati è il tutore, non il talent';
comment on column public.profiles.guardian_user_id is
  'valorizzata solo per i profili tutelati (minori). "Profilo tutelato" si deriva SOLO da guardian_user_id is not null.';
comment on constraint profiles_user_id_key on public.profiles is
  'un account auth possiede un solo profilo talent; un tutore ha quindi un account dedicato al minore. Rimuovere questo vincolo richiede logica di selezione profilo in tutta l''area talent.';

create index if not exists profiles_guardian_user_id_idx
  on public.profiles (guardian_user_id)
  where guardian_user_id is not null;

-- 2. tabella guardians
create table public.guardians (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  birth_date date,
  age_confirmed boolean not null default false,
  phone_prefix text,
  phone_number text,
  whatsapp_prefix text,
  whatsapp_number text,
  contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.guardians is
  'Dati del tutore. Il tutore non ha una riga in public.profiles: il profilo tutelato del minore è la riga profiles creata alla registrazione del suo account.';

grant select, insert, update, delete on public.guardians to authenticated;
grant all on public.guardians to service_role;

alter table public.guardians enable row level security;

create policy "Guardians can manage their own row"
  on public.guardians
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Staff can view guardians"
  on public.guardians
  for select
  to authenticated
  using (public.is_staff(auth.uid()));

create trigger guardians_updated_at
  before update on public.guardians
  for each row execute function public.update_updated_at_column();

-- 3. conversione al compimento dei 18 anni
create or replace function public.convert_guardian_profile_to_adult()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_profile public.profiles%rowtype;
  v_adult_since date;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_profile
  from public.profiles
  where user_id = auth.uid()
    and guardian_user_id is not null
  limit 1;

  if not found then
    raise exception 'not_a_guardian_profile';
  end if;

  if v_profile.birth_date is null then
    raise exception 'birth_date_missing';
  end if;

  v_adult_since := (v_profile.birth_date + interval '18 years')::date;

  if v_adult_since > current_date then
    raise exception 'not_yet_adult';
  end if;

  update public.profiles
     set guardian_user_id = null,
         age_confirmed = true,
         updated_at = now()
   where id = v_profile.id;

  insert into public.notifications (user_id, type, payload_json)
  select ur.user_id,
         'guardian_profile_converted',
         jsonb_build_object(
           'profile_id', v_profile.id,
           'first_name', v_profile.first_name,
           'last_name', v_profile.last_name,
           'adult_since', v_adult_since,
           'converted_at', now()
         )
  from public.user_roles ur
  where ur.role in ('owner','admin');

  return jsonb_build_object('ok', true, 'profile_id', v_profile.id, 'adult_since', v_adult_since);
end;
$$;