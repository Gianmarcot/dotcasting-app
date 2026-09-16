ALTER TABLE public.talent_attributes
  ADD COLUMN IF NOT EXISTS tattoos_detail text,
  ADD COLUMN IF NOT EXISTS food_allergies_detail text;