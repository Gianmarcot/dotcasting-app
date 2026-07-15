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
export interface PhotoWarning {
  roleTalentId: string;
  talentId: string;
  talentName: string;
  expected: number;
  included: number;
  failedUrls: { url: string; reason: string }[];
}
export interface GenerateRoundOutcome {
  results: RoundResult[];
  photoWarnings: PhotoWarning[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Applica la correzione EXIF di orientamento: ridisegna il bitmap
 * già ruotato su un canvas e restituisce un data URL JPEG. Se
 * l'ambiente non supporta `createImageBitmap({imageOrientation})`
 * ritorna null, così il caller usa il blob originale come fallback.
 */
async function normalizeOrientationToDataUrl(blob: Blob): Promise<string | null> {
  try {
    if (typeof createImageBitmap !== "function") return null;
    // Feature-detect il parametro imageOrientation. Chromium/Safari
    // recenti lo supportano; su browser che lo ignorano il risultato
    // sarà comunque ridisegnato — nessun errore.
    const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" } as ImageBitmapOptions);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) { bitmap.close?.(); return null; }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close?.();
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch {
    return null;
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const rawType = (blob.type || "").toLowerCase();
  const mime =
    rawType === "image/jpg" ? "image/jpeg" :
    rawType.startsWith("image/") ? rawType :
    "image/jpeg";
  const normalized = blob.type === mime ? blob : new Blob([blob], { type: mime });
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(normalized);
  });
}

interface FetchPhotoResult {
  dataUrl: string | null;
  failure?: { url: string; reason: string };
}

/**
 * Scarica una foto e la restituisce come data URL con orientamento
 * EXIF applicato. Prova prima l'URL fornito (variante trasformata),
 * poi l'originale non trasformato. Ogni candidato viene ritentato una
 * volta in caso di errore di rete transitorio.
 */
async function fetchPhotoAsDataUrl(url: string, timeoutMs = 20000): Promise<FetchPhotoResult> {
  const candidates = [url];
  if (url.includes("/storage/v1/render/image/public/")) {
    candidates.push(
      url.replace("/storage/v1/render/image/public/", "/storage/v1/object/public/").split("?")[0]
    );
  }

  let lastFailure: { url: string; reason: string } | undefined;

  for (const candidate of candidates) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(candidate, { method: "GET", signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) {
          lastFailure = { url: candidate, reason: `HTTP ${res.status}` };
          if (attempt === 0) { await sleep(400); continue; }
          break;
        }
        const blob = await res.blob();
        // 1) prova la normalizzazione EXIF via canvas
        const normalized = await normalizeOrientationToDataUrl(blob);
        if (normalized) return { dataUrl: normalized };
        // 2) fallback: data URL grezzo del blob (senza correzione EXIF)
        const dataUrl = await blobToDataUrl(blob);
        if (dataUrl.startsWith("data:image/")) return { dataUrl };
        lastFailure = { url: candidate, reason: "invalid data URL" };
        break;
      } catch (err: any) {
        lastFailure = { url: candidate, reason: err?.name === "AbortError" ? "timeout" : (err?.message ?? "network error") };
        if (attempt === 0) { await sleep(400); continue; }
      }
    }
  }
  return { dataUrl: null, failure: lastFailure };
}

/**
 * Genera un PDF per ogni talent del round e lo carica su Storage.
 * Percorso: castings/{castingId}/rounds/{roundId}/{role_talent_id}.pdf
 * Ritorna anche un riepilogo dei talent con foto mancanti, così la
 * UI può avvisare l'admin prima di condividere l'invio.
 */
export async function generateRoundPdfs(opts: {
  castingId: string;
  roundId: string;
  items: { roleTalentId: string; talent: Talent }[];
  preset: RoundPreset;
  onProgress?: (done: number, total: number) => void;
}): Promise<GenerateRoundOutcome> {
  const { castingId, roundId, items, preset, onProgress } = opts;
  const results: RoundResult[] = [];
  const photoWarnings: PhotoWarning[] = [];

  const settings = await fetchAppSettings().catch(() => null);
  const branding: BrandingInput = {
    agencyName: settings?.agency_name ?? null,
    agencyLogoUrl: settings?.agency_logo_url ?? null,
    agencyContactEmail: settings?.contact_email ?? null,
  };

  for (let i = 0; i < items.length; i++) {
    const { roleTalentId, talent } = items[i];
    const expected = talent.photos.length;

    const fetched = await Promise.all(talent.photos.map((u) => fetchPhotoAsDataUrl(u)));
    const resolvedPhotos: string[] = [];
    const failures: { url: string; reason: string }[] = [];
    fetched.forEach((r, idx) => {
      if (r.dataUrl) resolvedPhotos.push(r.dataUrl);
      else {
        const fail = r.failure ?? { url: talent.photos[idx], reason: "unknown" };
        failures.push(fail);
        // eslint-disable-next-line no-console
        console.warn(
          `[generateRoundPdfs] foto non inclusa nel PDF`,
          { talentId: talent.id, talentName: talent.nome, url: fail.url, reason: fail.reason }
        );
      }
    });

    if (failures.length > 0) {
      photoWarnings.push({
        roleTalentId,
        talentId: talent.id,
        talentName: talent.nome,
        expected,
        included: resolvedPhotos.length,
        failedUrls: failures,
      });
    }

    const talentSafe: Talent = { ...talent, photos: resolvedPhotos };
    const card = resolveCard(talentSafe, preset, branding);
    const blob = await pdf(<TalentCardPDF card={card} />).toBlob();

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

  return { results, photoWarnings };
}
