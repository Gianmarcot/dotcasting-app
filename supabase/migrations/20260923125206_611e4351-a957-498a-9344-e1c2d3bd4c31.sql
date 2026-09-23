ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_italian_fiscal_code boolean,
  ADD COLUMN IF NOT EXISTS fiscal_code_mismatch boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS fiscal_code_status text
  GENERATED ALWAYS AS (
    CASE
      WHEN has_italian_fiscal_code IS FALSE THEN 'none_italian'
      WHEN fiscal_code IS NULL OR btrim(fiscal_code) = '' THEN 'missing'
      WHEN fiscal_code_mismatch THEN 'mismatch'
      ELSE 'ok'
    END
  ) STORED;

CREATE INDEX IF NOT EXISTS profiles_fiscal_code_status_idx ON public.profiles (fiscal_code_status);

UPDATE public.profiles
   SET has_italian_fiscal_code = true
 WHERE has_italian_fiscal_code IS NULL
   AND fiscal_code IS NOT NULL
   AND btrim(fiscal_code) <> '';