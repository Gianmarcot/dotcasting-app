DROP POLICY IF EXISTS "Media is publicly viewable" ON public.talent_media;
CREATE POLICY "Owners and staff can view media" ON public.talent_media
FOR SELECT TO authenticated
USING (
  public.is_staff(auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = talent_media.profile_id AND p.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = talent_media.profile_id AND p.guardian_user_id = auth.uid())
);