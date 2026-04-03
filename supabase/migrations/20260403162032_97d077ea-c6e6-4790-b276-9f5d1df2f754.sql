-- Add email and vat_number columns to companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS vat_number text;

-- Create company_notes table for chronological notes
CREATE TABLE public.company_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_by_user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_notes ENABLE ROW LEVEL SECURITY;

-- Owners/admins can manage all company notes
CREATE POLICY "Owners can manage company notes"
  ON public.company_notes
  FOR ALL
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));