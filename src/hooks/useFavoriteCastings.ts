import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FavoriteCasting = {
  id: string;
  title: string;
  status: string | null;
};

export const useFavoriteCastings = () => {
  return useQuery({
    queryKey: ["favorite-castings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("castings")
        .select("id, title, status")
        .eq("is_favorite", true)
        .order("updated_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as FavoriteCasting[];
    },
  });
};
