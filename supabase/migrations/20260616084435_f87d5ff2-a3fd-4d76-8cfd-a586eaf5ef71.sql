
-- Team invitations table
CREATE TABLE public.team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role app_role NOT NULL CHECK (role IN ('owner','admin')),
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked','expired')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX team_invitations_email_pending_idx
  ON public.team_invitations (lower(email))
  WHERE status = 'pending';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_invitations TO authenticated;
GRANT ALL ON public.team_invitations TO service_role;

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage invitations"
  ON public.team_invitations
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER team_invitations_updated_at
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public RPC: get invitation by token (for accept page)
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v jsonb;
BEGIN
  IF p_token IS NULL OR length(p_token) < 16 THEN
    RETURN '{}'::jsonb;
  END IF;
  SELECT jsonb_build_object(
    'email', email,
    'role', role,
    'status', CASE
      WHEN status = 'pending' AND expires_at < now() THEN 'expired'
      ELSE status
    END,
    'expires_at', expires_at
  ) INTO v
  FROM public.team_invitations
  WHERE token = p_token
  LIMIT 1;
  RETURN COALESCE(v, '{}'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(text) TO anon, authenticated;

-- Admin RPC: list team members
CREATE OR REPLACE FUNCTION public.list_team_members()
RETURNS TABLE(user_id uuid, email text, role app_role, created_at timestamptz, last_sign_in_at timestamptz)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Solo gli Admin possono visualizzare i membri del team';
  END IF;

  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email::text AS email,
    ur.role,
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  JOIN public.user_roles ur ON ur.user_id = u.id
  WHERE ur.role IN ('owner','admin')
  ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_team_members() TO authenticated;

-- Admin RPC: update member role
CREATE OR REPLACE FUNCTION public.update_member_role(p_user_id uuid, p_new_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_count int;
  v_is_admin boolean;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Solo gli Admin possono modificare i ruoli';
  END IF;

  IF p_new_role NOT IN ('owner','admin') THEN
    RAISE EXCEPTION 'Ruolo non valido';
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role = 'admin')
    INTO v_is_admin;

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

GRANT EXECUTE ON FUNCTION public.update_member_role(uuid, app_role) TO authenticated;

-- Admin RPC: remove team member
CREATE OR REPLACE FUNCTION public.remove_team_member(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_count int;
  v_is_admin boolean;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Solo gli Admin possono rimuovere membri';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Non puoi rimuovere te stesso';
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role = 'admin')
    INTO v_is_admin;

  IF v_is_admin THEN
    SELECT count(*) INTO v_admin_count FROM public.user_roles WHERE role = 'admin';
    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'Non puoi rimuovere l''ultimo Admin';
    END IF;
  END IF;

  DELETE FROM public.user_roles WHERE user_id = p_user_id AND role IN ('owner','admin');
END;
$$;

GRANT EXECUTE ON FUNCTION public.remove_team_member(uuid) TO authenticated;
