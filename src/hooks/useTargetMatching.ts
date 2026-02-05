import { useMemo } from "react";
import { useTalents, TalentWithAttributes, calculateAge } from "./useTalents";
import type { TargetCriteria } from "./useTargets";

export interface MatchResult {
  talent: TalentWithAttributes;
  matchScore: number;
  matchedCriteria: string[];
}

// Match talents against target criteria
export const matchTalentsWithCriteria = (
  talents: TalentWithAttributes[],
  criteria: TargetCriteria
): MatchResult[] => {
  if (!criteria || Object.keys(criteria).length === 0) {
    return talents.map(talent => ({
      talent,
      matchScore: 0,
      matchedCriteria: []
    }));
  }

  return talents
    .map(talent => {
      const matchedCriteria: string[] = [];
      let totalCriteria = 0;
      let matchedCount = 0;

      // Gender
      if (criteria.gender && criteria.gender.length > 0) {
        totalCriteria++;
        if (talent.gender && criteria.gender.includes(talent.gender)) {
          matchedCount++;
          matchedCriteria.push("Genere");
        } else {
          return null; // Exclude if gender doesn't match
        }
      }

      // Age
      if (criteria.age_min !== undefined || criteria.age_max !== undefined) {
        totalCriteria++;
        const age = calculateAge(talent.birth_date);
        if (age !== null) {
          const minOk = criteria.age_min === undefined || age >= criteria.age_min;
          const maxOk = criteria.age_max === undefined || age <= criteria.age_max;
          if (minOk && maxOk) {
            matchedCount++;
            matchedCriteria.push("Età");
          } else {
            return null; // Exclude if age doesn't match
          }
        }
      }

      // Cities
      if (criteria.cities && criteria.cities.length > 0) {
        totalCriteria++;
        if (talent.city && criteria.cities.some(c => 
          talent.city?.toLowerCase().includes(c.toLowerCase())
        )) {
          matchedCount++;
          matchedCriteria.push("Città");
        } else {
          return null; // Exclude if city doesn't match
        }
      }

      // Categories
      if (criteria.categories && criteria.categories.length > 0) {
        totalCriteria++;
        if (talent.talent_categories && criteria.categories.some(c => 
          talent.talent_categories?.includes(c)
        )) {
          matchedCount++;
          matchedCriteria.push("Categoria");
        } else {
          return null; // Exclude if category doesn't match
        }
      }

      // Height
      if (criteria.height_min !== undefined || criteria.height_max !== undefined) {
        totalCriteria++;
        const height = talent.attributes?.height;
        if (height !== null && height !== undefined) {
          const minOk = criteria.height_min === undefined || height >= criteria.height_min;
          const maxOk = criteria.height_max === undefined || height <= criteria.height_max;
          if (minOk && maxOk) {
            matchedCount++;
            matchedCriteria.push("Altezza");
          } else {
            return null; // Exclude if height doesn't match
          }
        }
      }

      // Hair colors (optional - don't exclude)
      if (criteria.hair_colors && criteria.hair_colors.length > 0) {
        totalCriteria++;
        if (talent.attributes?.hair_color && criteria.hair_colors.includes(talent.attributes.hair_color)) {
          matchedCount++;
          matchedCriteria.push("Colore capelli");
        }
      }

      // Eye colors (optional - don't exclude)
      if (criteria.eye_colors && criteria.eye_colors.length > 0) {
        totalCriteria++;
        if (talent.attributes?.eye_color && criteria.eye_colors.includes(talent.attributes.eye_color)) {
          matchedCount++;
          matchedCriteria.push("Colore occhi");
        }
      }

      // Skills (optional - don't exclude)
      if (criteria.skills && criteria.skills.length > 0) {
        totalCriteria++;
        if (talent.attributes?.skills && criteria.skills.some(s => 
          talent.attributes?.skills?.includes(s)
        )) {
          matchedCount++;
          matchedCriteria.push("Competenze");
        }
      }

      // Languages (optional - don't exclude)
      if (criteria.languages && criteria.languages.length > 0) {
        totalCriteria++;
        if (talent.attributes?.languages && criteria.languages.some(l => 
          talent.attributes?.languages?.includes(l)
        )) {
          matchedCount++;
          matchedCriteria.push("Lingue");
        }
      }

      const matchScore = totalCriteria > 0 ? (matchedCount / totalCriteria) * 100 : 0;

      return {
        talent,
        matchScore,
        matchedCriteria
      };
    })
    .filter((result): result is MatchResult => result !== null)
    .sort((a, b) => b.matchScore - a.matchScore);
};

// Hook to get matching talents for criteria
export const useTargetMatching = (criteria: TargetCriteria | null) => {
  const { data: talents, isLoading, error } = useTalents({});

  const matchResults = useMemo(() => {
    if (!talents || !criteria) return [];
    return matchTalentsWithCriteria(talents, criteria);
  }, [talents, criteria]);

  return {
    matchResults,
    totalTalents: talents?.length || 0,
    matchCount: matchResults.length,
    isLoading,
    error,
  };
};

// Format criteria for display
export const formatCriteriaSummary = (criteria: TargetCriteria): string => {
  const parts: string[] = [];

  if (criteria.gender && criteria.gender.length > 0) {
    const genderLabels: Record<string, string> = { M: "M", F: "F", NB: "NB" };
    parts.push(criteria.gender.map(g => genderLabels[g] || g).join("/"));
  }

  if (criteria.age_min !== undefined || criteria.age_max !== undefined) {
    const min = criteria.age_min ?? "?";
    const max = criteria.age_max ?? "?";
    parts.push(`${min}-${max} anni`);
  }

  if (criteria.cities && criteria.cities.length > 0) {
    parts.push(criteria.cities.slice(0, 2).join("/") + (criteria.cities.length > 2 ? "..." : ""));
  }

  if (criteria.height_min !== undefined || criteria.height_max !== undefined) {
    const min = criteria.height_min ?? "?";
    const max = criteria.height_max ?? "?";
    parts.push(`${min}-${max}cm`);
  }

  if (criteria.categories && criteria.categories.length > 0) {
    parts.push(criteria.categories[0] + (criteria.categories.length > 1 ? "..." : ""));
  }

  return parts.join(" • ") || "Nessun criterio";
};
