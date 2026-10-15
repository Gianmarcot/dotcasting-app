// Registro dei campi del talent su cui un ruolo può porre un requisito.
// Unica fonte per: finestra del ruolo, valutazione del talent, pannello dettagli.
// Chiavi dei valori = chiavi dei filtri del Database Talenti (TalentFilters).
import type { TalentFilters, TalentWithAttributes } from "@/hooks/useTalents";
import {
  GENDERS, GENDER_IDENTITIES, REPRESENTATION_TYPES, NATIONALITIES, ETHNICITIES,
  EYE_COLORS, HAIR_COLORS, HAIR_LENGTHS, SHIRT_SIZES, LANGUAGES, TALENT_ROLES,
} from "@/lib/profileOptions";

export type RequirementType = "number" | "enum" | "list" | "boolean";
export type RequirementGroup = "ruolo" | "anagrafica" | "aspetto" | "misure" | "competenze" | "lavoro";

export const REQUIREMENT_GROUP_LABELS: Record<RequirementGroup, string> = {
  ruolo: "Ruolo",
  anagrafica: "Anagrafica",
  aspetto: "Aspetto",
  misure: "Misure",
  competenze: "Competenze",
  lavoro: "Lavoro",
};

/** Dati del talent letti dalla valutazione (stessa forma del Database Talenti). */
export type RequirementSubject = Pick<
  TalentWithAttributes,
  "gender" | "birth_date" | "gender_identity" | "representation_type" | "nationality" | "ethnicity" | "has_vat_number" | "talent_categories"
> & { attributes: Partial<NonNullable<TalentWithAttributes["attributes"]>> | null };

type Option = { value: string; label: string };
type Raw = string | number | boolean | string[] | null | undefined;

interface Base {
  key: string;
  label: string;
  group: RequirementGroup;
  read: (t: RequirementSubject) => Raw;
}
export interface NumberField extends Base { type: "number"; minKey: keyof TalentFilters; maxKey: keyof TalentFilters; unit?: string }
export interface EnumField extends Base { type: "enum"; filterKey: keyof TalentFilters; options: Option[] }
/** options assenti = elenco aperto (valori presi dai profili esistenti). */
export interface ListField extends Base { type: "list"; filterKey: keyof TalentFilters; options?: Option[] }
export interface BooleanField extends Base { type: "boolean"; filterKey: keyof TalentFilters }
export type RequirementField = NumberField | EnumField | ListField | BooleanField;

const opts = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }));
const num = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number.isNaN(Number(v)) ? null : Number(v));

export function getAge(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export const REQUIREMENT_FIELDS: RequirementField[] = [
  { key: "talentRoles", label: "Ruolo talent", group: "ruolo", type: "list", filterKey: "talentRoles",
    options: opts([...TALENT_ROLES.artistic, ...TALENT_ROLES.creative, ...TALENT_ROLES.production]), read: (t) => t.talent_categories },
  { key: "gender", label: "Sesso", group: "anagrafica", type: "enum", filterKey: "gender", options: GENDERS,
    // l'onboarding storico salva male/female: stessi valori del profilo
    read: (t) => (t.gender === "male" ? "M" : t.gender === "female" ? "F" : t.gender) },
  { key: "age", label: "Età", group: "anagrafica", type: "number", minKey: "ageMin", maxKey: "ageMax", unit: "anni", read: (t) => getAge(t.birth_date) },
  { key: "genderIdentity", label: "Identità di genere", group: "anagrafica", type: "enum", filterKey: "genderIdentity", options: opts(GENDER_IDENTITIES), read: (t) => t.gender_identity },
  { key: "representationType", label: "Rappresentanza", group: "anagrafica", type: "enum", filterKey: "representationType", options: REPRESENTATION_TYPES, read: (t) => t.representation_type },
  { key: "nationality", label: "Nazionalità", group: "anagrafica", type: "enum", filterKey: "nationality", options: opts(NATIONALITIES), read: (t) => t.nationality },
  { key: "ethnicity", label: "Carnagione", group: "aspetto", type: "enum", filterKey: "ethnicity", options: opts(ETHNICITIES), read: (t) => t.ethnicity },
  { key: "eyeColor", label: "Colore occhi", group: "aspetto", type: "enum", filterKey: "eyeColor", options: opts(EYE_COLORS), read: (t) => t.attributes?.eye_color },
  { key: "hairColor", label: "Colore capelli", group: "aspetto", type: "enum", filterKey: "hairColor", options: opts(HAIR_COLORS), read: (t) => t.attributes?.hair_color },
  { key: "hairLength", label: "Lunghezza capelli", group: "aspetto", type: "enum", filterKey: "hairLength", options: opts(HAIR_LENGTHS), read: (t) => t.attributes?.hair_length },
  { key: "height", label: "Altezza", group: "misure", type: "number", minKey: "heightMin", maxKey: "heightMax", unit: "cm", read: (t) => t.attributes?.height },
  { key: "weight", label: "Peso", group: "misure", type: "number", minKey: "weightMin", maxKey: "weightMax", unit: "kg", read: (t) => t.attributes?.weight },
  { key: "shirtSize", label: "Taglia", group: "misure", type: "enum", filterKey: "shirtSize", options: opts(SHIRT_SIZES), read: (t) => t.attributes?.shirt_size },
  { key: "shoe", label: "Numero di scarpe", group: "misure", type: "number", minKey: "shoeMin", maxKey: "shoeMax", read: (t) => num(t.attributes?.shoe_size ? parseInt(String(t.attributes.shoe_size)) : null) },
  { key: "chest", label: "Busto", group: "misure", type: "number", minKey: "chestMin", maxKey: "chestMax", unit: "cm", read: (t) => t.attributes?.chest },
  { key: "hips", label: "Fianchi", group: "misure", type: "number", minKey: "hipsMin", maxKey: "hipsMax", unit: "cm", read: (t) => t.attributes?.hips },
  { key: "skills", label: "Competenze", group: "competenze", type: "list", filterKey: "skills", read: (t) => t.attributes?.skills },
  { key: "languages", label: "Lingue", group: "competenze", type: "list", filterKey: "languages", options: opts(LANGUAGES), read: (t) => t.attributes?.languages },
  { key: "hasVat", label: "Partita IVA", group: "lavoro", type: "boolean", filterKey: "hasVat", read: (t) => t.has_vat_number },
];

export const fieldByKey = (key: string) => REQUIREMENT_FIELDS.find((f) => f.key === key);

/** Forma salvata in casting_roles.requirements. */
export interface RoleRequirementsData {
  values: Partial<TalentFilters>;
  mandatory: Record<string, boolean>;
}

/** Valore richiesto per un campo, o null se non impostato. */
export type RequiredValue =
  | { type: "number"; min: number | null; max: number | null }
  | { type: "enum"; value: string }
  | { type: "list"; values: string[] }
  | { type: "boolean"; value: boolean };

export function requiredValueOf(field: RequirementField, values: Partial<TalentFilters>): RequiredValue | null {
  const v = values as Record<string, unknown>;
  switch (field.type) {
    case "number": {
      const min = num(v[field.minKey]);
      const max = num(v[field.maxKey]);
      return min === null && max === null ? null : { type: "number", min, max };
    }
    case "enum": {
      const s = v[field.filterKey];
      return typeof s === "string" && s && s !== "any" ? { type: "enum", value: s } : null;
    }
    case "list": {
      const a = v[field.filterKey];
      const list = Array.isArray(a) ? a.filter((x): x is string => typeof x === "string" && !!x.trim()) : [];
      return list.length ? { type: "list", values: list } : null;
    }
    case "boolean": {
      const b = v[field.filterKey];
      return typeof b === "boolean" ? { type: "boolean", value: b } : null;
    }
  }
}

/** Requisiti di un ruolo: dall'oggetto, o dalle vecchie colonne se l'oggetto manca. */
export function readRoleRequirements(role: {
  requirements?: unknown;
  gender?: string | null;
  age_min?: number | null;
  age_max?: number | null;
  required_skills?: string[] | null;
}): RoleRequirementsData {
  const r = role.requirements as Partial<RoleRequirementsData> | null | undefined;
  if (r && typeof r === "object" && r.values) return { values: r.values, mandatory: r.mandatory ?? {} };
  const values: Partial<TalentFilters> = {};
  const mandatory: Record<string, boolean> = {};
  if (role.gender && role.gender !== "any") { values.gender = role.gender; mandatory.gender = true; }
  if (role.age_min) values.ageMin = role.age_min;
  if (role.age_max) values.ageMax = role.age_max;
  if (role.age_min || role.age_max) mandatory.age = true;
  if (role.required_skills?.length) { values.skills = role.required_skills; mandatory.skills = true; }
  return { values, mandatory };
}

/** Elimina i requisiti senza valore e restituisce le colonne riflesso. */
export function normalizeRequirements(data: RoleRequirementsData) {
  const values: Partial<TalentFilters> = {};
  const mandatory: Record<string, boolean> = {};
  for (const f of REQUIREMENT_FIELDS) {
    const rv = requiredValueOf(f, data.values);
    if (!rv) continue;
    mandatory[f.key] = data.mandatory[f.key] !== false;
    const out = values as Record<string, unknown>;
    if (rv.type === "number") {
      if (rv.min !== null) out[(f as NumberField).minKey] = rv.min;
      if (rv.max !== null) out[(f as NumberField).maxKey] = rv.max;
    } else if (rv.type === "list") out[(f as ListField).filterKey] = rv.values;
    else out[(f as EnumField | BooleanField).filterKey] = rv.value;
  }
  return {
    requirements: { values, mandatory } as RoleRequirementsData,
    gender: (values.gender as string | undefined) ?? null,
    age_min: values.ageMin ?? null,
    age_max: values.ageMax ?? null,
    required_skills: values.skills ?? [],
  };
}

/** Filtri del Database Talenti corrispondenti ai requisiti obbligatori. */
export function mandatoryFilters(data: RoleRequirementsData): TalentFilters {
  const { requirements } = normalizeRequirements(data);
  const out: Record<string, unknown> = {};
  for (const f of REQUIREMENT_FIELDS) {
    if (!requirements.mandatory[f.key]) continue;
    const keys = f.type === "number" ? [f.minKey, f.maxKey] : [f.filterKey];
    for (const k of keys) {
      const v = (requirements.values as Record<string, unknown>)[k];
      if (v !== undefined) out[k] = v;
    }
  }
  return out as TalentFilters;
}

const optionLabel = (field: RequirementField, v: string) =>
  ("options" in field && field.options?.find((o) => o.value === v)?.label) || v;

/** Valore richiesto formattato secondo il tipo: "almeno 170 cm", "Verdi", "Sì". */
export function formatRequiredValue(field: RequirementField, rv: RequiredValue): string {
  switch (rv.type) {
    case "number": {
      const u = field.type === "number" && field.unit ? ` ${field.unit}` : "";
      if (rv.min !== null && rv.max !== null) return rv.min === rv.max ? `${rv.min}${u}` : `tra ${rv.min} e ${rv.max}${u}`;
      if (rv.min !== null) return `almeno ${rv.min}${u}`;
      return `al massimo ${rv.max}${u}`;
    }
    case "enum": return optionLabel(field, rv.value);
    case "list": return rv.values.map((v) => optionLabel(field, v)).join(", ");
    case "boolean": return rv.value ? "Sì" : "No";
  }
}

export function formatTalentValue(field: RequirementField, raw: Raw): string | null {
  if (raw === null || raw === undefined || raw === "") return null;
  if (Array.isArray(raw)) return raw.length ? raw.map((v) => optionLabel(field, v)).join(", ") : null;
  if (typeof raw === "boolean") return raw ? "Sì" : "No";
  if (typeof raw === "number") return field.type === "number" && field.unit ? `${raw} ${field.unit}` : String(raw);
  return optionLabel(field, raw);
}

/** Requisiti impostati, nell'ordine del registro. */
export function listRequirements(data: RoleRequirementsData) {
  return REQUIREMENT_FIELDS.flatMap((field) => {
    const rv = requiredValueOf(field, data.values);
    return rv ? [{ field, required: rv, mandatory: data.mandatory[field.key] !== false }] : [];
  });
}
