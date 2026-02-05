import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

// Type for criteria_json structure
export interface TargetCriteria {
  gender?: string[];
  age_min?: number;
  age_max?: number;
  cities?: string[];
  categories?: string[];
  height_min?: number;
  height_max?: number;
  hair_colors?: string[];
  eye_colors?: string[];
  skills?: string[];
  languages?: string[];
  has_tattoos?: boolean;
  has_piercings?: boolean;
}

export interface CastingTarget {
  id: string;
  casting_id: string;
  name: string;
  description: string | null;
  criteria_json: TargetCriteria;
  created_at: string;
  updated_at: string;
  created_by_user_id: string | null;
}

export interface CreateTargetInput {
  casting_id: string;
  name: string;
  description?: string;
  criteria_json: TargetCriteria;
}

export interface UpdateTargetInput {
  id: string;
  name?: string;
  description?: string;
  criteria_json?: TargetCriteria;
}

// Fetch all targets for a specific casting
export const useTargets = (castingId: string | null) => {
  return useQuery({
    queryKey: ["casting-targets", castingId],
    queryFn: async () => {
      if (!castingId) return [];
      
      const { data, error } = await supabase
        .from("casting_targets")
        .select("*")
        .eq("casting_id", castingId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(target => ({
        ...target,
        criteria_json: (target.criteria_json as TargetCriteria) || {}
      })) as CastingTarget[];
    },
    enabled: !!castingId,
  });
};

// Fetch all targets (grouped by casting)
export const useAllTargets = () => {
  return useQuery({
    queryKey: ["all-casting-targets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("casting_targets")
        .select(`
          *,
          casting:castings(id, title, status)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(target => ({
        ...target,
        criteria_json: (target.criteria_json as TargetCriteria) || {}
      }));
    },
  });
};

// Create a new target
export const useCreateTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTargetInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("casting_targets")
        .insert({
          casting_id: input.casting_id,
          name: input.name,
          description: input.description || null,
          criteria_json: input.criteria_json as unknown as Json,
          created_by_user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["casting-targets", variables.casting_id] });
      queryClient.invalidateQueries({ queryKey: ["all-casting-targets"] });
    },
  });
};

// Update a target
export const useUpdateTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTargetInput) => {
      const updates: Record<string, unknown> = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.description !== undefined) updates.description = input.description;
      if (input.criteria_json !== undefined) updates.criteria_json = input.criteria_json as unknown as Json;
      
      const { data, error } = await supabase
        .from("casting_targets")
        .update(updates)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["casting-targets"] });
      queryClient.invalidateQueries({ queryKey: ["all-casting-targets"] });
    },
  });
};

// Delete a target
export const useDeleteTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetId: string) => {
      const { error } = await supabase
        .from("casting_targets")
        .delete()
        .eq("id", targetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["casting-targets"] });
      queryClient.invalidateQueries({ queryKey: ["all-casting-targets"] });
    },
  });
};
