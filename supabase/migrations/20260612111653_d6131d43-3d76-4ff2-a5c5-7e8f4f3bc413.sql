
-- talent-media: owner/admin full write access
CREATE POLICY "Owners can upload any talent media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'talent-media'
  AND (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Owners can update any talent media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'talent-media'
  AND (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Owners can delete any talent media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'talent-media'
  AND (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'))
);

-- avatars: owner/admin full write access
CREATE POLICY "Owners can upload any avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Owners can update any avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Owners can delete any avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'))
);
