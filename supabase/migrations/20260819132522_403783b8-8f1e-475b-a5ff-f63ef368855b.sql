CREATE TABLE public.communications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  talent_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id uuid REFERENCES public.message_threads(id) ON DELETE SET NULL,
  message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  batch_id uuid,
  type text NOT NULL DEFAULT 'agency_message',
  title text NOT NULL,
  body text,
  severity text NOT NULL DEFAULT 'info',
  action_type text,
  action_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  deadline timestamp with time zone,
  response text,
  response_note text,
  responded_at timestamp with time zone,
  resolved_at timestamp with time zone,
  dedupe_key text,
  read_at timestamp with time zone,
  created_by_user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX communications_dedupe_uidx
  ON public.communications (talent_user_id, dedupe_key)
  WHERE dedupe_key IS NOT NULL;

CREATE INDEX communications_talent_idx ON public.communications (talent_user_id, created_at DESC);
CREATE INDEX communications_batch_idx ON public.communications (batch_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.communications TO authenticated;
GRANT ALL ON public.communications TO service_role;

ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Talent can view own communications"
  ON public.communications FOR SELECT TO authenticated
  USING (talent_user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "Talent can create own auto communications"
  ON public.communications FOR INSERT TO authenticated
  WITH CHECK (
    (talent_user_id = auth.uid() AND created_by_user_id IS NULL AND type <> 'agency_message')
    OR public.is_staff(auth.uid())
  );

CREATE POLICY "Talent can update own communications"
  ON public.communications FOR UPDATE TO authenticated
  USING (talent_user_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (talent_user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete communications"
  ON public.communications FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE TRIGGER update_communications_updated_at
  BEFORE UPDATE ON public.communications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'message',
  ADD COLUMN IF NOT EXISTS action_type text,
  ADD COLUMN IF NOT EXISTS action_payload jsonb NOT NULL DEFAULT '{}'::jsonb;