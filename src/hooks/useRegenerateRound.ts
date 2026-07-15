import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RoundPreset } from "@/lib/casting/roundPreset";
import { fetchRoundTalents } from "@/lib/casting/fetchRoundTalents";
import { generateRoundPdfs, PhotoWarning } from "@/lib/casting/generateRound";

export interface RegenerateRoundInput {
  roundId: string;
  castingId: string;
  preset: RoundPreset;
  roleTalentIds: string[];
  onProgress?: (done: number, total: number) => void;
}

/**
 * Re-fetch current talents data and regenerate all PDFs for the round.
 * Does not change membership, token, or status.
 */
export const useRegenerateRound = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegenerateRoundInput) => {
      const { roundId, castingId, preset, roleTalentIds, onProgress } = input;
      if (roleTalentIds.length === 0) return { count: 0, errors: [] as string[], photoWarnings: [] as PhotoWarning[] };
      const items = await fetchRoundTalents(roleTalentIds);
      const errors: string[] = [];
      const photoWarnings: PhotoWarning[] = [];
      for (let i = 0; i < items.length; i++) {
        try {
          const out = await generateRoundPdfs({
            castingId, roundId, items: [items[i]], preset,
            onProgress: () => {},
          });
          photoWarnings.push(...out.photoWarnings);
        } catch (e: any) {
          errors.push(`${items[i].talent.nome}: ${e?.message ?? "errore"}`);
        }
        onProgress?.(i + 1, items.length);
      }
      return { count: items.length, errors, photoWarnings };
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["round", vars.roundId] });
      qc.invalidateQueries({ queryKey: ["casting-rounds", vars.castingId] });
    },
  });
};

};
