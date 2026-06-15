import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type RoleTalentStatus = "none" | "invited" | "confirmed" | "rejected" | "pending" | string;

export interface RoleTalentRow {
  roleTalentId: string;
  profileId: string;
  name: string;
  photoUrl: string | null;
  talentStatus: RoleTalentStatus;
  companyStatus: RoleTalentStatus;
}

// Backwards-compatible alias kept for components that only need the confirmed subset.
export interface ConfirmedTalentRow {
  roleTalentId: string;
  profileId: string;
  name: string;
  photoUrl: string | null;
}

/**
 * All role talents for a casting role, including talent_status and company_status.
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
          id, talent_status, company_status,
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
          talentStatus: (r.talent_status ?? "none") as RoleTalentStatus,
          companyStatus: (r.company_status ?? "none") as RoleTalentStatus,
        }));
    },
  });

/**
 * Subset filtered to company_status = 'confirmed'. Preserved for existing consumers.
 */
export const useRoleConfirmedTalents = (roleId: string | undefined, enabled = true) => {
  const q = useRoleTalentsForRound(roleId, enabled);
  return {
    ...q,
    data: (q.data ?? []).filter((r) => r.companyStatus === "confirmed") as ConfirmedTalentRow[],
  };
};
