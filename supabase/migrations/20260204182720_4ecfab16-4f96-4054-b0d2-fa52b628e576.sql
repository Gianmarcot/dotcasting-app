-- Create casting_invitations table
CREATE TABLE public.casting_invitations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    casting_id UUID NOT NULL REFERENCES public.castings(id) ON DELETE CASCADE,
    talent_user_id UUID NOT NULL,
    invited_by_user_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    responded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(casting_id, talent_user_id)
);

-- Enable RLS
ALTER TABLE public.casting_invitations ENABLE ROW LEVEL SECURITY;

-- Owners/admins can manage all invitations
CREATE POLICY "Owners can manage invitations"
ON public.casting_invitations
FOR ALL
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

-- Talents can view their own invitations
CREATE POLICY "Talents can view their invitations"
ON public.casting_invitations
FOR SELECT
USING (auth.uid() = talent_user_id);

-- Talents can update their own invitations (to accept/decline)
CREATE POLICY "Talents can respond to invitations"
ON public.casting_invitations
FOR UPDATE
USING (auth.uid() = talent_user_id)
WITH CHECK (auth.uid() = talent_user_id);

-- Add updated_at trigger
CREATE TRIGGER update_casting_invitations_updated_at
BEFORE UPDATE ON public.casting_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_casting_invitations_talent ON public.casting_invitations(talent_user_id);
CREATE INDEX idx_casting_invitations_casting ON public.casting_invitations(casting_id);