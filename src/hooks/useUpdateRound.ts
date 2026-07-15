import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RoundPreset } from "@/lib/casting/roundPreset";
import { fetchRoundTalents } from "@/lib/casting/fetchRoundTalents";
import { generateRoundPdfs, PhotoWarning } from "@/lib/casting/generateRound";

export interface UpdateRoundInput {
  roundId: string;
  castingId: string;
  label: string;
  preset: RoundPreset;
  /** All role_talent_ids that should be in the round after the update */
  selectedRoleTalentIds: string[];
  /** role_talent_ids currently in the round */
  currentRoleTalentIds: string[];
  /** Map role_talent_id → pdf_path (to delete files for removed talents) */
  pdfPathByRoleTalentId: Record<string, string | null>;
  /** True if preset has changed compared to the round's existing preset */
  presetChanged: boolean;
  onProgress?: (done: number, total: number) => void;
}

export const useUpdateRound = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateRoundInput) => {
      const {
        roundId, castingId, label, preset,
        selectedRoleTalentIds, currentRoleTalentIds,
        pdfPathByRoleTalentId, presetChanged, onProgress,
      } = input;

      const currentSet = new Set(currentRoleTalentIds);
      const selectedSet = new Set(selectedRoleTalentIds);
      const added = selectedRoleTalentIds.filter((id) => !currentSet.has(id));
      const removed = currentRoleTalentIds.filter((id) => !selectedSet.has(id));
      const kept = selectedRoleTalentIds.filter((id) => currentSet.has(id));

      // 1. Update label & preset on the round
      const { error: updErr } = await supabase
        .from("casting_rounds")
        .update({ label, field_preset: preset as any })
        .eq("id", roundId);
      if (updErr) throw updErr;

      // 2. Remove dropped talents (delete files first to keep storage tidy)
      if (removed.length > 0) {
        const pathsToDelete = removed
          .map((id) => pdfPathByRoleTalentId[id])
          .filter((p): p is string => !!p);
        if (pathsToDelete.length > 0) {
          await supabase.storage.from("casting-pdfs").remove(pathsToDelete).catch(() => {});
        }
        const { error: delErr } = await supabase
          .from("casting_round_talents")
          .delete()
          .eq("round_id", roundId)
          .in("role_talent_id", removed);
        if (delErr) throw delErr;
      }

      // 3. Compute targets for PDF (re)generation
      const toGenerate = presetChanged ? selectedRoleTalentIds : added;
      let items: Awaited<ReturnType<typeof fetchRoundTalents>> = [];
      if (toGenerate.length > 0) {
        items = await fetchRoundTalents(toGenerate);
      }

      // 4. Insert placeholders for added talents (so they show up even before PDF is ready)
      if (added.length > 0) {
        await supabase
          .from("casting_round_talents")
          .upsert(
            added.map((id) => ({ round_id: roundId, role_talent_id: id })),
            { onConflict: "round_id,role_talent_id" }
          );
      }

      // 5. Generate PDFs
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

      return { added: added.length, removed: removed.length, kept: kept.length, errors, photoWarnings };
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["round", vars.roundId] });
      qc.invalidateQueries({ queryKey: ["casting-rounds", vars.castingId] });
      qc.invalidateQueries({ queryKey: ["rounds-by-role", vars.castingId] });
    },
  });
};
