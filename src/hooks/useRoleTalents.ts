import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type TalentStatus = "none" | "invited" | "confirmed" | "rejected";
export type CompanyStatus = "none" | "pending" | "proposed" | "confirmed" | "rejected";

export const TALENT_STATUS_OPTIONS: { value: TalentStatus; label: string; color: string }[] = [
  { value: "none", label: "—", color: "bg-muted text-muted-foreground" },
  { value: "invited", label: "Invitato", color: "bg-muted text-foreground" },
  { value: "confirmed", label: "Confermato", color: "bg-[#729128]/15 text-[#729128]" },
  { value: "rejected", label: "Rifiutato", color: "bg-[#A30A2B]/15 text-[#A30A2B]" },
];

export const COMPANY_STATUS_OPTIONS: { value: CompanyStatus; label: string; color: string }[] = [
  { value: "none", label: "—", color: "bg-muted text-muted-foreground" },
  { value: "pending", label: "In attesa", color: "bg-muted text-foreground" },
  { value: "proposed", label: "Proposto", color: "bg-muted text-foreground" },
  { value: "confirmed", label: "Confermato", color: "bg-[#729128]/15 text-[#729128]" },
  { value: "rejected", label: "Scartato", color: "bg-[#A30A2B]/15 text-[#A30A2B]" },
];

export type RoleTalentWithProfile = Tables<"role_talents"> & {
  talent_status: TalentStatus;
  company_status: CompanyStatus;
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    profile_photo_url: string | null;
    birth_date: string | null;
    city: string | null;
    gender: string | null;
  } | null;
};

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
            id, first_name, last_name, profile_photo_url, birth_date, city, gender
          )
        `)
        .eq("casting_role_id", roleId!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as RoleTalentWithProfile[];
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
          talent_status: "none",
          company_status: "none",
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

export const useUpdateRoleTalentTalentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, talentStatus, roleId }: { id: string; talentStatus: TalentStatus; roleId: string }) => {
      const { data, error } = await supabase
        .from("role_talents")
        .update({ talent_status: talentStatus, status_changed_at: new Date().toISOString() } as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { ...data, roleId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["role-talents", data.roleId] });
      queryClient.invalidateQueries({ queryKey: ["casting-roles"] });
    },
  });
};

export const useUpdateRoleTalentCompanyStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, companyStatus, roleId }: { id: string; companyStatus: CompanyStatus; roleId: string }) => {
      const { data, error } = await supabase
        .from("role_talents")
        .update({ company_status: companyStatus, status_changed_at: new Date().toISOString() } as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { ...data, roleId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["role-talents", data.roleId] });
      queryClient.invalidateQueries({ queryKey: ["casting-roles"] });
    },
  });
};

export const useRemoveRoleTalent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, roleId }: { id: string; roleId: string }) => {
      const { error } = await supabase
        .from("role_talents")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return { roleId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["role-talents", data.roleId] });
      queryClient.invalidateQueries({ queryKey: ["casting-roles"] });
    },
  });
};
