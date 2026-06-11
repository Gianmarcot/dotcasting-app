import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RoundPreset } from "@/lib/casting/roundPreset";

export interface CastingRound {
  id: string;
  casting_id: string;
  label: string;
  field_preset: RoundPreset;
  created_at: string;
  created_by: string | null;
  talents_count?: number;
}

export interface RoundTalentRow {
  round_id: string;
  role_talent_id: string;
  pdf_path: string | null;
  generated_at: string | null;
}

export const useCastingRounds = (castingId: string | undefined) =>
  useQuery({
    queryKey: ["casting-rounds", castingId],
    enabled: !!castingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("casting_rounds")
        .select("*, talents:casting_round_talents(round_id)")
        .eq("casting_id", castingId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        ...r,
        talents_count: r.talents?.length ?? 0,
      })) as CastingRound[];
    },
  });

export const useRoundTalents = (roundId: string | undefined) =>
  useQuery({
    queryKey: ["round-talents", roundId],
    enabled: !!roundId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("casting_round_talents")
        .select("*")
        .eq("round_id", roundId!);
      if (error) throw error;
      return data as RoundTalentRow[];
    },
  });

export const useCreateRound = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      castingId: string;
      label: string;
      preset: RoundPreset;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      let createdBy: string | null = null;
      if (user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        createdBy = profile?.id ?? null;
      }
      const { data, error } = await supabase
        .from("casting_rounds")
        .insert({
          casting_id: input.castingId,
          label: input.label,
          field_preset: input.preset as any,
          created_by: createdBy,
        })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CastingRound;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["casting-rounds", d.casting_id] });
    },
  });
};

export const useSignedPdfUrl = () =>
  useMutation({
    mutationFn: async (path: string) => {
      const { data, error } = await supabase.storage
        .from("casting-pdfs")
        .createSignedUrl(path, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
  });
