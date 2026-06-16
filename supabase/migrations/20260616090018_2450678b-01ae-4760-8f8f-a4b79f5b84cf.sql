
-- Helper: staff = admin OR owner OR editor (full content access, no team mgmt)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id,'admin')
      OR public.has_role(_user_id,'owner')
      OR public.has_role(_user_id,'editor')
$$;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;

-- Recreate every policy that gated owner/admin so editor is included too.
-- app_settings
DROP POLICY IF EXISTS "owner/admin insert settings" ON public.app_settings;
CREATE POLICY "staff insert settings" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "owner/admin update settings" ON public.app_settings;
CREATE POLICY "staff update settings" ON public.app_settings FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- applications
DROP POLICY IF EXISTS "Owners can manage all applications" ON public.applications;
CREATE POLICY "Staff can manage all applications" ON public.applications FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- audition_bookings
DROP POLICY IF EXISTS "Owners can manage bookings" ON public.audition_bookings;
CREATE POLICY "Staff can manage bookings" ON public.audition_bookings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- audition_events
DROP POLICY IF EXISTS "Owners can manage audition events" ON public.audition_events;
CREATE POLICY "Staff can manage audition events" ON public.audition_events FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- audition_slots
DROP POLICY IF EXISTS "Owners can manage slots" ON public.audition_slots;
CREATE POLICY "Staff can manage slots" ON public.audition_slots FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- casting_invitations
DROP POLICY IF EXISTS "Owners can manage invitations" ON public.casting_invitations;
CREATE POLICY "Staff can manage invitations" ON public.casting_invitations FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- casting_roles
DROP POLICY IF EXISTS "Owners can manage casting roles" ON public.casting_roles;
CREATE POLICY "Staff can manage casting roles" ON public.casting_roles FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- casting_round_talents
DROP POLICY IF EXISTS "Owners manage casting round talents" ON public.casting_round_talents;
CREATE POLICY "Staff manage casting round talents" ON public.casting_round_talents FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- casting_rounds
DROP POLICY IF EXISTS "Owners manage casting rounds" ON public.casting_rounds;
CREATE POLICY "Staff manage casting rounds" ON public.casting_rounds FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- casting_targets
DROP POLICY IF EXISTS "Owners can manage casting targets" ON public.casting_targets;
CREATE POLICY "Staff can manage casting targets" ON public.casting_targets FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- castings
DROP POLICY IF EXISTS "Owners can manage all castings" ON public.castings;
CREATE POLICY "Staff can manage all castings" ON public.castings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- companies
DROP POLICY IF EXISTS "Owners can manage companies" ON public.companies;
CREATE POLICY "Staff can manage companies" ON public.companies FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- company_notes
DROP POLICY IF EXISTS "Owners can manage company notes" ON public.company_notes;
CREATE POLICY "Staff can manage company notes" ON public.company_notes FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- media_ratings (per-user; expand staff check)
DROP POLICY IF EXISTS "Owners can view their own ratings" ON public.media_ratings;
CREATE POLICY "Staff can view their own ratings" ON public.media_ratings FOR SELECT TO authenticated USING (auth.uid() = owner_user_id AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Owners can insert their own ratings" ON public.media_ratings;
CREATE POLICY "Staff can insert their own ratings" ON public.media_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_user_id AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Owners can update their own ratings" ON public.media_ratings;
CREATE POLICY "Staff can update their own ratings" ON public.media_ratings FOR UPDATE TO authenticated USING (auth.uid() = owner_user_id AND public.is_staff(auth.uid())) WITH CHECK (auth.uid() = owner_user_id AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Owners can delete their own ratings" ON public.media_ratings;
CREATE POLICY "Staff can delete their own ratings" ON public.media_ratings FOR DELETE TO authenticated USING (auth.uid() = owner_user_id AND public.is_staff(auth.uid()));

-- message_participants
DROP POLICY IF EXISTS "Owners can manage participants" ON public.message_participants;
CREATE POLICY "Staff can manage participants" ON public.message_participants FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- message_threads
DROP POLICY IF EXISTS "Owners can view all threads" ON public.message_threads;
CREATE POLICY "Staff can view all threads" ON public.message_threads FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- messages
DROP POLICY IF EXISTS "Owners can manage messages" ON public.messages;
CREATE POLICY "Staff can manage messages" ON public.messages FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- profiles
DROP POLICY IF EXISTS "Owners can view all profiles" ON public.profiles;
CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Owners can update all profiles" ON public.profiles;
CREATE POLICY "Staff can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- role_talents
DROP POLICY IF EXISTS "Owners can manage role talents" ON public.role_talents;
CREATE POLICY "Staff can manage role talents" ON public.role_talents FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- talent_attributes
DROP POLICY IF EXISTS "Owners can view all attributes" ON public.talent_attributes;
CREATE POLICY "Staff can view all attributes" ON public.talent_attributes FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Owners can insert talent attributes" ON public.talent_attributes;
CREATE POLICY "Staff can insert talent attributes" ON public.talent_attributes FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Owners can update talent attributes" ON public.talent_attributes;
CREATE POLICY "Staff can update talent attributes" ON public.talent_attributes FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- talent_media (editor CAN delete content media; account deletion is separate)
DROP POLICY IF EXISTS "Owners can insert media for any talent" ON public.talent_media;
CREATE POLICY "Staff can insert media for any talent" ON public.talent_media FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Owners can update all media" ON public.talent_media;
CREATE POLICY "Staff can update all media" ON public.talent_media FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Owners can delete all media" ON public.talent_media;
CREATE POLICY "Staff can delete all media" ON public.talent_media FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- target_shortlist
DROP POLICY IF EXISTS "Owners can manage shortlists" ON public.target_shortlist;
CREATE POLICY "Staff can manage shortlists" ON public.target_shortlist FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- user_roles stays admin-only (team management) — no change.

-- Team management RPCs: allow editor as assignable role; include editors in list.
CREATE OR REPLACE FUNCTION public.list_team_members()
RETURNS TABLE(user_id uuid, email text, role app_role, created_at timestamptz, last_sign_in_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_team_manager() THEN
    RAISE EXCEPTION 'Non hai i permessi per visualizzare i membri del team';
  END IF;
  RETURN QUERY
  SELECT u.id, u.email::text, ur.role, u.created_at, u.last_sign_in_at
  FROM auth.users u
  JOIN public.user_roles ur ON ur.user_id = u.id
  WHERE ur.role IN ('owner','admin','editor')
  ORDER BY u.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_member_role(p_user_id uuid, p_new_role app_role)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_admin_count int;
  v_is_admin boolean;
BEGIN
  IF NOT public.is_team_manager() THEN
    RAISE EXCEPTION 'Non hai i permessi per modificare i ruoli';
  END IF;
  IF p_new_role NOT IN ('owner','admin','editor') THEN
    RAISE EXCEPTION 'Ruolo non valido';
  END IF;
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role = 'admin') INTO v_is_admin;
  IF v_is_admin AND p_new_role <> 'admin' THEN
    SELECT count(*) INTO v_admin_count FROM public.user_roles WHERE role = 'admin';
    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'Non puoi rimuovere l''ultimo Admin';
    END IF;
  END IF;
  DELETE FROM public.user_roles WHERE user_id = p_user_id AND role IN ('owner','admin','editor');
  INSERT INTO public.user_roles (user_id, role) VALUES (p_user_id, p_new_role);
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_team_member(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_admin_count int;
  v_is_admin boolean;
BEGIN
  IF NOT public.is_team_manager() THEN
    RAISE EXCEPTION 'Non hai i permessi per rimuovere membri';
  END IF;
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Non puoi rimuovere te stesso';
  END IF;
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role = 'admin') INTO v_is_admin;
  IF v_is_admin THEN
    SELECT count(*) INTO v_admin_count FROM public.user_roles WHERE role = 'admin';
    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'Non puoi rimuovere l''ultimo Admin';
    END IF;
  END IF;
  DELETE FROM public.user_roles WHERE user_id = p_user_id AND role IN ('owner','admin','editor');
END;
$$;
