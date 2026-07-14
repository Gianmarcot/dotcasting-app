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
 * Scarica un'immagine e la restituisce come data URL base64. Così
 * @react-pdf/renderer non fa network durante il render: se qui la foto
 * arriva, nel PDF ci sarà. Prova prima l'URL fornito (tipicamente la
 * variante trasformata), poi cade sull'originale non trasformato.
 * Ritorna null solo se entrambi i tentativi falliscono davvero.
 */
async function fetchPhotoAsDataUrl(url: string, timeoutMs = 20000): Promise<string | null> {
  const candidates = [url];
  if (url.includes("/storage/v1/render/image/public/")) {
    candidates.push(
      url.replace("/storage/v1/render/image/public/", "/storage/v1/object/public/").split("?")[0]
    );
  }
  for (const candidate of candidates) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(candidate, { method: "GET", signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) continue;
      const blob = await res.blob();
      // Normalizza MIME non standard (es. image/jpg) per evitare che
      // react-pdf rifiuti il data URL.
      const rawType = (blob.type || res.headers.get("content-type") || "").toLowerCase();
      const mime =
        rawType === "image/jpg" ? "image/jpeg" :
        rawType.startsWith("image/") ? rawType :
        "image/jpeg";
      const normalized = blob.type === mime ? blob : new Blob([blob], { type: mime });
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(normalized);
      });
      if (dataUrl.startsWith("data:image/")) return dataUrl;
    } catch {
      // prova il candidato successivo
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

    // Pre-scarica ogni foto come data URL: react-pdf non farà più
    // network durante il render, quindi ogni foto visibile nel drawer
    // finisce sicuramente anche nel PDF. Le url irraggiungibili vengono
    // scartate (cella vuota) invece di generare buchi neri.
    const resolvedPhotos = (
      await Promise.all(talent.photos.map((u) => fetchPhotoAsDataUrl(u)))
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
