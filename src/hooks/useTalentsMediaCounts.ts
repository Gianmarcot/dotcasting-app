import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TalentMediaCounts {
  photos: number;
  videos: number;
}

/**
 * Conteggio foto/video per un insieme di profili, in un'unica query.
 * Restituisce una mappa: profileId -> { photos, videos }.
 */
export const useTalentsMediaCounts = (profileIds: string[]) => {
  const sorted = [...profileIds].sort();
  return useQuery({
    queryKey: ["owner-talents-media-counts", sorted],
    enabled: sorted.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("talent_media")
        .select("profile_id, media_type")
        .in("profile_id", sorted);
      if (error) throw error;
      const map = new Map<string, TalentMediaCounts>();
      (data || []).forEach((r: any) => {
        const c = map.get(r.profile_id) || { photos: 0, videos: 0 };
        if (r.media_type === "photo") c.photos++;
        else if (r.media_type === "video") c.videos++;
        map.set(r.profile_id, c);
      });
      return map;
    },
  });
};
