import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AppSettings {
  agency_name: string | null;
  agency_logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  updated_at: string;
}

export const APP_SETTINGS_KEY = ["app-settings"] as const;

export const useAppSettings = () => {
  return useQuery({
    queryKey: APP_SETTINGS_KEY,
    queryFn: async (): Promise<AppSettings | null> => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("agency_name, agency_logo_url, contact_email, contact_phone, website_url, updated_at")
        .eq("id", true)
        .maybeSingle();
      if (error) throw error;
      return data as AppSettings | null;
    },
    staleTime: 60_000,
  });
};

export type AppSettingsInput = Partial<Omit<AppSettings, "updated_at">>;

export const useUpdateAppSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: AppSettingsInput) => {
      const { data, error } = await supabase
        .from("app_settings")
        .update(updates)
        .eq("id", true)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: APP_SETTINGS_KEY });
    },
  });
};

/** Server-side fetch helper for callers that don't use react-query (e.g. PDF generation). */
export const fetchAppSettings = async (): Promise<AppSettings | null> => {
  const { data, error } = await supabase
    .from("app_settings")
    .select("agency_name, agency_logo_url, contact_email, contact_phone, website_url, updated_at")
    .eq("id", true)
    .maybeSingle();
  if (error) throw error;
  return data as AppSettings | null;
};
