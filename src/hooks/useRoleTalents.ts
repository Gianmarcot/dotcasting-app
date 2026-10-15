import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type RoleTalentWithProfile = Tables<"role_talents"> & {
  profile: {
    id: string;
    user_id: string | null;
    first_name: string | null;
    last_name: string | null;
    stage_name?: string | null;
    profile_photo_url: string | null;
    birth_date: string | null;
    city: string | null;
    gender: string | null;
    has_italian_fiscal_code: boolean | null;
    fiscal_code: string | null;
    fiscal_code_mismatch: boolean | null;
    fiscal_code_status: string | null;
    talent_attributes?: { skills: string[] | null }[] | { skills: string[] | null } | null;
  } | null;
};

/** Competenze del profilo (la relazione può arrivare come oggetto o array). */
export const profileSkills = (p: RoleTalentWithProfile["profile"]): string[] => {
  const a = p?.talent_attributes;
  if (!a) return [];
  return (Array.isArray(a) ? a[0]?.skills : a.skills) ?? [];
};

/** Ingaggiato = ingaggio pubblicato al talent. */
export const isEngaged = (rt: Pick<RoleTalentWithProfile, "published_to_talent">) => !!rt.published_to_talent;

export const useRoleTalents = (roleId: string | undefined) => {
  return useQuery({
    queryKey: ["role-talents", roleId],
    enabled: !!roleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_talents")
        .select(`
          *,
          profile:profiles!role_talents_profile_id_fkey(
            id, user_id, first_name, last_name, stage_name, profile_photo_url, birth_date, city, gender,
            has_italian_fiscal_code, fiscal_code, fiscal_code_mismatch, fiscal_code_status,
            talent_attributes(skills)
          )
        `)
        .eq("casting_role_id", roleId!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as unknown as RoleTalentWithProfile[];
    },
  });
};

export const useAddRoleTalent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ castingRoleId, profileId }: { castingRoleId: string; profileId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("role_talents")
        .insert({
          casting_role_id: castingRoleId,
          profile_id: profileId,
          added_by_user_id: user?.id,
          status: "shortlisted",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["role-talents", data.casting_role_id] });
      queryClient.invalidateQueries({ queryKey: ["casting-roles"] });
    },
  });
};

export const useSetRoleTalentsExcluded = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, excluded }: { ids: string[]; excluded: boolean; roleId: string }) => {
      const { error } = await supabase
        .from("role_talents")
        .update({ excluded, excluded_at: excluded ? new Date().toISOString() : null })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["role-talents", vars.roleId] });
      queryClient.invalidateQueries({ queryKey: ["role-talents-for-round", vars.roleId] });
      queryClient.invalidateQueries({ queryKey: ["casting-role-talents"] });
    },
  });
};

export const useRemoveRoleTalent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, roleId }: { id: string; roleId: string }) => {
      const { error } = await supabase.from("role_talents").delete().eq("id", id);
      if (error) throw error;
      return { roleId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["role-talents", data.roleId] });
      queryClient.invalidateQueries({ queryKey: ["casting-roles"] });
    },
  });
};
