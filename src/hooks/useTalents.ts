import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TalentFilters {
  search?: string;
  city?: string;
  category?: string;
  skills?: string[];
  gender?: string;
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
  attributes: {
    height: number | null;
    weight: number | null;
    hair_color: string | null;
    eye_color: string | null;
    skills: string[] | null;
    languages: string[] | null;
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
          talent_attributes (
            height,
            weight,
            hair_color,
            eye_color,
            skills,
            languages
          )
        `)
        .eq("onboarding_completed", true)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }

      if (filters.gender) {
        query = query.eq("gender", filters.gender);
      }

      if (filters.category) {
        query = query.contains("talent_categories", [filters.category]);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to flatten attributes
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
        attributes: profile.talent_attributes?.[0] || null,
      }));

      // Apply client-side filters for search and skills
      let filteredTalents = talents;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredTalents = filteredTalents.filter(
          (t) =>
            t.first_name?.toLowerCase().includes(searchLower) ||
            t.last_name?.toLowerCase().includes(searchLower) ||
            t.city?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.skills && filters.skills.length > 0) {
        filteredTalents = filteredTalents.filter((t) =>
          filters.skills!.some((skill) =>
            t.attributes?.skills?.includes(skill)
          )
        );
      }

      return filteredTalents;
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
