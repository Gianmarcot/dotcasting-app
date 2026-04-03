import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type CastingRole = Tables<"casting_roles"> & {
  role_talents_count?: number;
};

export const useCastingRoles = (castingId: string | undefined) => {
  return useQuery({
    queryKey: ["casting-roles", castingId],
    enabled: !!castingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("casting_roles")
        .select("*, role_talents(count)")
        .eq("casting_id", castingId!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        role_talents_count: r.role_talents?.[0]?.count ?? 0,
      })) as CastingRole[];
    },
  });
};

export const useCastingRole = (roleId: string | undefined) => {
  return useQuery({
    queryKey: ["casting-role", roleId],
    enabled: !!roleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("casting_roles")
        .select("*")
        .eq("id", roleId!)
        .single();

      if (error) throw error;
      return data as Tables<"casting_roles">;
    },
  });
};

export const useCreateCastingRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (role: TablesInsert<"casting_roles">) => {
      const { data, error } = await supabase
        .from("casting_roles")
        .insert(role)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["casting-roles", data.casting_id] });
    },
  });
};

export const useUpdateCastingRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"casting_roles"> & { id: string }) => {
      const { data, error } = await supabase
        .from("casting_roles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["casting-roles", data.casting_id] });
      queryClient.invalidateQueries({ queryKey: ["casting-role", data.id] });
    },
  });
};

export const useDeleteCastingRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, castingId }: { id: string; castingId: string }) => {
      const { error } = await supabase
        .from("casting_roles")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return { castingId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["casting-roles", data.castingId] });
    },
  });
};
