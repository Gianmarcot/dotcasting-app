import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
 import type { Json } from "@/integrations/supabase/types";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: {
      first_name?: string | null;
      last_name?: string | null;
      gender?: string | null;
      ethnicity?: string | null;
      birth_date?: string | null;
      city?: string | null;
      country?: string | null;
      bio?: string | null;
      profile_photo_url?: string | null;
       talent_categories?: string[] | null;
       representation_type?: string | null;
       phone_prefix?: string | null;
       phone_number?: string | null;
       whatsapp_prefix?: string | null;
       whatsapp_number?: string | null;
       nationality?: string | null;
       postal_code?: string | null;
       residence_address?: Json | null;
       domicile_address?: Json | null;
       fiscal_code?: string | null;
       work_cities?: string[] | null;
       id_document_url?: string | null;
       has_passport?: boolean;
       passport_expiry?: string | null;
       social_links?: Json | null;
       website_url?: string | null;
       has_minor_children?: boolean;
       main_occupation?: string | null;
       driving_licenses?: string[] | null;
       travel_availability?: Json | null;
       visas?: Json | null;
       has_vat_number?: boolean;
       vat_number?: string | null;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
