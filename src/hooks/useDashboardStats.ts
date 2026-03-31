import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  totalTalents: number;
  activeCastings: number;
  pendingApplications: number;
}

export interface RecentApplication {
  id: string;
  talentName: string;
  talentPhotoUrl: string | null;
  castingTitle: string;
  status: string;
  submittedAt: string;
}

export interface RecentActivity {
  id: string;
  type: "application" | "casting";
  title: string;
  description: string;
  timestamp: string;
}

// Fetch dashboard statistics
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      // Total talents (profiles with onboarding completed)
      const { count: totalTalents } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("onboarding_completed", true);

      // Active castings
      const { count: activeCastings } = await supabase
        .from("castings")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Pending applications (submitted status)
      const { count: pendingApplications } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "submitted");

      return {
        totalTalents: totalTalents || 0,
        activeCastings: activeCastings || 0,
        pendingApplications: pendingApplications || 0,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// Fetch recent applications with talent and casting info
export const useRecentApplications = (limit: number = 5) => {
  return useQuery({
    queryKey: ["recent-applications", limit],
    queryFn: async (): Promise<RecentApplication[]> => {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          submitted_at,
          casting:castings(title),
          talent_user_id
        `)
        .order("submitted_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Fetch profile info for each talent
      const talentIds = [...new Set(data?.map(a => a.talent_user_id) || [])];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, profile_photo_url")
        .in("user_id", talentIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return (data || []).map(app => {
        const profile = profileMap.get(app.talent_user_id);
        return {
          id: app.id,
          talentName: profile 
            ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Talent"
            : "Talent",
          talentPhotoUrl: profile?.profile_photo_url || null,
          castingTitle: (app.casting as any)?.title || "Casting",
          status: app.status || "submitted",
          submittedAt: app.submitted_at,
        };
      });
    },
    refetchInterval: 30000,
  });
};

// Fetch recent activity (applications, auditions, new castings)
export const useRecentActivity = (limit: number = 10) => {
  return useQuery({
    queryKey: ["recent-activity", limit],
    queryFn: async (): Promise<RecentActivity[]> => {
      const activities: RecentActivity[] = [];

      // Recent applications
      const { data: applications } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          submitted_at,
          casting:castings(title)
        `)
        .order("submitted_at", { ascending: false })
        .limit(5);

      applications?.forEach(app => {
        activities.push({
          id: `app-${app.id}`,
          type: "application",
          title: "Nuova candidatura",
          description: (app.casting as any)?.title || "Casting",
          timestamp: app.submitted_at,
        });
      });

      // Recent castings created
      const { data: castings } = await supabase
        .from("castings")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      castings?.forEach(casting => {
        activities.push({
          id: `casting-${casting.id}`,
          type: "casting",
          title: "Casting creato",
          description: casting.title,
          timestamp: casting.created_at,
        });
      });

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },
    refetchInterval: 30000,
  });
};
