-- =============================================
-- FASE 1: Tabelle per Target e Shortlist
-- =============================================

-- Tabella casting_targets: criteri di ricerca salvati per ogni casting
CREATE TABLE public.casting_targets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    casting_id UUID NOT NULL REFERENCES public.castings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    criteria_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by_user_id UUID
);

-- Tabella target_shortlist: talenti selezionati manualmente per ogni target
CREATE TABLE public.target_shortlist (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    target_id UUID NOT NULL REFERENCES public.casting_targets(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    added_by_user_id UUID,
    UNIQUE(target_id, profile_id)
);

-- Indici per performance
CREATE INDEX idx_casting_targets_casting_id ON public.casting_targets(casting_id);
CREATE INDEX idx_target_shortlist_target_id ON public.target_shortlist(target_id);
CREATE INDEX idx_target_shortlist_profile_id ON public.target_shortlist(profile_id);

-- Enable RLS
ALTER TABLE public.casting_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_shortlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies per casting_targets
CREATE POLICY "Owners can manage casting targets"
ON public.casting_targets FOR ALL
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

-- RLS Policies per target_shortlist
CREATE POLICY "Owners can manage shortlists"
ON public.target_shortlist FOR ALL
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

-- Trigger per updated_at
CREATE TRIGGER update_casting_targets_updated_at
BEFORE UPDATE ON public.casting_targets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();