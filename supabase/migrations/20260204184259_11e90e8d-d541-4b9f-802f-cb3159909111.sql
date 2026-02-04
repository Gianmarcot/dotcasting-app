-- Add updated_at column to casting_invitations table
ALTER TABLE public.casting_invitations
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Drop and recreate trigger to ensure it works correctly
DROP TRIGGER IF EXISTS update_casting_invitations_updated_at ON public.casting_invitations;

CREATE TRIGGER update_casting_invitations_updated_at
BEFORE UPDATE ON public.casting_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();