import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RoundPreviewPhotos {
  photos: string[]; // up to 5 urls
  total: number;
}

/**
 * For each round id, fetch up to 5 profile photos of its talents,
 * plus the total number of talents (for the "+N" badge).
 */
export const useRoundPreviewPhotos = (roundIds: string[]) =>
  useQuery({
    queryKey: ["round-preview-photos", roundIds.slice().sort().join(",")],
    enabled: roundIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("casting_round_talents")
        .select(`
          round_id,
          role_talent:role_talents!casting_round_talents_role_talent_id_fkey(
            profile:profiles!role_talents_profile_id_fkey(profile_photo_url)
          )
        `)
        .in("round_id", roundIds);
      if (error) throw error;

      const map = new Map<string, RoundPreviewPhotos>();
      for (const id of roundIds) map.set(id, { photos: [], total: 0 });

      for (const row of (data ?? []) as any[]) {
        const entry = map.get(row.round_id);
        if (!entry) continue;
        entry.total += 1;
        const url = row.role_talent?.profile?.profile_photo_url;
        if (url && entry.photos.length < 5) entry.photos.push(url);
      }
      return map;
    },
  });
