// =============================================================
// guardianship.ts — Regole condivise sui profili tutelati.
// La condizione di minore si deriva SEMPRE dalla data di nascita,
// non dalla titolarità dell'account: un profilo convertito smette
// di essere trattato come minore.
// =============================================================

export const ageFromBirthDate = (birthDate: string | null | undefined): number | null => {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
};

/** true solo se la data di nascita è nota e indica meno di 18 anni. */
export const isMinorBirthDate = (birthDate: string | null | undefined): boolean => {
  const age = ageFromBirthDate(birthDate);
  return age !== null && age < 18;
};

export const isAdultBirthDate = (birthDate: string | null | undefined): boolean => {
  const age = ageFromBirthDate(birthDate);
  return age !== null && age >= 18;
};

export interface GuardianContact {
  first_name?: string | null;
  last_name?: string | null;
  contact_email?: string | null;
  phone_prefix?: string | null;
  phone_number?: string | null;
  whatsapp_prefix?: string | null;
  whatsapp_number?: string | null;
}

export const formatPhone = (
  prefix?: string | null,
  number?: string | null
): string | null => (number ? `${(prefix ?? "").trim()} ${number}`.trim() : null);

export const guardianFullName = (g?: GuardianContact | null): string | null => {
  const name = [g?.first_name, g?.last_name].filter(Boolean).join(" ").trim();
  return name || null;
};

/** Etichetta usata su card, PDF e viste agenzia. */
export const MINOR_LABEL = "Minore";
export const MINOR_CONTACTS_NOTE = "Minore — contatti del tutore legale";
