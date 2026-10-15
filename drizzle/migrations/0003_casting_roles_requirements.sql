ALTER TABLE public.casting_roles ADD COLUMN IF NOT EXISTS requirements jsonb;
COMMENT ON COLUMN public.casting_roles.requirements IS 'Source of truth for role requirements: { values: <talent filters shape>, mandatory: { fieldKey: boolean } }. gender/age_min/age_max/required_skills are kept in sync as a mirror.';
UPDATE public.casting_roles SET requirements = jsonb_build_object(
  'values', jsonb_strip_nulls(jsonb_build_object(
    'gender', CASE WHEN gender IS NOT NULL AND gender <> '' AND gender <> 'any' THEN gender END,
    'ageMin', age_min,
    'ageMax', age_max,
    'skills', CASE WHEN required_skills IS NOT NULL AND cardinality(required_skills) > 0 THEN to_jsonb(required_skills) END
  )),
  'mandatory', jsonb_strip_nulls(jsonb_build_object(
    'gender', CASE WHEN gender IS NOT NULL AND gender <> '' AND gender <> 'any' THEN true END,
    'age', CASE WHEN age_min IS NOT NULL OR age_max IS NOT NULL THEN true END,
    'skills', CASE WHEN required_skills IS NOT NULL AND cardinality(required_skills) > 0 THEN true END
  ))
) WHERE requirements IS NULL;