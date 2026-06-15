import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CastingRound } from "./useCastingRounds";

/**
 * Fetch all rounds of a casting, grouped client-side by casting_role_id.
 * Returns Map<roleId, CastingRound[]> ordered by created_at desc.
 */
export const useRoundsByRole = (castingId: string | undefined) =>
  useQuery({
    queryKey: ["rounds-by-role", castingId],
    enabled: !!castingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("casting_rounds")
        .select("*, talents:casting_round_talents(round_id)")
        .eq("casting_id", castingId!)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const rounds = (data ?? []).map((r: any) => ({
        ...r,
        talents_count: r.talents?.length ?? 0,
      })) as CastingRound[];

      const map = new Map<string, CastingRound[]>();
      for (const r of rounds) {
        const key = r.casting_role_id ?? "__unassigned";
        const arr = map.get(key) ?? [];
        arr.push(r);
        map.set(key, arr);
      }
      return map;
    },
  });
