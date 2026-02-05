import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProfileById = (profileId: string | null | undefined) => {
  return useQuery({
    queryKey: ["profile", profileId],
    queryFn: async () => {
      if (!profileId) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });
};
