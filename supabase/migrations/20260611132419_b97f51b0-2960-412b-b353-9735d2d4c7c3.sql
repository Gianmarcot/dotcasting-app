
-- RLS policies for casting_rounds and casting_round_talents
CREATE POLICY "Owners manage casting rounds"
ON public.casting_rounds FOR ALL
USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners manage casting round talents"
ON public.casting_round_talents FOR ALL
USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.casting_rounds TO authenticated;
GRANT ALL ON public.casting_rounds TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.casting_round_talents TO authenticated;
GRANT ALL ON public.casting_round_talents TO service_role;

-- Storage policies for casting-pdfs bucket (private, owners/admins only)
CREATE POLICY "Owners can read casting pdfs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'casting-pdfs'
  AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Owners can upload casting pdfs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'casting-pdfs'
  AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Owners can update casting pdfs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'casting-pdfs'
  AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Owners can delete casting pdfs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'casting-pdfs'
  AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);
