import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TalentMedia {
  id: string;
  url: string;
  media_type: string;
  title: string | null;
  thumbnail_url: string | null;
  sort_order: number;
  category: string;
}

export const useTalentMediaByProfileId = (profileId: string | null) => {
  return useQuery({
    // select ridotta: cache separata dagli hook che leggono tutte le colonne.
    queryKey: ["talent-media", profileId, "lite"],
    queryFn: async () => {
      if (!profileId) return [];

      const { data, error } = await supabase
        .from("talent_media")
        .select("id, url, media_type, title, thumbnail_url, sort_order, category")
        .eq("profile_id", profileId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as TalentMedia[];
    },
    enabled: !!profileId,
  });
};
