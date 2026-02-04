-- Create talent_media table for storing portfolio photos and videos
CREATE TABLE public.talent_media (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    title TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_talent_media_profile_id ON public.talent_media(profile_id);
CREATE INDEX idx_talent_media_sort_order ON public.talent_media(profile_id, sort_order);

-- Enable Row Level Security
ALTER TABLE public.talent_media ENABLE ROW LEVEL SECURITY;

-- Public can view all media (for portfolio visibility)
CREATE POLICY "Media is publicly viewable"
ON public.talent_media
FOR SELECT
USING (true);

-- Users can insert their own media
CREATE POLICY "Users can insert their own media"
ON public.talent_media
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = talent_media.profile_id
        AND profiles.user_id = auth.uid()
    )
);

-- Users can update their own media
CREATE POLICY "Users can update their own media"
ON public.talent_media
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = talent_media.profile_id
        AND profiles.user_id = auth.uid()
    )
);

-- Users can delete their own media
CREATE POLICY "Users can delete their own media"
ON public.talent_media
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = talent_media.profile_id
        AND profiles.user_id = auth.uid()
    )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_talent_media_updated_at
BEFORE UPDATE ON public.talent_media
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for talent media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('talent-media', 'talent-media', true);

-- Storage policies for talent-media bucket
CREATE POLICY "Talent media is publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'talent-media');

CREATE POLICY "Users can upload their own talent media"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'talent-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own talent media"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'talent-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own talent media"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'talent-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);