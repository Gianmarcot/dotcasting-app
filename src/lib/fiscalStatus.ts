// =============================================================
// fiscalStatus.ts — Stato del codice fiscale di un profilo talent.
// Lo stato è persistito su profiles.fiscal_code_status (colonna
// generata) e qui viene ricalcolato per i casi in cui la riga non
// è ancora stata riletta dal server.
// =============================================================

export type FiscalStatus = "ok" | "mismatch" | "missing" | "none_italian";

export interface FiscalStatusSource {
  has_italian_fiscal_code?: boolean | null;
  fiscal_code?: string | null;
  fiscal_code_mismatch?: boolean | null;
  fiscal_code_status?: string | null;
}

export const deriveFiscalStatus = (p: FiscalStatusSource | null | undefined): FiscalStatus => {
  if (!p) return "missing";
  if (p.has_italian_fiscal_code === false) return "none_italian";
  if (!p.fiscal_code || !p.fiscal_code.trim()) return "missing";
  if (p.fiscal_code_mismatch) return "mismatch";
  return "ok";
};

export const fiscalStatusOf = (p: FiscalStatusSource | null | undefined): FiscalStatus => {
  const stored = p?.fiscal_code_status;
  if (stored === "ok" || stored === "mismatch" || stored === "missing" || stored === "none_italian") {
    return stored;
  }
  return deriveFiscalStatus(p);
};

export const FISCAL_STATUS_LABELS: Record<FiscalStatus, string> = {
  ok: "Codice fiscale coerente",
  mismatch: "Codice fiscale da verificare",
  missing: "Codice fiscale non inserito",
  none_italian: "Senza codice fiscale italiano",
};

/** Etichetta breve usata su card e righe. */
export const FISCAL_STATUS_SHORT: Record<FiscalStatus, string> = {
  ok: "",
  mismatch: "CF da verificare",
  missing: "CF non inserito",
  none_italian: "Senza CF italiano",
};

export const FISCAL_STATUS_DESCRIPTIONS: Record<FiscalStatus, string> = {
  ok: "Il codice fiscale è presente e coerente con gli altri dati del profilo.",
  mismatch:
    "Il codice fiscale inserito non combacia con gli altri dati del profilo: serve un controllo.",
  missing:
    "Il talent ha dichiarato di avere un codice fiscale italiano ma non lo ha ancora inserito.",
  none_italian:
    "Il talent ha dichiarato di non avere un codice fiscale italiano: non può essere contrattualizzato.",
};

/** Solo gli stati che richiedono attenzione vengono mostrati come etichetta. */
export const isFiscalStatusProblematic = (status: FiscalStatus) => status !== "ok";

export const FISCAL_STATUS_FILTER_OPTIONS: { value: FiscalStatus; label: string }[] = [
  { value: "missing", label: FISCAL_STATUS_LABELS.missing },
  { value: "none_italian", label: FISCAL_STATUS_LABELS.none_italian },
  { value: "mismatch", label: FISCAL_STATUS_LABELS.mismatch },
  { value: "ok", label: FISCAL_STATUS_LABELS.ok },
];
