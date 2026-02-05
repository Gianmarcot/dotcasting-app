-- Policy UPDATE per profiles (owner/admin)
CREATE POLICY "Owners can update all profiles"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Policy INSERT per talent_attributes (per owner)
CREATE POLICY "Owners can insert talent attributes"
ON public.talent_attributes FOR INSERT
WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Policy UPDATE per talent_attributes (per owner) 
CREATE POLICY "Owners can update talent attributes"
ON public.talent_attributes FOR UPDATE
USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Policy DELETE per talent_media (per owner)
CREATE POLICY "Owners can delete all media"
ON public.talent_media FOR DELETE
USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Policy INSERT per talent_media (per owner)
CREATE POLICY "Owners can insert media for any talent"
ON public.talent_media FOR INSERT
WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Policy UPDATE per talent_media (per owner)
CREATE POLICY "Owners can update all media"
ON public.talent_media FOR UPDATE
USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));