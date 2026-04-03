
-- Add dual status columns to role_talents
ALTER TABLE public.role_talents 
  ADD COLUMN IF NOT EXISTS talent_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS company_status text NOT NULL DEFAULT 'none';

-- Migrate existing status values to new columns
UPDATE public.role_talents SET talent_status = 'invited' WHERE status = 'invited';
UPDATE public.role_talents SET talent_status = 'confirmed' WHERE status = 'confirmed_talent';
UPDATE public.role_talents SET talent_status = 'rejected' WHERE status = 'rejected_talent';
UPDATE public.role_talents SET company_status = 'proposed' WHERE status = 'sent_to_company';
UPDATE public.role_talents SET company_status = 'confirmed', talent_status = 'confirmed' WHERE status = 'confirmed_company';
UPDATE public.role_talents SET company_status = 'rejected', talent_status = 'confirmed' WHERE status = 'rejected_company';

-- Change default phase for casting_roles from 'draft' to 'talent_search'
ALTER TABLE public.casting_roles ALTER COLUMN phase SET DEFAULT 'talent_search';
