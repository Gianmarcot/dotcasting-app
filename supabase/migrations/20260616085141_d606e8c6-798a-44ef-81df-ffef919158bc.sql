
-- Helper: caller is owner or admin
CREATE OR REPLACE FUNCTION public.is_team_manager()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'owner')
$$;
GRANT EXECUTE ON FUNCTION public.is_team_manager() TO authenticated;

-- RLS: open invitations to owners too
DROP POLICY IF EXISTS "Admins manage invitations" ON public.team_invitations;
CREATE POLICY "Team managers manage invitations"
  ON public.team_invitations
  FOR ALL
  TO authenticated
  USING (public.is_team_manager())
  WITH CHECK (public.is_team_manager());

-- list_team_members
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
  WHERE ur.role IN ('owner','admin')
  ORDER BY u.created_at DESC;
END;
$$;

-- update_member_role
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
  IF p_new_role NOT IN ('owner','admin') THEN
    RAISE EXCEPTION 'Ruolo non valido';
  END IF;
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role = 'admin') INTO v_is_admin;
  IF v_is_admin AND p_new_role <> 'admin' THEN
    SELECT count(*) INTO v_admin_count FROM public.user_roles WHERE role = 'admin';
    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'Non puoi rimuovere l''ultimo Admin';
    END IF;
  END IF;
  DELETE FROM public.user_roles WHERE user_id = p_user_id AND role IN ('owner','admin');
  INSERT INTO public.user_roles (user_id, role) VALUES (p_user_id, p_new_role);
END;
$$;

-- remove_team_member
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
  DELETE FROM public.user_roles WHERE user_id = p_user_id AND role IN ('owner','admin');
END;
$$;
