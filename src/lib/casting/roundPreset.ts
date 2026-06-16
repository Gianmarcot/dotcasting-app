// =============================================================
// roundPreset.ts — Preset di visibilità di un round
// Il preset è salvato come jsonb in casting_rounds.field_preset.
// resolveCard() lo applica a un talent e produce i dati già
// pronti per entrambi i renderer (PDF e web).
// =============================================================

import { FIELD_REGISTRY, Talent } from "./talentFields";

export interface RoundPreset {
  /** chiavi del registry visibili in questo round, qualunque gruppo */
  fields: string[];
  /** quante foto includere (oltre alle 2 di pagina 1). null = tutte */
  photoCount?: number | null;
  /** email agenzia mostrata in footer: di norma sempre true */
  showAgencyContact?: boolean;
}

// Preset di partenza, modificabili liberamente al momento della
// creazione del round: sono solo valori iniziali della checklist.
export const PRESET_ESSENZIALE: RoundPreset = {
  fields: FIELD_REGISTRY.filter(f => f.group === "misure" || f.group === "fisico").map(f => f.key),
  photoCount: 3,
  showAgencyContact: true,
};

export const PRESET_COMPLETO: RoundPreset = {
  fields: FIELD_REGISTRY.map(f => f.key),
  photoCount: null,
  showAgencyContact: true,
};

// ---------- risoluzione ----------------------------------------

export interface ResolvedRow { label: string; value: string }

export interface ResolvedCard {
  nome: string;
  /** righe misure/anagrafica già splittate in due colonne */
  columns: [ResolvedRow[], ResolvedRow[]];
  /** contatti talent visibili (email, telefono…) */
  contacts: ResolvedRow[];
  /** foto pagina 1: [sinistra, destra] (possono mancare) */
  coverPhotos: (string | undefined)[];
  /** foto galleria, a gruppi di 3 per pagina */
  galleryPages: string[][];
  showAgencyContact: boolean;
  /** branding agenzia da app_settings (caricato a monte e passato in input) */
  agencyName?: string | null;
  agencyLogoUrl?: string | null;
  agencyContactEmail?: string | null;
}

export interface BrandingInput {
  agencyName?: string | null;
  agencyLogoUrl?: string | null;
  agencyContactEmail?: string | null;
}

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

export function resolveCard(
  talent: Talent,
  preset: RoundPreset,
  branding?: BrandingInput,
): ResolvedCard {
  const visible = FIELD_REGISTRY.filter(f => preset.fields.includes(f.key));

  const rows: ResolvedRow[] = [];
  const contacts: ResolvedRow[] = [];

  for (const f of visible) {
    const raw = f.accessor(talent);
    if (raw === null || raw === undefined || raw === "") continue; // campo vuoto = non stampato
    const value = f.format ? f.format(raw) : String(raw);
    (f.group === "contatti" ? contacts : rows).push({ label: f.label, value });
  }

  // split a metà, colonna sinistra più lunga in caso di numero dispari
  const mid = Math.ceil(rows.length / 2);
  const columns: [ResolvedRow[], ResolvedRow[]] = [rows.slice(0, mid), rows.slice(mid)];

  const gallery = talent.photos.slice(2);
  const limited =
    preset.photoCount == null ? gallery : gallery.slice(0, Math.max(0, preset.photoCount));

  return {
    nome: talent.nome,
    columns,
    contacts,
    coverPhotos: [talent.photos[0], talent.photos[1]],
    galleryPages: chunk(limited, 3),
    showAgencyContact: preset.showAgencyContact !== false,
    agencyName: branding?.agencyName ?? null,
    agencyLogoUrl: branding?.agencyLogoUrl ?? null,
    agencyContactEmail: branding?.agencyContactEmail ?? null,
  };
}
