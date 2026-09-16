UPDATE public.talent_attributes
SET underwear_sizes = jsonb_strip_nulls(
      COALESCE(underwear_sizes, '{}'::jsonb)
      || jsonb_build_object('cup', upper(trim(underwear_sizes->>'bra')), 'bra', NULL)
    )
WHERE underwear_sizes ? 'bra'
  AND upper(trim(underwear_sizes->>'bra')) ~ '^[A-F]$';