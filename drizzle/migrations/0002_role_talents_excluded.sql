ALTER TABLE public.role_talents ADD COLUMN IF NOT EXISTS excluded boolean NOT NULL DEFAULT false;
ALTER TABLE public.role_talents ADD COLUMN IF NOT EXISTS excluded_at timestamptz;
UPDATE public.role_talents SET excluded = true, excluded_at = COALESCE(status_changed_at, now()) WHERE company_status = 'rejected';
COMMENT ON COLUMN public.role_talents.talent_status IS 'DEPRECATED: no longer used by the app';
COMMENT ON COLUMN public.role_talents.company_status IS 'DEPRECATED: replaced by excluded';