/**
 * Utility per i ritagli multipli di una foto talent.
 *
 * Il campo `crops` (JSONB) su `talent_media` ha questa forma:
 * {
 *   "original_url": "https://...",
 *   "2:3": { "url": "https://...", "rect": { "x": 0, "y": 0, "w": 100, "h": 100 } },
 *   "1:1": { "url": "https://...", "rect": { ... } }
 * }
 * I valori di `rect` sono percentuali rispetto all'immagine originale.
 */

export type CropRatio = "2:3" | "1:1";

export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CropVariant {
  url: string;
  rect?: CropRect;
}

export interface CropsData {
  original_url?: string;
  [ratio: string]: CropVariant | string | undefined;
}

interface MediaLike {
  url: string;
  crops?: unknown;
}

/** Parsing sicuro del JSONB `crops`. */
export const parseCrops = (raw: unknown): CropsData => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as CropsData;
};

const variant = (raw: unknown, ratio: CropRatio): CropVariant | null => {
  const value = parseCrops(raw)[ratio];
  if (!value || typeof value !== "object") return null;
  const v = value as CropVariant;
  return typeof v.url === "string" && v.url ? v : null;
};

/**
 * URL sorgente originale (non ritagliata) da usare come base per un nuovo ritaglio.
 * Retrocompatibile: se l'originale non è stato conservato si usa `url`.
 */
export const getOriginalUrl = (media: MediaLike): string => {
  const original = parseCrops(media.crops).original_url;
  return typeof original === "string" && original ? original : media.url;
};

/** URL della variante richiesta, con fallback a `url`. */
export const getCropUrl = (media: MediaLike, ratio: CropRatio): string =>
  variant(media.crops, ratio)?.url ?? media.url;

/** Rettangolo salvato per la proporzione richiesta (per riaprire il ritaglio). */
export const getCropRect = (media: MediaLike, ratio: CropRatio): CropRect | undefined =>
  variant(media.crops, ratio)?.rect;

/** Vero se esiste una variante generata per quella proporzione. */
export const hasCrop = (media: MediaLike, ratio: CropRatio): boolean =>
  !!variant(media.crops, ratio);

/** Tutti gli URL delle varianti (utile per la pulizia dello storage). */
export const getVariantUrls = (media: MediaLike): string[] => {
  const data = parseCrops(media.crops);
  const urls: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (key === "original_url") {
      if (typeof value === "string" && value) urls.push(value);
      continue;
    }
    if (value && typeof value === "object" && typeof (value as CropVariant).url === "string") {
      urls.push((value as CropVariant).url);
    }
  }
  return urls;
};

export const RATIO_VALUE: Record<CropRatio, number> = {
  "2:3": 2 / 3,
  "1:1": 1,
};

export const RATIO_LABEL: Record<CropRatio, string> = {
  "2:3": "Copertina 2:3",
  "1:1": "Avatar 1:1",
};
