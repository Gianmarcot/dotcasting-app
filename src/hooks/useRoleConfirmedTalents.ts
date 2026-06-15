import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ConfirmedTalentRow {
  roleTalentId: string;
  profileId: string;
  name: string;
  photoUrl: string | null;
}

/**
 * Role talents of a given casting role with company_status = 'confirmed'.
 * Joins profiles to surface name + main avatar.
 */
export const useRoleConfirmedTalents = (roleId: string | undefined, enabled = true) =>
  useQuery({
    queryKey: ["role-confirmed-talents", roleId],
    enabled: !!roleId && enabled,
    queryFn: async (): Promise<ConfirmedTalentRow[]> => {
      const { data, error } = await supabase
        .from("role_talents")
        .select(`
          id, company_status,
          profile:profiles!role_talents_profile_id_fkey(
            id, first_name, last_name, stage_name, profile_photo_url
          )
        `)
        .eq("casting_role_id", roleId!)
        .eq("company_status", "confirmed")
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
        }));
    },
  });
