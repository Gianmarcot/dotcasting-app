/**
 * Requisiti di un ruolo valutati uno per uno sul profilo di un talent.
 * Ogni requisito ha un valutatore in REQUIREMENT_EVALUATORS: per aggiungere
 * requisiti arbitrari (o la distinzione obbligatori/preferenziali) basta
 * aggiungere valutatori o un campo `kind` al risultato.
 */
export interface RoleRequirements {
  gender: string | null;
  age_min: number | null;
  age_max: number | null;
  required_skills: string[] | null;
}

export interface MatchableProfile {
  gender: string | null;
  birth_date: string | null;
  skills: string[] | null | undefined;
}

export type RequirementStatus = "met" | "unmet" | "missing";

export interface RequirementResult {
  key: string;
  label: string;
  status: RequirementStatus;
  talentValue: string | null;
  requiredValue: string;
}

export interface MatchScore {
  matched: number;
  total: number;
}

export function getAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const genderLabel = (g: string | null) =>
  g === "M" ? "Maschile" : g === "F" ? "Femminile" : g;

type Evaluator = (p: MatchableProfile, r: RoleRequirements) => RequirementResult[];

const evaluateGender: Evaluator = (p, r) => {
  if (!r.gender || r.gender === "any") return [];
  return [
    {
      key: "gender",
      label: "Sesso",
      requiredValue: genderLabel(r.gender) ?? r.gender,
      talentValue: p.gender ? genderLabel(p.gender) : null,
      status: !p.gender ? "missing" : p.gender === r.gender ? "met" : "unmet",
    },
  ];
};

const evaluateAge: Evaluator = (p, r) => {
  if (!r.age_min && !r.age_max) return [];
  const age = getAge(p.birth_date);
  const ok = age !== null && (!r.age_min || age >= r.age_min) && (!r.age_max || age <= r.age_max);
  return [
    {
      key: "age",
      label: "Età",
      requiredValue: `${r.age_min ?? "?"}–${r.age_max ?? "?"} anni`,
      talentValue: age === null ? null : `${age} anni`,
      status: age === null ? "missing" : ok ? "met" : "unmet",
    },
  ];
};

const evaluateSkills: Evaluator = (p, r) => {
  const required = r.required_skills ?? [];
  if (required.length === 0) return [];
  const has = (p.skills ?? []).map((s) => s.toLowerCase());
  const empty = has.length === 0;
  return required.map((skill) => ({
    key: `skill:${skill}`,
    label: skill,
    requiredValue: "Richiesta",
    talentValue: empty ? null : has.includes(skill.toLowerCase()) ? "Sì" : "No",
    status: empty ? "missing" : has.includes(skill.toLowerCase()) ? "met" : "unmet",
  }));
};

const REQUIREMENT_EVALUATORS: Evaluator[] = [evaluateGender, evaluateAge, evaluateSkills];

export function evaluateRequirements(
  profile: MatchableProfile,
  role: RoleRequirements,
): RequirementResult[] {
  return REQUIREMENT_EVALUATORS.flatMap((e) => e(profile, role));
}

export type RequirementSummary =
  | { kind: "unmet-one"; label: string }
  | { kind: "unmet-many"; count: number }
  | { kind: "missing"; count: number }
  | { kind: "ok" }
  | { kind: "none" };

/** Etichetta della riga: mostra l'eccezione, non la regola. */
export function summarizeRequirements(results: RequirementResult[]): RequirementSummary {
  if (results.length === 0) return { kind: "none" };
  const unmet = results.filter((r) => r.status === "unmet");
  if (unmet.length === 1) return { kind: "unmet-one", label: unmet[0].label };
  if (unmet.length > 1) return { kind: "unmet-many", count: unmet.length };
  const missing = results.filter((r) => r.status === "missing").length;
  if (missing > 0) return { kind: "missing", count: missing };
  return { kind: "ok" };
}

export function computeMatchScore(profile: MatchableProfile, role: RoleRequirements): MatchScore {
  const results = evaluateRequirements(profile, role);
  return { total: results.length, matched: results.filter((r) => r.status === "met").length };
}

export const hasRoleRequirements = (role: RoleRequirements | null | undefined) =>
  !!role && evaluateRequirements({ gender: null, birth_date: null, skills: null }, role).length > 0;

/** Ordina per rapporto di compatibilità decrescente, poi per requisiti soddisfatti. */
export const compareMatch = (a: MatchScore, b: MatchScore) => {
  const ratioA = a.total > 0 ? a.matched / a.total : 0;
  const ratioB = b.total > 0 ? b.matched / b.total : 0;
  if (ratioB !== ratioA) return ratioB - ratioA;
  return b.matched - a.matched;
};
