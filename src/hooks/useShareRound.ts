import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Generate a share token and mark the round as shared.
 * The public viewer route + RPC are added in a separate prompt.
 */
export const useShareRound = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (roundId: string) => {
      const token =
        (typeof crypto !== "undefined" && "randomUUID" in crypto)
          ? crypto.randomUUID().replace(/-/g, "")
          : Math.random().toString(36).slice(2) + Date.now().toString(36);

      const { data, error } = await supabase
        .from("casting_rounds")
        .update({
          status: "shared",
          share_token: token,
          shared_at: new Date().toISOString(),
        })
        .eq("id", roundId)
        .select()
        .single();
      if (error) throw error;
      return data as { id: string; casting_id: string; share_token: string };
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["rounds-by-role", d.casting_id] });
      qc.invalidateQueries({ queryKey: ["casting-rounds", d.casting_id] });
      qc.invalidateQueries({ queryKey: ["round", d.id] });
    },
  });
};
