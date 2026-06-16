
-- 1) Expand avatars bucket admin storage policies to all staff roles (owner/admin/editor)
DROP POLICY IF EXISTS "Owners can upload any avatar" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update any avatar" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete any avatar" ON storage.objects;

CREATE POLICY "Staff can upload any avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can update any avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'avatars' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete any avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND public.is_staff(auth.uid()));
