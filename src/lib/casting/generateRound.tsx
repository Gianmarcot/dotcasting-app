// =============================================================
// generateRound.tsx — Generazione PDF di un round + upload Storage
// Client-side: gira nel browser, in sequenza, con callback di
// progresso per la UI.
// =============================================================

import React from "react";
import { Buffer } from "buffer";
import { pdf } from "@react-pdf/renderer";
import { supabase } from "@/integrations/supabase/client";
import { Talent } from "./talentFields";
import { RoundPreset, resolveCard } from "./roundPreset";
import { TalentCardPDF } from "./TalentCardPDF";

// Polyfill Buffer per @react-pdf/renderer (fetchImage usa Buffer.isBuffer)
if (!(globalThis as { Buffer?: unknown }).Buffer) {
  (globalThis as { Buffer?: unknown }).Buffer = Buffer;
}

const slug = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
   .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export interface RoundResult { roleTalentId: string; path: string }

/**
 * Genera un PDF per ogni talent del round e lo carica su Storage.
 * Percorso: castings/{castingId}/rounds/{roundId}/{slug-nome}.pdf
 */
export async function generateRoundPdfs(opts: {
  castingId: string;
  roundId: string;
  items: { roleTalentId: string; talent: Talent }[];
  preset: RoundPreset;
  onProgress?: (done: number, total: number) => void;
}): Promise<RoundResult[]> {
  const { castingId, roundId, items, preset, onProgress } = opts;
  const results: RoundResult[] = [];

  for (let i = 0; i < items.length; i++) {
    const { roleTalentId, talent } = items[i];
    const card = resolveCard(talent, preset);

    const blob = await pdf(<TalentCardPDF card={card} />).toBlob();

    const path = `castings/${castingId}/rounds/${roundId}/${slug(talent.nome)}.pdf`;
    const { error } = await supabase.storage
      .from("casting-pdfs")
      .upload(path, blob, { contentType: "application/pdf", upsert: true });
    if (error) throw new Error(`Upload fallito per ${talent.nome}: ${error.message}`);

    await supabase
      .from("casting_round_talents")
      .upsert({
        round_id: roundId,
        role_talent_id: roleTalentId,
        pdf_path: path,
        generated_at: new Date().toISOString(),
      });

    results.push({ roleTalentId, path });
    onProgress?.(i + 1, items.length);
  }

  return results;
}
