CREATE OR REPLACE FUNCTION public.storage_upload_allowed(_bucket text, _name text, _mime text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _bucket
    WHEN 'talent-documents' THEN lower(storage.extension(_name)) IN ('pdf','jpg','jpeg','png')
      AND coalesce(lower(_mime), '') IN ('', 'application/pdf','image/jpeg','image/png')
    WHEN 'avatars' THEN lower(storage.extension(_name)) IN ('jpg','jpeg','png','webp')
      AND coalesce(lower(_mime), '') IN ('', 'image/jpeg','image/png','image/webp')
    WHEN 'talent-media' THEN lower(storage.extension(_name)) IN ('jpg','jpeg','png','webp','mp4','mov','webm')
      AND coalesce(lower(_mime), '') IN ('', 'image/jpeg','image/png','image/webp','video/mp4','video/quicktime','video/webm')
    ELSE true END
$$;

CREATE POLICY "Allowed file types on insert" ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (public.storage_upload_allowed(bucket_id, name, metadata->>'mimetype'));
CREATE POLICY "Allowed file types on update" ON storage.objects AS RESTRICTIVE FOR UPDATE TO authenticated
WITH CHECK (public.storage_upload_allowed(bucket_id, name, metadata->>'mimetype'));