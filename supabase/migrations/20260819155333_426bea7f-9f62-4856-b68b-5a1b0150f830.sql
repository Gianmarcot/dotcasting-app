create index if not exists communications_unread_by_talent_idx
  on public.communications (talent_user_id)
  where read_at is null;

create or replace function public.mark_messages_read(message_ids uuid[])
returns void
language sql
security definer
set search_path = public
as $$
  update public.communications
     set read_at = now()
   where id = any(coalesce(message_ids, '{}'::uuid[]))
     and talent_user_id = auth.uid()
     and read_at is null;
$$;

revoke all on function public.mark_messages_read(uuid[]) from public, anon;
grant execute on function public.mark_messages_read(uuid[]) to authenticated;