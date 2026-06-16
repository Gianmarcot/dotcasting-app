DROP POLICY IF EXISTS "Owner/Admin can manage avatars branding" ON storage.objects;

CREATE POLICY "Owner/Admin can manage avatars branding"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'branding'
    AND (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'))
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'branding'
    AND (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'))
  );