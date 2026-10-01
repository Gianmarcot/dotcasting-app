CREATE POLICY "Staff can update guardians"
ON public.guardians
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));