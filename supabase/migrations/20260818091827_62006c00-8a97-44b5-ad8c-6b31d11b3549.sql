ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_confirmed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS passport_country text,
  ADD COLUMN IF NOT EXISTS vat_activity_type text,
  ADD COLUMN IF NOT EXISTS vat_regime text,
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS bank_account_holder text,
  ADD COLUMN IF NOT EXISTS iban text,
  ADD COLUMN IF NOT EXISTS education_level text,
  ADD COLUMN IF NOT EXISTS education_field text,
  ADD COLUMN IF NOT EXISTS cv_url text,
  ADD COLUMN IF NOT EXISTS has_car boolean,
  ADD COLUMN IF NOT EXISTS has_motorbike boolean,
  ADD COLUMN IF NOT EXISTS has_band boolean;

ALTER TABLE public.talent_attributes
  ADD COLUMN IF NOT EXISTS has_food_allergies boolean,
  ADD COLUMN IF NOT EXISTS language_levels jsonb DEFAULT '{}'::jsonb;