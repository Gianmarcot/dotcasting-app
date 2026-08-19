import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  TEMPLATE_DEFINITIONS,
  defaultTemplate,
  type CommunicationTemplate,
  type CommunicationTemplateType,
} from "@/lib/communicationTemplates";

export const COMMUNICATION_TEMPLATES_KEY = ["communication-templates"] as const;

/** Template per tipo, con fallback ai testi predefiniti se la riga non esiste. */
export const useCommunicationTemplates = () =>
  useQuery({
    queryKey: COMMUNICATION_TEMPLATES_KEY,
    queryFn: async (): Promise<Record<string, CommunicationTemplate>> => {
      const { data, error } = await supabase.from("communication_templates").select("*");
      if (error) throw error;
      const map: Record<string, CommunicationTemplate> = {};
      TEMPLATE_DEFINITIONS.forEach((d) => {
        map[d.type] = defaultTemplate(d.type);
      });
      (data ?? []).forEach((row) => {
        map[row.type] = { ...(map[row.type] ?? {}), ...row } as CommunicationTemplate;
      });
      return map;
    },
    staleTime: 60_000,
  });

export type TemplateUpdate = Partial<Omit<CommunicationTemplate, "type">> & {
  type: CommunicationTemplateType;
};

export const useUpdateCommunicationTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, ...updates }: TemplateUpdate) => {
      const base = defaultTemplate(type);
      const { error } = await supabase
        .from("communication_templates")
        .upsert({ ...base, ...updates, type }, { onConflict: "type" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COMMUNICATION_TEMPLATES_KEY });
    },
  });
};
