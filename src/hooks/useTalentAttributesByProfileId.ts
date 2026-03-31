import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

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
      attributes: {
        height?: number | null;
        weight?: number | null;
        hair_color?: string | null;
        eye_color?: string | null;
        skills?: string[] | null;
        languages?: string[] | null;
        jacket_size?: string | null;
        shirt_size?: string | null;
        pants_size?: string | null;
        chest?: number | null;
        waist?: number | null;
        hips?: number | null;
        shoulder_width?: number | null;
        neck_size?: number | null;
        shoe_size?: string | null;
        underwear_sizes?: Json | null;
        hair_length?: string | null;
        hair_type?: string | null;
        has_freckles?: boolean;
        has_diastema?: boolean;
        has_piercings?: boolean;
        has_tattoos?: boolean;
        has_vitiligo?: boolean;
        has_albinism?: boolean;
        has_dwarfism?: boolean;
        abilities?: string[] | null;
        ability_dance?: boolean;
        ability_sing?: boolean;
        ability_instruments?: boolean;
        ability_instruments_detail?: string | null;
        ability_sports?: boolean;
        ability_sports_detail?: string | null;
        ability_bartender?: boolean;
        ability_other?: boolean;
        ability_other_detail?: string | null;
      };
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
