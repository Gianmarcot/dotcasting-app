import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type ApplicationStatus = "submitted" | "shortlisted" | "hold" | "rejected" | "callback" | "booked";

export interface ApplicationWithDetails {
  id: string;
  status: ApplicationStatus;
  submitted_at: string;
  updated_at: string;
  cover_note: string | null;
  casting_id: string;
  talent_user_id: string;
  casting: {
    id: string;
    title: string;
    category: string | null;
    company: {
      id: string;
      name: string;
    } | null;
  } | null;
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    profile_photo_url: string | null;
    city: string | null;
  } | null;
}

interface UseApplicationsOptions {
  statusFilter?: ApplicationStatus | "all";
  searchQuery?: string;
  castingId?: string;
}

export const useApplications = (options: UseApplicationsOptions = {}) => {
  const { statusFilter = "all", searchQuery = "", castingId } = options;

  return useQuery({
    queryKey: ["owner-applications", statusFilter, searchQuery, castingId],
    queryFn: async () => {
      // First, get applications with casting info
      let query = supabase
        .from("applications")
        .select(`
          id,
          status,
          submitted_at,
          updated_at,
          cover_note,
          casting_id,
          talent_user_id,
          casting:castings(
            id,
            title,
            category,
            company:companies(id, name)
          )
        `)
        .order("submitted_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (castingId) {
        query = query.eq("casting_id", castingId);
      }

      const { data: applications, error } = await query;

      if (error) throw error;

      // Get unique talent user IDs
      const talentUserIds = [...new Set(applications?.map(app => app.talent_user_id) || [])];

      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, first_name, last_name, profile_photo_url, city")
        .in("user_id", talentUserIds);

      if (profilesError) throw profilesError;

      // Create a map of user_id to profile
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Combine applications with profiles
      const applicationsWithProfiles: ApplicationWithDetails[] = (applications || []).map(app => ({
        ...app,
        status: (app.status || "submitted") as ApplicationStatus,
        profile: profileMap.get(app.talent_user_id) || null,
      }));

      // Filter by search query if provided
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        return applicationsWithProfiles.filter(app => {
          const fullName = `${app.profile?.first_name || ""} ${app.profile?.last_name || ""}`.toLowerCase();
          const castingTitle = app.casting?.title?.toLowerCase() || "";
          return fullName.includes(lowerQuery) || castingTitle.includes(lowerQuery);
        });
      }

      return applicationsWithProfiles;
    },
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const { data, error } = await supabase
        .from("applications")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-applications"] });
      toast({
        title: "Stato aggiornato",
        description: "Lo stato della candidatura è stato aggiornato con successo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato della candidatura.",
        variant: "destructive",
      });
      console.error("Error updating application status:", error);
    },
  });
};

export const useApplicationStats = () => {
  return useQuery({
    queryKey: ["application-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("status");

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        submitted: 0,
        shortlisted: 0,
        hold: 0,
        rejected: 0,
        callback: 0,
        booked: 0,
      };

      data?.forEach(app => {
        const status = app.status as ApplicationStatus;
        if (status in stats) {
          stats[status]++;
        }
      });

      return stats;
    },
  });
};
