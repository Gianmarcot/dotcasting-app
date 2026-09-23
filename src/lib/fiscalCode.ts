/**
 * Validazione del codice fiscale italiano (persone fisiche).
 * Include controllo del formato e del carattere di controllo (CIN).
 */

import { catastaleOf, hasCatastaliLoaded, isKnownCatastale } from "@/lib/geo/catastali";

const CF_RE = /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/;

const ODD: Record<string, number> = {
  "0": 1, "1": 0, "2": 5, "3": 7, "4": 9, "5": 13, "6": 15, "7": 17, "8": 19, "9": 21,
  A: 1, B: 0, C: 5, D: 7, E: 9, F: 13, G: 15, H: 17, I: 19, J: 21, K: 2, L: 4, M: 18,
  N: 20, O: 11, P: 3, Q: 6, R: 8, S: 12, T: 14, U: 16, V: 10, W: 22, X: 25, Y: 24, Z: 23,
};

const EVEN: Record<string, number> = {
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9, K: 10, L: 11, M: 12,
  N: 13, O: 14, P: 15, Q: 16, R: 17, S: 18, T: 19, U: 20, V: 21, W: 22, X: 23, Y: 24, Z: 25,
};

const CHECK_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Cifre "omocodiche": lettere usate al posto delle cifre. */
const OMOCODE: Record<string, string> = {
  L: "0", M: "1", N: "2", P: "3", Q: "4", R: "5", S: "6", T: "7", U: "8", V: "9",
};

const toDigit = (ch: string) => (/[0-9]/.test(ch) ? ch : (OMOCODE[ch] ?? ""));

const MONTH_LETTERS = "ABCDEHLMPRST"; // gen..dic

export const normalizeFiscalCode = (code: string) =>
  code.toUpperCase().replace(/[^A-Z0-9]/g, "");

export const computeCheckChar = (first15: string): string => {
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    const ch = first15[i];
    sum += i % 2 === 0 ? (ODD[ch] ?? 0) : (EVEN[ch] ?? 0);
  }
  return CHECK_CHARS[sum % 26];
};

export type FiscalCodeCheck = {
  /** true se lunghezza 16, formato e CIN corretti */
  valid: boolean;
  /** messaggio d'errore da mostrare (vuoto se valido o incompleto) */
  error: string | null;
};

/** Controllo formale del codice fiscale. Nessun errore se vuoto o < 16 caratteri. */
export const validateFiscalCode = (raw: string): FiscalCodeCheck => {
  const code = normalizeFiscalCode(raw);
  if (!code) return { valid: false, error: null };
  if (code.length < 16) return { valid: false, error: null };
  if (code.length > 16) return { valid: false, error: "Il codice fiscale deve avere 16 caratteri" };
  if (!CF_RE.test(code)) return { valid: false, error: "Codice fiscale non valido" };
  if (computeCheckChar(code.slice(0, 15)) !== code[15]) {
    return { valid: false, error: "Codice fiscale non valido" };
  }
  return { valid: true, error: null };
};

/** Estrae data di nascita e sesso dal codice fiscale (se formalmente valido). */
export const decodeFiscalCode = (raw: string) => {
  const code = normalizeFiscalCode(raw);
  if (!validateFiscalCode(code).valid) return null;
  const yy = toDigit(code[6]) + toDigit(code[7]);
  const monthIndex = MONTH_LETTERS.indexOf(code[8]);
  const dayRaw = Number(toDigit(code[9]) + toDigit(code[10]));
  if (yy.length !== 2 || monthIndex < 0 || Number.isNaN(dayRaw)) return null;
  const gender: "M" | "F" = dayRaw > 40 ? "F" : "M";
  const day = dayRaw > 40 ? dayRaw - 40 : dayRaw;
  if (day < 1 || day > 31) return null;
  return { yy, month: monthIndex + 1, day, gender };
};

/* ------------------------- Cognome, nome e coerenza ------------------------ */

const clean = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

const consonants = (s: string) => s.replace(/[AEIOU]/g, "");
const vowels = (s: string) => s.replace(/[^AEIOU]/g, "");

export const encodeSurname = (surname: string): string | null => {
  const s = clean(surname ?? "");
  if (!s) return null;
  return (consonants(s) + vowels(s) + "XXX").slice(0, 3);
};

export const encodeName = (name: string): string | null => {
  const s = clean(name ?? "");
  if (!s) return null;
  const c = consonants(s);
  if (c.length >= 4) return c[0] + c[2] + c[3];
  return (c + vowels(s) + "XXX").slice(0, 3);
};

export interface FiscalPersonData {
  first_name?: string | null;
  last_name?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  /** Comune di nascita (solo Italia). */
  birth_city?: string | null;
  /** Stato di nascita: se non italiano si attende un codice estero (Z...). */
  birth_country?: string | null;
}

/**
 * Confronta il codice fiscale con i dati anagrafici del profilo.
 * Restituisce l'elenco dei dati che non combaciano (vuoto se tutto torna
 * o se non ci sono dati a sufficienza per il confronto).
 * Il luogo di nascita viene confrontato solo quando la tabella dei codici
 * catastali è già stata caricata (loadCatastali) e il comune è riconosciuto:
 * i comuni soppressi mantengono codici non più in elenco e non vanno segnalati.
 */
export const fiscalCodeMismatchFields = (
  raw: string,
  person: FiscalPersonData
): string[] => {
  const decoded = decodeFiscalCode(raw);
  if (!decoded) return [];
  const code = normalizeFiscalCode(raw);
  const out: string[] = [];

  const surname = encodeSurname(person.last_name ?? "");
  if (surname && surname !== code.slice(0, 3)) out.push("cognome");

  const name = encodeName(person.first_name ?? "");
  if (name && name !== code.slice(3, 6)) out.push("nome");

  if (person.birth_date) {
    const [y, m, d] = person.birth_date.split("-").map(Number);
    if (y && m && d) {
      const yy = String(y % 100).padStart(2, "0");
      if (yy !== decoded.yy || m !== decoded.month || d !== decoded.day) {
        out.push("data di nascita");
      }
    }
  }

  if ((person.gender === "M" || person.gender === "F") && person.gender !== decoded.gender) {
    out.push("sesso");
  }

  const placeCode = code.slice(11, 15);
  const isForeignBorn = !!person.birth_country && !/ital/i.test(person.birth_country);
  if (isForeignBorn) {
    if (!placeCode.startsWith("Z")) out.push("luogo di nascita");
  } else if (placeCode.startsWith("Z")) {
    if (person.birth_city) out.push("luogo di nascita");
  } else if (person.birth_city && hasCatastaliLoaded()) {
    const expected = catastaleOf(person.birth_city);
    if (expected && expected !== placeCode && isKnownCatastale(placeCode)) {
      out.push("luogo di nascita");
    }
  }

  return out;
};

/**
 * Verifica la coerenza tra codice fiscale e dati anagrafici inseriti.
 * Restituisce un avviso (non bloccante) o null.
 */
export const fiscalCodeCoherenceWarning = (
  raw: string,
  birthDate: string | null | undefined,
  gender: string | null | undefined,
  names?: { first_name?: string | null; last_name?: string | null }
): string | null => {
  const mismatches = fiscalCodeMismatchFields(raw, {
    birth_date: birthDate ?? null,
    gender: gender ?? null,
    first_name: names?.first_name ?? null,
    last_name: names?.last_name ?? null,
  });
  if (mismatches.length === 0) return null;
  return `Il codice fiscale non corrisponde a ${mismatches.join(" / ")}. Verifica il codice e gli altri dati del profilo.`;
};

