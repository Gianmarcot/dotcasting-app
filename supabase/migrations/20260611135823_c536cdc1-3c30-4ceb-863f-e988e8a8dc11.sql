
-- Fix 1: Remove broad public SELECT policy on profiles (exposes sensitive PII to anon).
-- Profile reading remains available to: the user themselves, and owners/admins.
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;

-- Fix 2: Lock down SECURITY DEFINER functions so they cannot be invoked via the Data API
-- (RLS policies and triggers continue to call them via internal Postgres mechanics).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
