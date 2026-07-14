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
import { RoundPreset, resolveCard, BrandingInput } from "./roundPreset";
import { TalentCardPDF } from "./TalentCardPDF";
import { fetchAppSettings } from "@/hooks/useAppSettings";

// Polyfill Buffer per @react-pdf/renderer (fetchImage usa Buffer.isBuffer)
if (!(globalThis as { Buffer?: unknown }).Buffer) {
  (globalThis as { Buffer?: unknown }).Buffer = Buffer;
}

export interface RoundResult { roleTalentId: string; path: string }

/**
 * Verifica che l'URL restituisca un'immagine valida. Se l'endpoint di
 * trasformazione fallisce (rate limit, timeout, source troppo grande),
 * prova l'URL originale. Restituisce null se nessuno è raggiungibile:
 * meglio omettere una foto che avere una griglia con buchi neri.
 */
async function resolvePhotoUrl(url: string, timeoutMs = 15000): Promise<string | null> {
  const candidates = [url];
  if (url.includes("/storage/v1/render/image/public/")) {
    candidates.push(url.replace("/storage/v1/render/image/public/", "/storage/v1/object/public/").split("?")[0]);
  }
  for (const candidate of candidates) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(candidate, { method: "GET", signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const ct = res.headers.get("content-type") ?? "";
        if (ct.startsWith("image/")) return candidate;
      }
    } catch {
      // try next
    }
  }
  return null;
}

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

  // Carica branding una sola volta a monte
  const settings = await fetchAppSettings().catch(() => null);
  const branding: BrandingInput = {
    agencyName: settings?.agency_name ?? null,
    agencyLogoUrl: settings?.agency_logo_url ?? null,
    agencyContactEmail: settings?.contact_email ?? null,
  };

  for (let i = 0; i < items.length; i++) {
    const { roleTalentId, talent } = items[i];

    // Pre-check di ogni foto: sostituisce l'URL con uno raggiungibile
    // (transform o originale), scarta quelle non raggiungibili.
    const resolvedPhotos = (
      await Promise.all(talent.photos.map((u) => resolvePhotoUrl(u)))
    ).filter((u): u is string => Boolean(u));
    const talentSafe: Talent = { ...talent, photos: resolvedPhotos };

    const card = resolveCard(talentSafe, preset, branding);

    const blob = await pdf(<TalentCardPDF card={card} />).toBlob();

    // Path stabile e univoco: roleTalentId (uuid) — evita collisioni
    // quando due talent condividono lo stesso nome o hanno nome vuoto.
    const path = `castings/${castingId}/rounds/${roundId}/${roleTalentId}.pdf`;
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
