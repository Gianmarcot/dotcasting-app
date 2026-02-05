-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Add index for faster message queries
CREATE INDEX IF NOT EXISTS idx_messages_thread_id_created ON public.messages(thread_id, created_at DESC);