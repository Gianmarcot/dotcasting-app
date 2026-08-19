import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RecipientCandidate {
  userId: string;
  profileId: string;
  name: string;
  photoUrl: string | null;
}

const mapProfiles = (
  rows: {
    user_id: string;
    id: string;
    first_name: string | null;
    last_name: string | null;
    profile_photo_url: string | null;
  }[]
): RecipientCandidate[] =>
  rows.map((p) => ({
    userId: p.user_id,
    profileId: p.id,
    name: `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Talent",
    photoUrl: p.profile_photo_url,
  }));

const fetchProfiles = async (profileIds: string[]) => {
  if (!profileIds.length) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, user_id, first_name, last_name, profile_photo_url")
    .in("id", profileIds);
  if (error) throw error;
  return mapProfiles(data ?? []);
};

/** Talent di un ruolo, come base per la selezione dei destinatari. */
export const useRoleRecipients = (roleId: string | null) =>
  useQuery({
    queryKey: ["recipients-role", roleId],
    enabled: !!roleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_talents")
        .select("profile_id")
        .eq("casting_role_id", roleId!);
      if (error) throw error;
      return fetchProfiles((data ?? []).map((r) => r.profile_id));
    },
  });

/** Talent inclusi in un invio (round). */
export const useRoundRecipients = (roundId: string | null) =>
  useQuery({
    queryKey: ["recipients-round", roundId],
    enabled: !!roundId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("casting_round_talents")
        .select("role_talent:role_talents(profile_id)")
        .eq("round_id", roundId!);
      if (error) throw error;
      const ids = (data ?? [])
        .map((r) => (r.role_talent as { profile_id: string } | null)?.profile_id)
        .filter(Boolean) as string[];
      return fetchProfiles(ids);
    },
  });

/** Ricerca libera fra tutti i talent. */
export const useTalentRecipientSearch = (search: string) =>
  useQuery({
    queryKey: ["recipients-search", search],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, user_id, first_name, last_name, profile_photo_url")
        .order("first_name", { ascending: true })
        .limit(40);
      if (search.trim()) {
        query = query.or(
          `first_name.ilike.%${search.trim()}%,last_name.ilike.%${search.trim()}%`
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      return mapProfiles(data ?? []);
    },
  });
