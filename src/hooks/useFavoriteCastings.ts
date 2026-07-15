import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FavoriteCasting = {
  id: string;
  title: string;
  status: string | null;
  favorite_order: number | null;
};

export const useFavoriteCastings = () => {
  return useQuery({
    queryKey: ["favorite-castings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("castings")
        .select("id, title, status, favorite_order, updated_at")
        .eq("is_favorite", true)
        .order("favorite_order", { ascending: true, nullsFirst: false })
        .order("updated_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as FavoriteCasting[];
    },
  });
};

export const useReorderFavoriteCastings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await Promise.all(
        orderedIds.map((id, index) =>
          supabase.from("castings").update({ favorite_order: index }).eq("id", id),
        ),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorite-castings"] });
    },
  });
};
