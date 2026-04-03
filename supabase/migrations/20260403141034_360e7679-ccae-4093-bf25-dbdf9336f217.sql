
-- Add columns to casting_roles
ALTER TABLE public.casting_roles
  ADD COLUMN IF NOT EXISTS phase text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS age_min integer,
  ADD COLUMN IF NOT EXISTS age_max integer,
  ADD COLUMN IF NOT EXISTS budget numeric,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS required_skills text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS notes text;

-- Create role_talents table
CREATE TABLE public.role_talents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  casting_role_id uuid NOT NULL REFERENCES public.casting_roles(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'shortlisted',
  status_changed_at timestamp with time zone NOT NULL DEFAULT now(),
  added_by_user_id uuid,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(casting_role_id, profile_id)
);

-- Enable RLS
ALTER TABLE public.role_talents ENABLE ROW LEVEL SECURITY;

-- Owners/admins can manage all role_talents
CREATE POLICY "Owners can manage role talents"
  ON public.role_talents
  FOR ALL
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_role_talents_updated_at
  BEFORE UPDATE ON public.role_talents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
