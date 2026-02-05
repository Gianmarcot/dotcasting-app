-- Create media_ratings table for owner ratings and tags
CREATE TABLE public.media_ratings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    media_id UUID NOT NULL REFERENCES public.talent_media(id) ON DELETE CASCADE,
    owner_user_id UUID NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    tags TEXT[] DEFAULT '{}'::text[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (media_id, owner_user_id)
);

-- Enable RLS
ALTER TABLE public.media_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only owners can manage their own ratings
CREATE POLICY "Owners can view their own ratings"
ON public.media_ratings
FOR SELECT
USING (
    auth.uid() = owner_user_id 
    AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Owners can insert their own ratings"
ON public.media_ratings
FOR INSERT
WITH CHECK (
    auth.uid() = owner_user_id 
    AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Owners can update their own ratings"
ON public.media_ratings
FOR UPDATE
USING (
    auth.uid() = owner_user_id 
    AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
)
WITH CHECK (
    auth.uid() = owner_user_id 
    AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Owners can delete their own ratings"
ON public.media_ratings
FOR DELETE
USING (
    auth.uid() = owner_user_id 
    AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Add trigger for updated_at
CREATE TRIGGER update_media_ratings_updated_at
BEFORE UPDATE ON public.media_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_media_ratings_media_id ON public.media_ratings(media_id);
CREATE INDEX idx_media_ratings_owner_user_id ON public.media_ratings(owner_user_id);