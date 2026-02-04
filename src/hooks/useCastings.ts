import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type CastingWithRelations = Tables<"castings"> & {
  company: { id: string; name: string } | null;
  applications: { count: number }[];
};

export type CastingFilters = {
  status?: string;
  search?: string;
};

export const useCastings = (filters?: CastingFilters) => {
  return useQuery({
    queryKey: ["owner-castings", filters],
    queryFn: async () => {
      let query = supabase
        .from("castings")
        .select(`
          *,
          company:companies(id, name),
          applications(count)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as CastingWithRelations[];
    },
  });
};

export const useCompanies = () => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateCasting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (casting: TablesInsert<"castings">) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("castings")
        .insert({
          ...casting,
          created_by_user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-castings"] });
    },
  });
};

export const useUpdateCasting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"castings"> & { id: string }) => {
      const { data, error } = await supabase
        .from("castings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-castings"] });
    },
  });
};

export const useUpdateCastingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("castings")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-castings"] });
    },
  });
};

export const useDeleteCasting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("castings")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-castings"] });
    },
  });
};
