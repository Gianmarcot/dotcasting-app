import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RoundPreset } from "@/lib/casting/roundPreset";

export interface CastingRound {
  id: string;
  casting_id: string;
  casting_role_id: string | null;
  label: string;
  field_preset: RoundPreset;
  status: string; // 'draft' | 'shared'
  share_token: string | null;
  shared_at: string | null;
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
      castingRoleId?: string | null;
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
          casting_role_id: input.castingRoleId ?? null,
          label: input.label,
          field_preset: input.preset as any,
          status: "draft",
          created_by: createdBy,
        })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CastingRound;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["casting-rounds", d.casting_id] });
      qc.invalidateQueries({ queryKey: ["rounds-by-role", d.casting_id] });
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

export const useDeleteRound = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { roundId: string; castingId: string; castingRoleId?: string | null }) => {
      // Best-effort: rimuovi i PDF dallo storage prima della cascata DB.
      try {
        const { data: list } = await supabase.storage
          .from("casting-pdfs")
          .list(`${input.castingId}/${input.roundId}`, { limit: 1000 });
        const paths = (list ?? []).map((f) => `${input.castingId}/${input.roundId}/${f.name}`);
        if (paths.length) {
          await supabase.storage.from("casting-pdfs").remove(paths);
        }
      } catch {
        /* ignora errori storage, procedi col delete del record */
      }
      const { error } = await supabase
        .from("casting_rounds")
        .delete()
        .eq("id", input.roundId);
      if (error) throw error;
      return input;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["casting-rounds", d.castingId] });
      qc.invalidateQueries({ queryKey: ["rounds-by-role", d.castingId] });
      if (d.castingRoleId) {
        qc.invalidateQueries({ queryKey: ["role-confirmed-talents", d.castingRoleId] });
      }
    },
  });
};

