import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ExploreCasting {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  locations: string[] | null;
  compensation_type: string | null;
  compensation_amount: number | null;
  currency: string | null;
  cover_image_url: string | null;
  company: {
    id: string;
    name: string;
  } | null;
  hasApplied?: boolean;
}

export const useExploreCastings = (searchQuery: string = "") => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["explore-castings", searchQuery, user?.id],
    queryFn: async () => {
      // Fetch active castings
      let query = supabase
        .from("castings")
        .select(`
          id,
          title,
          description,
          category,
          status,
          start_date,
          end_date,
          locations,
          compensation_type,
          compensation_amount,
          currency,
          cover_image_url,
          company:companies(id, name)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      const { data: castings, error } = await query;
      if (error) throw error;

      // If user is logged in, check which castings they've already applied to
      if (user?.id && castings && castings.length > 0) {
        const castingIds = castings.map(c => c.id);
        
        const { data: applications } = await supabase
          .from("applications")
          .select("casting_id")
          .eq("talent_user_id", user.id)
          .in("casting_id", castingIds);

        const appliedCastingIds = new Set(applications?.map(a => a.casting_id) || []);

        return castings.map(casting => ({
          ...casting,
          hasApplied: appliedCastingIds.has(casting.id),
        })) as ExploreCasting[];
      }

      return (castings || []) as ExploreCasting[];
    },
  });
};
