import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TalentMainPhoto {
  id: string;
  profile_id: string;
  url: string;
  thumbnail_url: string | null;
  sort_order: number | null;
}

/**
 * Fetch main_photos for a set of profile IDs in a single query.
 * Returns a map: profileId -> photos ordered by sort_order ASC.
 */
export const useTalentsMainPhotos = (profileIds: string[]) => {
  const sorted = [...profileIds].sort();
  return useQuery({
    queryKey: ["owner-talents-main-photos", sorted],
    enabled: sorted.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("talent_media")
        .select("id, profile_id, url, thumbnail_url, sort_order")
        .in("profile_id", sorted)
        .eq("media_type", "photo")
        .eq("category", "main_photos")
        .order("sort_order", { ascending: true });
      if (error) throw error;

      const map = new Map<string, TalentMainPhoto[]>();
      (data || []).forEach((row: any) => {
        const arr = map.get(row.profile_id) || [];
        arr.push(row);
        map.set(row.profile_id, arr);
      });
      return map;
    },
  });
};
