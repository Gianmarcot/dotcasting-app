// =============================================================
// roleVisibility.ts — unico punto di verità delle regole di visibilità
// basate sui ruoli selezionati dal talent (talent_categories).
// Letto da: pagina profilo, modale foto, modale video, forza del
// profilo, comunicazioni automatiche, anteprima e PDF.
// =============================================================

import { TALENT_ROLES } from "@/lib/profileOptions";

export type Division = "artistic" | "creative" | "production";

/** Ruolo che, da solo, abilita le foto dei piedi. */
export const FOOT_ROLE = "Piedista";

/** Mappa ruolo → divisione, derivata dal vocabolario dei ruoli. */
const ROLE_DIVISION: Record<string, Division> = (() => {
  const out: Record<string, Division> = {};
  (Object.keys(TALENT_ROLES) as Division[]).forEach((division) => {
    TALENT_ROLES[division].forEach((role) => {
      out[role] = division;
    });
  });
  return out;
})();

export const getDivisions = (roles: string[] | null | undefined): Set<Division> => {
  const set = new Set<Division>();
  (roles ?? []).forEach((role) => {
    const division = ROLE_DIVISION[role];
    if (division) set.add(division);
  });
  return set;
};

/* ----------------------------- Categorie media ---------------------------- */

/** Categoria foto profilo: sempre visibile, un solo elemento. */
export const PROFILE_PHOTO_CATEGORY = "profile_photo";

type CategoryRule = {
  key: string;
  /** Divisioni che abilitano la categoria. */
  divisions?: Division[];
  /** Ruoli specifici che abilitano la categoria. */
  roles?: string[];
  /** Sempre visibile, indipendentemente dai ruoli. */
  always?: boolean;
};

const PHOTO_RULES: CategoryRule[] = [
  { key: PROFILE_PHOTO_CATEGORY, always: true },
  { key: "main_photos", divisions: ["artistic"] },
  { key: "polaroids", divisions: ["artistic"] },
  { key: "hands", divisions: ["artistic"] },
  { key: "feet", roles: [FOOT_ROLE] },
  { key: "works", divisions: ["creative"] },
];

const VIDEO_RULES: CategoryRule[] = [
  { key: "intro_video", divisions: ["artistic", "creative"] },
  { key: "showreel", divisions: ["artistic", "creative"] },
  { key: "other_videos", divisions: ["artistic", "creative"] },
];

const matches = (rule: CategoryRule, roles: string[], divisions: Set<Division>) => {
  if (rule.always) return true;
  if (rule.roles?.some((r) => roles.includes(r))) return true;
  return !!rule.divisions?.some((d) => divisions.has(d));
};

const visibleKeys = (rules: CategoryRule[], roles: string[] | null | undefined) => {
  const list = roles ?? [];
  const divisions = getDivisions(list);
  return rules.filter((rule) => matches(rule, list, divisions)).map((rule) => rule.key);
};

export const visiblePhotoCategories = (roles: string[] | null | undefined): string[] =>
  visibleKeys(PHOTO_RULES, roles);

export const visibleVideoCategories = (roles: string[] | null | undefined): string[] =>
  visibleKeys(VIDEO_RULES, roles);

export const visibleMediaCategories = (roles: string[] | null | undefined): string[] => [
  ...visiblePhotoCategories(roles),
  ...visibleVideoCategories(roles),
];

export const isMediaCategoryVisible = (
  category: string | null | undefined,
  roles: string[] | null | undefined
) => visibleMediaCategories(roles).includes(category ?? "main_photos");

/* ------------------------------ Campi fisici ------------------------------ */

export interface PhysicalContext {
  roles: string[] | null | undefined;
  /** Maggiore età calcolata con la logica già presente nell'app. */
  isAdult: boolean;
  /** Campo "Sesso" (M/F), non l'identità di genere. */
  gender: string | null | undefined;
}

/** Chiavi dei campi condizionati ai ruoli (scope indicato per la persistenza). */
export const PHYSICAL_FIELD_LABELS: Record<string, string> = {
  height: "Altezza",
  jacket_size: "Taglia giacca",
  pants_size: "Taglia pantaloni",
  eye_color: "Colore occhi",
  hair_color: "Colore capelli",
  hair_length: "Lunghezza capelli",
  hair_type: "Tipologia capelli",
  shoe_size: "Numero scarpe",
  ethnicity: "Etnia",
  chest: "Petto o busto",
  waist: "Vita",
  hips: "Fianchi",
  shoulder_width: "Larghezza spalle",
  bra_size: "Taglia reggiseno",
  neck_size: "Misura collo camicia",
};

const ARTISTIC_FIELDS = [
  "height",
  "jacket_size",
  "pants_size",
  "eye_color",
  "hair_color",
  "hair_length",
  "hair_type",
  "shoe_size",
  "ethnicity",
];

export const visiblePhysicalFields = ({ roles, isAdult, gender }: PhysicalContext): string[] => {
  const divisions = getDivisions(roles);
  if (!divisions.has("artistic")) return [];

  const fields = [...ARTISTIC_FIELDS];
  if (isAdult) {
    fields.push("chest", "waist", "hips", "shoulder_width");
    if (gender === "F") fields.push("bra_size");
    if (gender === "M") fields.push("neck_size");
  }
  return fields;
};

export const isPhysicalFieldVisible = (key: string, ctx: PhysicalContext) =>
  visiblePhysicalFields(ctx).includes(key);

/** Etichetta della misura del torace: segue il sesso, stesso campo a database. */
export const chestLabel = (gender: string | null | undefined) =>
  gender === "F" ? "Busto (cm)" : "Petto (cm)";
