import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TalentEngagement {
  id: string;
  publishedAt: string | null;
  openedAt: string | null;
  roleName: string | null;
  roleLocation: string | null;
  castingId: string;
  title: string;
  city: string | null;
  /** ISO datetime of the call (falls back to casting start date) */
  dateISO: string | null;
  hasTime: boolean;
  venueName: string | null;
  venueAddress: string | null;
  instructions: string | null;
  clientName: string | null;
}

const SELECT = `
  id, published_at, talent_opened_at,
  role:casting_roles!role_talents_casting_role_id_fkey(
    id, name, location,
    casting:castings!casting_roles_casting_id_fkey(
      id, title, locations, start_date, call_datetime,
      venue_name, venue_address, talent_instructions, show_client_to_talent,
      company:companies(id, name)
    )
  )
`;

const mapRow = (r: any): TalentEngagement | null => {
  const role = r.role;
  const casting = role?.casting;
  if (!casting) return null;
  return {
    id: r.id,
    publishedAt: r.published_at ?? null,
    openedAt: r.talent_opened_at ?? null,
    roleName: role?.name ?? null,
    roleLocation: role?.location ?? null,
    castingId: casting.id,
    title: casting.title,
    city: casting.locations?.[0] ?? role?.location ?? null,
    dateISO: casting.call_datetime ?? casting.start_date ?? null,
    hasTime: !!casting.call_datetime,
    venueName: casting.venue_name ?? null,
    venueAddress: casting.venue_address ?? null,
    instructions: casting.talent_instructions ?? null,
    clientName: casting.show_client_to_talent ? casting.company?.name ?? null : null,
  };
};

/** Published engagements for the signed-in talent (RLS restricts rows to their own). */
export const useTalentEngagements = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["talent-engagements", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<TalentEngagement[]> => {
      const { data, error } = await supabase
        .from("role_talents")
        .select(SELECT)
        .eq("published_to_talent", true);
      if (error) throw error;
      return (data ?? []).map(mapRow).filter(Boolean) as TalentEngagement[];
    },
  });
};

export const useTalentEngagement = (id: string | undefined) => {
  return useQuery({
    queryKey: ["talent-engagement", id],
    enabled: !!id,
    queryFn: async (): Promise<TalentEngagement | null> => {
      const { data, error } = await supabase
        .from("role_talents")
        .select(SELECT)
        .eq("id", id!)
        .eq("published_to_talent", true)
        .maybeSingle();
      if (error) throw error;
      return data ? mapRow(data) : null;
    },
  });
};

/** Marks the engagement as opened (server-side, scoped to the signed-in talent). */
export const useMarkEngagementOpened = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("mark_engagement_opened", {
        p_role_talent_id: id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["talent-engagements"] });
    },
  });
};

/** Owner-side: publish / unpublish an engagement to the talent. */
export const useToggleEngagementPublished = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      published,
    }: {
      id: string;
      published: boolean;
      roleId: string;
    }) => {
      const { error } = await supabase
        .from("role_talents")
        .update({
          published_to_talent: published,
          published_at: published ? new Date().toISOString() : null,
        } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["role-talents", vars.roleId] });
    },
  });
};
