alter table public.profiles
  add column if not exists triaged_at timestamptz,
  add column if not exists is_shortlisted boolean not null default false;
create index if not exists profiles_triage_idx
  on public.profiles (created_at desc)
  where triaged_at is null;