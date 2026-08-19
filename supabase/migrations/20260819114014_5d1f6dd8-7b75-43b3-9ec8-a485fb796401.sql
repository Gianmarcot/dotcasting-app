ALTER TABLE public.castings
  ADD COLUMN IF NOT EXISTS call_datetime timestamptz,
  ADD COLUMN IF NOT EXISTS venue_name text,
  ADD COLUMN IF NOT EXISTS venue_address text,
  ADD COLUMN IF NOT EXISTS talent_instructions text,
  ADD COLUMN IF NOT EXISTS show_client_to_talent boolean NOT NULL DEFAULT false;

ALTER TABLE public.role_talents
  ADD COLUMN IF NOT EXISTS published_to_talent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS talent_opened_at timestamptz;

GRANT SELECT ON public.role_talents TO authenticated;
GRANT SELECT ON public.casting_roles TO authenticated;
GRANT SELECT ON public.castings TO authenticated;

CREATE POLICY "Talents can view their published engagements"
ON public.role_talents FOR SELECT TO authenticated
USING (
  published_to_talent = true
  AND profile_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
);

CREATE POLICY "Talents can view roles of their published engagements"
ON public.casting_roles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.role_talents rt
    JOIN public.profiles p ON p.id = rt.profile_id
    WHERE rt.casting_role_id = casting_roles.id
      AND rt.published_to_talent = true
      AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Talents can view castings of their published engagements"
ON public.castings FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.role_talents rt
    JOIN public.casting_roles cr ON cr.id = rt.casting_role_id
    JOIN public.profiles p ON p.id = rt.profile_id
    WHERE cr.casting_id = castings.id
      AND rt.published_to_talent = true
      AND p.user_id = auth.uid()
  )
);

CREATE OR REPLACE FUNCTION public.mark_engagement_opened(p_role_talent_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.role_talents rt
     SET talent_opened_at = COALESCE(rt.talent_opened_at, now())
   WHERE rt.id = p_role_talent_id
     AND rt.published_to_talent = true
     AND rt.profile_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid());
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_engagement_opened(uuid) TO authenticated;