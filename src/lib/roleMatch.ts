/** Compatibilità di un profilo con i requisiti di un ruolo (sesso, età, competenze). */
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

export function computeMatchScore(profile: MatchableProfile, role: RoleRequirements): MatchScore {
  let total = 0;
  let matched = 0;

  if (role.gender && role.gender !== "any") {
    total++;
    if (profile.gender === role.gender) matched++;
  }

  if (role.age_min || role.age_max) {
    total++;
    const age = getAge(profile.birth_date);
    if (age !== null) {
      const minOk = !role.age_min || age >= role.age_min;
      const maxOk = !role.age_max || age <= role.age_max;
      if (minOk && maxOk) matched++;
    }
  }

  if (role.required_skills && role.required_skills.length > 0) {
    const talentSkills = (profile.skills || []).map((s) => s.toLowerCase());
    for (const skill of role.required_skills) {
      total++;
      if (talentSkills.includes(skill.toLowerCase())) matched++;
    }
  }

  return { matched, total };
}

export const hasRoleRequirements = (role: RoleRequirements | null | undefined) =>
  !!role &&
  ((!!role.gender && role.gender !== "any") ||
    !!role.age_min ||
    !!role.age_max ||
    (!!role.required_skills && role.required_skills.length > 0));

/** Ordina per rapporto di compatibilità decrescente, poi per requisiti soddisfatti. */
export const compareMatch = (a: MatchScore, b: MatchScore) => {
  const ratioA = a.total > 0 ? a.matched / a.total : 0;
  const ratioB = b.total > 0 ? b.matched / b.total : 0;
  if (ratioB !== ratioA) return ratioB - ratioA;
  return b.matched - a.matched;
};
