/** Validazione numeri di telefono. Restituisce un messaggio d'errore o null. */
export const validatePhoneNumber = (prefix: string | null | undefined, raw: string): string | null => {
  const value = raw.trim();
  if (!value) return "Inserisci un numero di telefono";
  if (!/^[\d\s().-]+$/.test(value)) return "Usa solo numeri, senza lettere o simboli";
  const digits = value.replace(/\D/g, "");
  const prefixDigits = (prefix || "").replace(/\D/g, "");
  const invalid = "Numero di telefono non valido";

  if (/^(\d)\1+$/.test(digits)) return invalid;
  if (prefixDigits.length + digits.length > 15) return invalid;

  if (prefixDigits === "39") {
    // Cellulari: 3xx, 9–10 cifre. Fissi: 0x, 6–11 cifre.
    if (/^3\d{8,9}$/.test(digits)) return null;
    if (/^0\d{5,10}$/.test(digits)) return null;
    return invalid;
  }
  if (digits.length < 6 || digits.length > 14) return invalid;
  return null;
};
