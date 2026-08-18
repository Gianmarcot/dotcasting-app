import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";

export const useTalentAttributesByProfileId = (profileId: string | null | undefined) => {
  return useQuery({
    queryKey: ["talent-attributes", profileId],
    queryFn: async () => {
      if (!profileId) return null;

      const { data, error } = await supabase
        .from("talent_attributes")
        .select("*")
        .eq("profile_id", profileId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!profileId,
  });
};

export const useUpdateTalentAttributesByProfileId = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileId,
      attributes,
    }: {
      profileId: string;
      attributes: Omit<TablesUpdate<"talent_attributes">, "profile_id">;
    }) => {
      if (!profileId) throw new Error("Profile ID is required");

      // Check if attributes exist
      const { data: existing } = await supabase
        .from("talent_attributes")
        .select("id")
        .eq("profile_id", profileId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("talent_attributes")
          .update({ ...attributes, updated_at: new Date().toISOString() })
          .eq("profile_id", profileId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("talent_attributes")
          .insert({ profile_id: profileId, ...attributes });
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["talent-attributes", variables.profileId] });
      queryClient.invalidateQueries({ queryKey: ["talents"] });
    },
  });
};
