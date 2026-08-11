-- Policies for private bucket 'talent-documents'
-- Path convention: <user_id>/<filename>

CREATE POLICY "Talents can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'talent-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Talents can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'talent-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Talents can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'talent-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Talents can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'talent-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Staff can view talent documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'talent-documents'
  AND public.is_staff(auth.uid())
);

CREATE POLICY "Staff can manage talent documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'talent-documents'
  AND public.is_staff(auth.uid())
);

CREATE POLICY "Staff can update talent documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'talent-documents'
  AND public.is_staff(auth.uid())
);

CREATE POLICY "Staff can delete talent documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'talent-documents'
  AND public.is_staff(auth.uid())
);
