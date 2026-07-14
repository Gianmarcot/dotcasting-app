import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RoundPreviewItem {
  photoUrl: string | null;
  name: string;
}

export interface RoundPreviewPhotos {
  items: RoundPreviewItem[];
  total: number;
  hasClientSelection: boolean;
  /** @deprecated kept for backwards compat */
  photos: string[];
}

/**
 * For each round id, fetch its talents (name + optional profile photo)
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
            company_status,
            profile:profiles!role_talents_profile_id_fkey(
              first_name, last_name, stage_name, profile_photo_url
            )
          )
        `)
        .in("round_id", roundIds);
      if (error) throw error;

      const map = new Map<string, RoundPreviewPhotos>();
      for (const id of roundIds) {
        map.set(id, { items: [], total: 0, hasClientSelection: false, photos: [] });
      }

      for (const row of (data ?? []) as any[]) {
        const entry = map.get(row.round_id);
        if (!entry) continue;
        const rt = row.role_talent;
        const p = rt?.profile;
        entry.total += 1;
        if (rt?.company_status === "confirmed") entry.hasClientSelection = true;
        const name =
          (p?.stage_name?.trim() as string) ||
          [p?.first_name, p?.last_name].filter(Boolean).join(" ").trim() ||
          "";
        const photoUrl = (p?.profile_photo_url as string) || null;
        entry.items.push({ photoUrl, name });
        if (photoUrl) entry.photos.push(photoUrl);
      }
      return map;
    },
  });

