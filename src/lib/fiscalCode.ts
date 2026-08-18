/**
 * Validazione del codice fiscale italiano (persone fisiche).
 * Include controllo del formato e del carattere di controllo (CIN).
 */

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

/**
 * Verifica la coerenza tra codice fiscale e dati anagrafici inseriti.
 * Restituisce un avviso (non bloccante) o null.
 */
export const fiscalCodeCoherenceWarning = (
  raw: string,
  birthDate: string | null | undefined,
  gender: string | null | undefined
): string | null => {
  const decoded = decodeFiscalCode(raw);
  if (!decoded) return null;

  const mismatches: string[] = [];

  if (birthDate) {
    const [y, m, d] = birthDate.split("-").map(Number);
    if (y && m && d) {
      const yy = String(y % 100).padStart(2, "0");
      if (yy !== decoded.yy || m !== decoded.month || d !== decoded.day) {
        mismatches.push("data di nascita");
      }
    }
  }

  if (gender === "M" || gender === "F") {
    if (gender !== decoded.gender) mismatches.push("sesso");
  }

  if (mismatches.length === 0) return null;
  return `Il codice fiscale non corrisponde a ${mismatches.join(" / ")}`;
};
