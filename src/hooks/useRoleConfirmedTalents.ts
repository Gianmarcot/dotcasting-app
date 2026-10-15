import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RoleTalentRow {
  roleTalentId: string;
  profileId: string;
  name: string;
  photoUrl: string | null;
  excluded: boolean;
  engaged: boolean;
}

/**
 * All role talents for a casting role, with exclusion and engagement flags.
 * Single fetch; consumers can filter client-side.
 */
export const useRoleTalentsForRound = (roleId: string | undefined, enabled = true) =>
  useQuery({
    queryKey: ["role-talents-for-round", roleId],
    enabled: !!roleId && enabled,
    queryFn: async (): Promise<RoleTalentRow[]> => {
      const { data, error } = await supabase
        .from("role_talents")
        .select(`
          id, excluded, published_to_talent,
          profile:profiles!role_talents_profile_id_fkey(
            id, first_name, last_name, stage_name, profile_photo_url
          )
        `)
        .eq("casting_role_id", roleId!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? [])
        .filter((r: any) => r.profile)
        .map((r: any) => ({
          roleTalentId: r.id,
          profileId: r.profile.id,
          name:
            r.profile.stage_name?.trim() ||
            [r.profile.first_name, r.profile.last_name].filter(Boolean).join(" ").trim() ||
            "Senza nome",
          photoUrl: r.profile.profile_photo_url ?? null,
          excluded: !!r.excluded,
          engaged: !!r.published_to_talent,
        }));
    },
  });

