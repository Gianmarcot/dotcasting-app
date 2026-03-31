import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TalentFilters {
  search?: string;
  city?: string;
  category?: string;
  skills?: string[];
  gender?: string;
  // New filters
  talentRole?: string;
  availability?: string;
  ageMin?: number;
  ageMax?: number;
  region?: string;
  genderIdentity?: string;
  representationType?: string;
  nationality?: string;
  ethnicity?: string;
  eyeColor?: string;
  hairColor?: string;
  hairLength?: string;
  heightMin?: number;
  heightMax?: number;
  weightMin?: number;
  weightMax?: number;
  shirtSize?: string;
  shoeMin?: number;
  shoeMax?: number;
  chestMin?: number;
  chestMax?: number;
  hipsMin?: number;
  hipsMax?: number;
  skillSearch?: string;
  language?: string;
  hasVat?: boolean;
  travelAvailability?: string;
}

export interface TalentWithAttributes {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  country: string | null;
  gender: string | null;
  birth_date: string | null;
  profile_photo_url: string | null;
  talent_categories: string[] | null;
  bio: string | null;
  nationality: string | null;
  ethnicity: string | null;
  gender_identity: string | null;
  representation_type: string | null;
  has_vat_number: boolean | null;
  attributes: {
    height: number | null;
    weight: number | null;
    hair_color: string | null;
    hair_length: string | null;
    eye_color: string | null;
    skills: string[] | null;
    languages: string[] | null;
    chest: number | null;
    hips: number | null;
    shirt_size: string | null;
    shoe_size: string | null;
  } | null;
}

export const useTalents = (filters: TalentFilters = {}) => {
  return useQuery({
    queryKey: ["owner-talents", filters],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          city,
          country,
          gender,
          birth_date,
          profile_photo_url,
          talent_categories,
          bio,
          nationality,
          ethnicity,
          gender_identity,
          representation_type,
          has_vat_number,
          talent_attributes (
            height,
            weight,
            hair_color,
            hair_length,
            eye_color,
            skills,
            languages,
            chest,
            hips,
            shirt_size,
            shoe_size
          )
        `)
        .eq("onboarding_completed", true)
        .order("created_at", { ascending: false });

      // Apply DB-level filters
      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }
      if (filters.gender) {
        query = query.eq("gender", filters.gender);
      }
      if (filters.category) {
        query = query.contains("talent_categories", [filters.category]);
      }
      if (filters.talentRole) {
        query = query.contains("talent_categories", [filters.talentRole]);
      }
      if (filters.genderIdentity) {
        query = query.eq("gender_identity", filters.genderIdentity);
      }
      if (filters.representationType) {
        query = query.eq("representation_type", filters.representationType);
      }
      if (filters.nationality) {
        query = query.eq("nationality", filters.nationality);
      }
      if (filters.ethnicity) {
        query = query.eq("ethnicity", filters.ethnicity);
      }
      if (filters.hasVat === true) {
        query = query.eq("has_vat_number", true);
      } else if (filters.hasVat === false) {
        query = query.eq("has_vat_number", false);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform data
      const talents: TalentWithAttributes[] = (data || []).map((profile: any) => ({
        id: profile.id,
        user_id: profile.user_id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        city: profile.city,
        country: profile.country,
        gender: profile.gender,
        birth_date: profile.birth_date,
        profile_photo_url: profile.profile_photo_url,
        talent_categories: profile.talent_categories,
        bio: profile.bio,
        nationality: profile.nationality,
        ethnicity: profile.ethnicity,
        gender_identity: profile.gender_identity,
        representation_type: profile.representation_type,
        has_vat_number: profile.has_vat_number,
        attributes: profile.talent_attributes?.[0] || null,
      }));

      // Client-side filters
      let filtered = talents;

      if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.first_name?.toLowerCase().includes(s) ||
            t.last_name?.toLowerCase().includes(s) ||
            t.city?.toLowerCase().includes(s)
        );
      }

      if (filters.skills && filters.skills.length > 0) {
        filtered = filtered.filter((t) =>
          filters.skills!.some((skill) => t.attributes?.skills?.includes(skill))
        );
      }

      // Age range
      if (filters.ageMin || filters.ageMax) {
        filtered = filtered.filter((t) => {
          const age = calculateAge(t.birth_date);
          if (!age) return false;
          if (filters.ageMin && age < filters.ageMin) return false;
          if (filters.ageMax && age > filters.ageMax) return false;
          return true;
        });
      }

      // Region (Italian region from city - approximate match)
      if (filters.region) {
        filtered = filtered.filter((t) =>
          t.city?.toLowerCase().includes(filters.region!.toLowerCase())
        );
      }

      // Attribute filters
      if (filters.eyeColor) {
        filtered = filtered.filter((t) => t.attributes?.eye_color === filters.eyeColor);
      }
      if (filters.hairColor) {
        filtered = filtered.filter((t) => t.attributes?.hair_color === filters.hairColor);
      }
      if (filters.hairLength) {
        filtered = filtered.filter((t) => t.attributes?.hair_length === filters.hairLength);
      }

      // Range filters
      if (filters.heightMin || filters.heightMax) {
        filtered = filtered.filter((t) => {
          const h = t.attributes?.height;
          if (!h) return false;
          if (filters.heightMin && h < filters.heightMin) return false;
          if (filters.heightMax && h > filters.heightMax) return false;
          return true;
        });
      }
      if (filters.weightMin || filters.weightMax) {
        filtered = filtered.filter((t) => {
          const w = t.attributes?.weight;
          if (!w) return false;
          if (filters.weightMin && w < filters.weightMin) return false;
          if (filters.weightMax && w > filters.weightMax) return false;
          return true;
        });
      }
      if (filters.shirtSize) {
        filtered = filtered.filter((t) => t.attributes?.shirt_size === filters.shirtSize);
      }
      if (filters.shoeMin || filters.shoeMax) {
        filtered = filtered.filter((t) => {
          const s = t.attributes?.shoe_size ? parseInt(t.attributes.shoe_size) : null;
          if (!s) return false;
          if (filters.shoeMin && s < filters.shoeMin) return false;
          if (filters.shoeMax && s > filters.shoeMax) return false;
          return true;
        });
      }
      if (filters.chestMin || filters.chestMax) {
        filtered = filtered.filter((t) => {
          const c = t.attributes?.chest;
          if (!c) return false;
          if (filters.chestMin && c < filters.chestMin) return false;
          if (filters.chestMax && c > filters.chestMax) return false;
          return true;
        });
      }
      if (filters.hipsMin || filters.hipsMax) {
        filtered = filtered.filter((t) => {
          const h = t.attributes?.hips;
          if (!h) return false;
          if (filters.hipsMin && h < filters.hipsMin) return false;
          if (filters.hipsMax && h > filters.hipsMax) return false;
          return true;
        });
      }

      // Skill search (free text)
      if (filters.skillSearch) {
        const ss = filters.skillSearch.toLowerCase();
        filtered = filtered.filter((t) =>
          t.attributes?.skills?.some((sk) => sk.toLowerCase().includes(ss))
        );
      }

      // Language
      if (filters.language) {
        filtered = filtered.filter((t) =>
          t.attributes?.languages?.includes(filters.language!)
        );
      }

      return filtered;
    },
  });
};

// Hook to get total talent count (unfiltered)
export const useTalentCount = () => {
  return useQuery({
    queryKey: ["owner-talents-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("onboarding_completed", true);
      if (error) throw error;
      return count || 0;
    },
  });
};

// Hook to get unique filter options
export const useTalentFilterOptions = () => {
  return useQuery({
    queryKey: ["talent-filter-options"],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("city, gender, talent_categories")
        .eq("onboarding_completed", true);

      const { data: attributes } = await supabase
        .from("talent_attributes")
        .select("skills");

      const cities = [...new Set(profiles?.map((p) => p.city).filter(Boolean))].sort();
      const genders = [...new Set(profiles?.map((p) => p.gender).filter(Boolean))].sort();
      const categories = [...new Set(profiles?.flatMap((p) => p.talent_categories || []))].sort();
      const skills = [...new Set(attributes?.flatMap((a) => a.skills || []))].sort();

      return { cities, genders, categories, skills };
    },
  });
};

// Calculate age from birth_date
export const calculateAge = (birthDate: string | null): number | null => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};
