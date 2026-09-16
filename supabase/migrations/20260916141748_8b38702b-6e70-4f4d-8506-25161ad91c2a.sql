ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS agency_name text,
  ADD COLUMN IF NOT EXISTS agency_phone_prefix text,
  ADD COLUMN IF NOT EXISTS agency_phone_number text,
  ADD COLUMN IF NOT EXISTS agency_email text,
  ADD COLUMN IF NOT EXISTS agency_contact_person text;