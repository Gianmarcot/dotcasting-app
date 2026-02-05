import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MediaRating {
  id: string;
  media_id: string;
  owner_user_id: string;
  rating: number | null;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaveRatingParams {
  mediaId: string;
  rating?: number | null;
  tags?: string[];
  notes?: string | null;
}

// Suggested tags for owners
export const SUGGESTED_TAGS = {
  style: ["Fashion", "Beauty", "Commercial", "Editorial", "Runway", "Sporty", "Casual", "Glamour"],
  technique: ["Portrait", "Full-body", "Close-up", "Profile", "Action", "Lifestyle"],
  environment: ["Studio", "Outdoor", "Indoor", "Urban", "Nature", "Beach"],
  quality: ["Top Pick", "Portfolio", "Social", "Web Only"],
};

export const ALL_SUGGESTED_TAGS = [
  ...SUGGESTED_TAGS.style,
  ...SUGGESTED_TAGS.technique,
  ...SUGGESTED_TAGS.environment,
  ...SUGGESTED_TAGS.quality,
];

// Hook to get rating for a single media
export const useMediaRating = (mediaId: string | null) => {
  return useQuery({
    queryKey: ["media-rating", mediaId],
    queryFn: async () => {
      if (!mediaId) return null;

      const { data, error } = await supabase
        .from("media_ratings")
        .select("*")
        .eq("media_id", mediaId)
        .maybeSingle();

      if (error) throw error;
      return data as MediaRating | null;
    },
    enabled: !!mediaId,
  });
};

// Hook to get all ratings for a profile's media
export const useMediaRatingsForProfile = (profileId: string | null) => {
  return useQuery({
    queryKey: ["media-ratings-profile", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      // First get all media IDs for this profile
      const { data: mediaItems, error: mediaError } = await supabase
        .from("talent_media")
        .select("id")
        .eq("profile_id", profileId);

      if (mediaError) throw mediaError;
      if (!mediaItems || mediaItems.length === 0) return [];

      const mediaIds = mediaItems.map((m) => m.id);

      // Then get all ratings for those media
      const { data: ratings, error: ratingsError } = await supabase
        .from("media_ratings")
        .select("*")
        .in("media_id", mediaIds);

      if (ratingsError) throw ratingsError;
      return (ratings || []) as MediaRating[];
    },
    enabled: !!profileId,
  });
};

// Hook to save/update a rating
export const useSaveMediaRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mediaId, rating, tags, notes }: SaveRatingParams) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Non autenticato");

      // Check if rating exists
      const { data: existing } = await supabase
        .from("media_ratings")
        .select("id")
        .eq("media_id", mediaId)
        .eq("owner_user_id", userData.user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("media_ratings")
          .update({
            rating,
            tags: tags || [],
            notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data as MediaRating;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("media_ratings")
          .insert({
            media_id: mediaId,
            owner_user_id: userData.user.id,
            rating,
            tags: tags || [],
            notes,
          })
          .select()
          .single();

        if (error) throw error;
        return data as MediaRating;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["media-rating", data.media_id] });
      queryClient.invalidateQueries({ queryKey: ["media-ratings-profile"] });
    },
  });
};

// Hook to delete a rating
export const useDeleteMediaRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaId: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Non autenticato");

      const { error } = await supabase
        .from("media_ratings")
        .delete()
        .eq("media_id", mediaId)
        .eq("owner_user_id", userData.user.id);

      if (error) throw error;
    },
    onSuccess: (_, mediaId) => {
      queryClient.invalidateQueries({ queryKey: ["media-rating", mediaId] });
      queryClient.invalidateQueries({ queryKey: ["media-ratings-profile"] });
    },
  });
};
