/**
 * Valutazione di un talent rispetto ai requisiti di un ruolo.
 * A differenza del filtro del database, il dato vuoto non esclude:
 * diventa "missing", perché porta a chiedere al talent, non a scartarlo.
 */
import {
  formatRequiredValue,
  formatTalentValue,
  listRequirements,
  type RequirementSubject,
  type RoleRequirementsData,
} from "@/lib/roleRequirements";

export { getAge } from "@/lib/roleRequirements";

export type RequirementStatus = "met" | "unmet" | "missing";

export interface RequirementResult {
  key: string;
  label: string;
  mandatory: boolean;
  status: RequirementStatus;
  talentValue: string | null;
  requiredValue: string;
}

const lower = (s: unknown) => String(s).toLowerCase();

export function evaluateRequirements(subject: RequirementSubject, data: RoleRequirementsData): RequirementResult[] {
  return listRequirements(data).map(({ field, required, mandatory }) => {
    const raw = field.read(subject);
    const empty = raw === null || raw === undefined || raw === "" || (Array.isArray(raw) && raw.length === 0);
    let status: RequirementStatus = "missing";
    if (!empty) {
      switch (required.type) {
        case "number": {
          const n = Number(raw);
          status = (required.min === null || n >= required.min) && (required.max === null || n <= required.max) ? "met" : "unmet";
          break;
        }
        case "enum":
          status = lower(raw) === lower(required.value) ? "met" : "unmet";
          break;
        case "list": {
          const has = new Set((raw as string[]).map(lower));
          status = required.values.some((v) => has.has(lower(v))) ? "met" : "unmet";
          break;
        }
        case "boolean":
          status = raw === required.value ? "met" : "unmet";
          break;
      }
    }
    return {
      key: field.key,
      label: field.label,
      mandatory,
      status,
      talentValue: formatTalentValue(field, raw),
      requiredValue: formatRequiredValue(field, required),
    };
  });
}

export type RequirementSummary =
  | { kind: "unmet-one"; label: string }
  | { kind: "unmet-many"; count: number }
  | { kind: "missing"; count: number }
  | { kind: "ok" }
  | { kind: "none" };

/** Etichetta della riga: conta solo i requisiti obbligatori. */
export function summarizeRequirements(results: RequirementResult[]): RequirementSummary {
  const mandatory = results.filter((r) => r.mandatory);
  if (mandatory.length === 0) return { kind: "none" };
  const unmet = mandatory.filter((r) => r.status === "unmet");
  if (unmet.length === 1) return { kind: "unmet-one", label: unmet[0].label };
  if (unmet.length > 1) return { kind: "unmet-many", count: unmet.length };
  const missing = mandatory.filter((r) => r.status === "missing").length;
  if (missing > 0) return { kind: "missing", count: missing };
  return { kind: "ok" };
}

/** Ordine: più obbligatori soddisfatti, poi più preferenziali soddisfatti. */
export function compareRequirements(a: RequirementResult[], b: RequirementResult[]) {
  const count = (rs: RequirementResult[], mandatory: boolean) =>
    rs.filter((r) => r.mandatory === mandatory && r.status === "met").length;
  return count(b, true) - count(a, true) || count(b, false) - count(a, false);
}

/** Normalizza un profilo (relazione talent_attributes come oggetto o array). */
export function toRequirementSubject(p: Record<string, any> | null | undefined): RequirementSubject {
  const a = p?.attributes ?? p?.talent_attributes;
  return {
    gender: p?.gender ?? null,
    birth_date: p?.birth_date ?? null,
    gender_identity: p?.gender_identity ?? null,
    representation_type: p?.representation_type ?? null,
    nationality: p?.nationality ?? null,
    ethnicity: p?.ethnicity ?? null,
    has_vat_number: p?.has_vat_number ?? null,
    talent_categories: p?.talent_categories ?? null,
    attributes: (Array.isArray(a) ? a[0] : a) ?? null,
  };
}
