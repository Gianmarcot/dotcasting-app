import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

export const useTalentAttributes = () => {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ["talent-attributes", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from("talent_attributes")
        .select("*")
        .eq("profile_id", profile.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!profile?.id,
  });
};

export const useUpdateTalentAttributes = () => {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async (attributes: {
      height?: number | null;
      weight?: number | null;
      hair_color?: string | null;
      eye_color?: string | null;
      skills?: string[] | null;
      languages?: string[] | null;
    }) => {
      if (!profile?.id) throw new Error("Profile not found");

      // Check if attributes exist
      const { data: existing } = await supabase
        .from("talent_attributes")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("talent_attributes")
          .update({ ...attributes, updated_at: new Date().toISOString() })
          .eq("profile_id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("talent_attributes")
          .insert({ profile_id: profile.id, ...attributes });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-attributes"] });
    },
  });
};
