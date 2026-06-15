import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** 24 random bytes → base64url ≈ 32 url-safe characters. */
const generateShareToken = (): string => {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/**
 * Generate a share token and mark the round as shared.
 * Public viewer route is /round/{token} (handled separately).
 */
export const useShareRound = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (roundId: string) => {
      const token = generateShareToken();
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
