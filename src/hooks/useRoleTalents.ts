import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type RoleTalentStatus =
  | "shortlisted"
  | "invited"
  | "confirmed_talent"
  | "sent_to_company"
  | "confirmed_company"
  | "rejected_company"
  | "rejected_talent";

export const ROLE_TALENT_STATUSES: { value: RoleTalentStatus; label: string; color: string }[] = [
  { value: "shortlisted", label: "In shortlist", color: "bg-muted text-muted-foreground" },
  { value: "invited", label: "Invito inviato", color: "bg-blue-100 text-blue-700" },
  { value: "confirmed_talent", label: "Confermato dal talent", color: "bg-amber-100 text-amber-700" },
  { value: "sent_to_company", label: "Inviato all'azienda", color: "bg-purple-100 text-purple-700" },
  { value: "confirmed_company", label: "Confermato dall'azienda", color: "bg-emerald-100 text-emerald-700" },
  { value: "rejected_company", label: "Scartato dall'azienda", color: "bg-red-100 text-red-700" },
  { value: "rejected_talent", label: "Rifiutato dal talent", color: "bg-orange-100 text-orange-700" },
];

export const TALENT_FLOW_STEPS = [
  "shortlisted",
  "invited",
  "confirmed_talent",
  "sent_to_company",
  "confirmed_company",
] as const;

export type RoleTalentWithProfile = Tables<"role_talents"> & {
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

export const useUpdateRoleTalentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, roleId }: { id: string; status: RoleTalentStatus; roleId: string }) => {
      const { data, error } = await supabase
        .from("role_talents")
        .update({ status, status_changed_at: new Date().toISOString() })
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
