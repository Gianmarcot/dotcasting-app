import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ---------- Actionable stats ----------
export interface OwnerActionableStats {
  toTriage: number;
  draftRounds: number;
  pendingInvitations: number;
}

export const useOwnerActionableStats = () => {
  return useQuery({
    queryKey: ["owner-actionable-stats"],
    queryFn: async (): Promise<OwnerActionableStats> => {
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const [triageRes, draftRes, invitedRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .is("triaged_at" as any, null)
          .eq("onboarding_completed", true)
          .gte("created_at", since.toISOString()),
        supabase
          .from("casting_rounds")
          .select("id", { count: "exact", head: true })
          .eq("status", "draft"),
        supabase
          .from("role_talents")
          .select("id", { count: "exact", head: true })
          .eq("talent_status", "invited"),
      ]);

      return {
        toTriage: triageRes.count || 0,
        draftRounds: draftRes.count || 0,
        pendingInvitations: invitedRes.count || 0,
      };
    },
    refetchInterval: 30000,
  });
};

// ---------- Triage queue ----------
export interface TriageTalent {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  stage_name: string | null;
  city: string | null;
  country: string | null;
  birth_date: string | null;
  profile_photo_url: string | null;
  main_photo_url: string | null;
  created_at: string;
}

export const useTriageQueue = (limit: number = 20) => {
  return useQuery({
    queryKey: ["owner-new-talents", limit],
    queryFn: async (): Promise<TriageTalent[]> => {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, first_name, last_name, stage_name, city, country, birth_date, profile_photo_url, created_at")
        .eq("onboarding_completed", true)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      const profiles = (data || []) as any[];

      // Fetch main photos for these profiles
      const ids = profiles.map((p) => p.id);
      let mainMap = new Map<string, string>();
      if (ids.length > 0) {
        const { data: media } = await supabase
          .from("talent_media")
          .select("profile_id, url, sort_order")
          .in("profile_id", ids)
          .eq("media_type", "photo")
          .eq("category", "main_photos")
          .order("sort_order", { ascending: true });
        (media || []).forEach((m: any) => {
          if (!mainMap.has(m.profile_id)) mainMap.set(m.profile_id, m.url);
        });
      }

      return profiles.map((p) => ({
        ...p,
        main_photo_url: mainMap.get(p.id) || null,
      }));
    },
    refetchInterval: 30000,
  });
};

export const useTriageTalent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ profileId, action }: { profileId: string; action: "shortlist" | "discard" }) => {
      const patch: any = { triaged_at: new Date().toISOString() };
      if (action === "shortlist") patch.is_shortlisted = true;
      const { error } = await supabase.from("profiles").update(patch).eq("id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-triage-queue"] });
      qc.invalidateQueries({ queryKey: ["owner-actionable-stats"] });
    },
  });
};

// ---------- Active castings with progress ----------
export interface ActiveCastingRoleProgress {
  id: string;
  name: string;
  total: number;
  confirmed: number;
}
export interface ActiveCastingWithProgress {
  id: string;
  title: string;
  roles: ActiveCastingRoleProgress[];
}

export const useActiveCastingsWithProgress = () => {
  return useQuery({
    queryKey: ["owner-active-castings-progress"],
    queryFn: async (): Promise<ActiveCastingWithProgress[]> => {
      const { data: castings, error } = await supabase
        .from("castings")
        .select("id, title, created_at, casting_roles(id, name)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const roleIds: string[] = [];
      (castings || []).forEach((c: any) => (c.casting_roles || []).forEach((r: any) => roleIds.push(r.id)));

      const totals = new Map<string, number>();
      const confirmed = new Map<string, number>();

      if (roleIds.length > 0) {
        const { data: rts } = await supabase
          .from("role_talents")
          .select("casting_role_id, company_status")
          .in("casting_role_id", roleIds);
        (rts || []).forEach((rt: any) => {
          totals.set(rt.casting_role_id, (totals.get(rt.casting_role_id) || 0) + 1);
          if (rt.company_status === "confirmed") {
            confirmed.set(rt.casting_role_id, (confirmed.get(rt.casting_role_id) || 0) + 1);
          }
        });
      }

      return (castings || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        roles: (c.casting_roles || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          total: totals.get(r.id) || 0,
          confirmed: confirmed.get(r.id) || 0,
        })),
      }));
    },
    refetchInterval: 30000,
  });
};

// ---------- Recent activity (no applications) ----------
export type OwnerActivityType = "casting_created" | "invitation_response" | "round_shared" | "round_selection_confirmed";

export interface OwnerActivityItem {
  id: string;
  type: OwnerActivityType;
  title: string;
  description: string;
  timestamp: string;
}

export const useOwnerRecentActivity = (limit: number = 10) => {
  return useQuery({
    queryKey: ["owner-recent-activity", limit],
    queryFn: async (): Promise<OwnerActivityItem[]> => {
      const items: OwnerActivityItem[] = [];

      const [castingsRes, invitationsRes, roundsRes] = await Promise.all([
        supabase
          .from("castings")
          .select("id, title, created_at")
          .order("created_at", { ascending: false })
          .limit(limit),
        supabase
          .from("casting_invitations")
          .select("id, status, responded_at, talent_user_id, casting:castings(title)")
          .in("status", ["accepted", "declined"])
          .not("responded_at", "is", null)
          .order("responded_at", { ascending: false })
          .limit(limit),
        supabase
          .from("casting_rounds")
          .select("id, label, shared_at, casting:castings(title)")
          .eq("status", "shared")
          .not("shared_at", "is", null)
          .order("shared_at", { ascending: false })
          .limit(limit),
      ]);

      (castingsRes.data || []).forEach((c: any) =>
        items.push({
          id: `casting-${c.id}`,
          type: "casting_created",
          title: "Casting creato",
          description: c.title,
          timestamp: c.created_at,
        }),
      );

      // Lookup talent names for invitations
      const talentIds = [...new Set((invitationsRes.data || []).map((i: any) => i.talent_user_id))];
      let nameMap = new Map<string, string>();
      if (talentIds.length > 0) {
        const { data: ps } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name, stage_name")
          .in("user_id", talentIds);
        (ps || []).forEach((p: any) => {
          const n = p.stage_name || [p.first_name, p.last_name].filter(Boolean).join(" ") || "Talent";
          nameMap.set(p.user_id, n);
        });
      }

      (invitationsRes.data || []).forEach((inv: any) =>
        items.push({
          id: `inv-${inv.id}`,
          type: "invitation_response",
          title: inv.status === "accepted" ? "Invito accettato" : "Invito rifiutato",
          description: `${nameMap.get(inv.talent_user_id) || "Talent"} · ${inv.casting?.title || "Casting"}`,
          timestamp: inv.responded_at,
        }),
      );

      (roundsRes.data || []).forEach((r: any) =>
        items.push({
          id: `round-${r.id}`,
          type: "round_shared",
          title: "Round condiviso",
          description: `${r.label} · ${r.casting?.title || "Casting"}`,
          timestamp: r.shared_at,
        }),
      );

      return items
        .filter((i) => i.timestamp)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },
    refetchInterval: 30000,
  });
};
