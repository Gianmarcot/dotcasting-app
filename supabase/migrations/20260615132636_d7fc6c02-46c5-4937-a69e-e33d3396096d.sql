alter table public.casting_rounds
  add column if not exists casting_role_id uuid references public.casting_roles(id) on delete cascade,
  add column if not exists status text not null default 'draft',
  add column if not exists share_token text unique,
  add column if not exists shared_at timestamptz;

create index if not exists idx_rounds_role on public.casting_rounds(casting_role_id);