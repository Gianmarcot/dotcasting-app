import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type ConfirmedTalentThumb = {
  profile: { id: string; first_name: string | null; last_name: string | null; profile_photo_url: string | null } | null;
};

export type CastingWithRelations = Tables<"castings"> & {
  company: { id: string; name: string } | null;
  applications: { count: number }[];
  confirmed_talents?: ConfirmedTalentThumb[];
};

export type CastingSort =
  | "recent"
  | "oldest"
  | "title_asc"
  | "title_desc"
  | "start_date"
  | "end_date"
  | "company"
  | "status";

export type CastingFilters = {
  status?: string;
  search?: string;
  sort?: CastingSort;
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
        `);

      const sort = filters?.sort ?? "recent";
      if (sort === "company") {
        query = query.order("name", { referencedTable: "companies", ascending: true, nullsFirst: false });
      } else if (sort === "status") {
        query = query.order("status", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const castings = (data ?? []) as CastingWithRelations[];
      const castingIds = castings.map((c) => c.id);
      if (castingIds.length === 0) return castings;

      // Fetch confirmed talents via casting_roles → role_talents
      const { data: roles } = await supabase
        .from("casting_roles")
        .select("id, casting_id")
        .in("casting_id", castingIds);

      const roleToCasting = new Map<string, string>();
      (roles ?? []).forEach((r: any) => roleToCasting.set(r.id, r.casting_id));
      const roleIds = Array.from(roleToCasting.keys());

      if (roleIds.length > 0) {
        const { data: rts } = await supabase
          .from("role_talents")
          .select("casting_role_id, profile:profiles!role_talents_profile_id_fkey(id, first_name, last_name, profile_photo_url)")
          .in("casting_role_id", roleIds);

        const byCasting = new Map<string, ConfirmedTalentThumb[]>();
        (rts ?? []).forEach((rt: any) => {
          const cid = roleToCasting.get(rt.casting_role_id);
          if (!cid) return;
          const arr = byCasting.get(cid) ?? [];
          arr.push({ profile: rt.profile });
          byCasting.set(cid, arr);
        });
        castings.forEach((c) => {
          c.confirmed_talents = byCasting.get(c.id) ?? [];
        });
      } else {
        castings.forEach((c) => (c.confirmed_talents = []));
      }

      return castings;
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
      queryClient.invalidateQueries({ queryKey: ["favorite-castings"] });
    },
  });
};

export const useToggleCastingFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { data, error } = await supabase
        .from("castings")
        .update({ is_favorite })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["owner-castings"] });
      queryClient.invalidateQueries({ queryKey: ["favorite-castings"] });
      queryClient.invalidateQueries({ queryKey: ["casting-detail", variables.id] });
    },
  });
};
