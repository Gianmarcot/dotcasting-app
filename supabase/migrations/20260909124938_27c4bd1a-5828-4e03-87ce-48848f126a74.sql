CREATE TABLE public.coming_soon_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT coming_soon_emails_email_unique UNIQUE (email)
);

GRANT INSERT ON public.coming_soon_emails TO anon;
GRANT ALL ON public.coming_soon_emails TO service_role;

ALTER TABLE public.coming_soon_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coming_soon_emails_anon_insert"
  ON public.coming_soon_emails
  FOR INSERT
  TO anon
  WITH CHECK (true);