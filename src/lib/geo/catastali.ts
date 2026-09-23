/**
 * Codici catastali (Belfiore) dei comuni italiani, usati per verificare
 * il luogo di nascita codificato nel codice fiscale.
 * Il dataset (~160KB) viene caricato solo quando serve.
 */
let cache: Record<string, string> | null = null;
let pending: Promise<Record<string, string>> | null = null;

export const loadCatastali = () => {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = import("./catastali.json").then((mod) => {
      cache = (mod.default ?? mod) as unknown as Record<string, string>;
      return cache;
    });
  }
  return pending;
};

export const normalizeComuneName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

/** Codice catastale del comune, se il dataset è già caricato. */
export const catastaleOf = (name: string | null | undefined): string | null => {
  if (!cache || !name) return null;
  return cache[normalizeComuneName(name)] ?? null;
};

/** true se il codice appartiene a un comune italiano presente nel dataset. */
export const isKnownCatastale = (code: string): boolean => {
  if (!cache) return false;
  const upper = code.toUpperCase();
  for (const value of Object.values(cache)) {
    if (value === upper) return true;
  }
  return false;
};

export const hasCatastaliLoaded = () => cache !== null;
