ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stage_name text,
  ADD COLUMN IF NOT EXISTS birth_country text,
  ADD COLUMN IF NOT EXISTS birth_region text,
  ADD COLUMN IF NOT EXISTS birth_province text,
  ADD COLUMN IF NOT EXISTS birth_city text,
  ADD COLUMN IF NOT EXISTS gender_identity text;