import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ShortlistItem {
  id: string;
  target_id: string;
  profile_id: string;
  status: string;
  notes: string | null;
  added_at: string;
  added_by_user_id: string | null;
  profile?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    profile_photo_url: string | null;
    city: string | null;
    talent_categories: string[] | null;
  };
}

export type ShortlistStatus = "pending" | "contacted" | "confirmed" | "rejected";

export const SHORTLIST_STATUSES: { value: ShortlistStatus; label: string; color: string }[] = [
  { value: "pending", label: "In attesa", color: "bg-muted text-muted-foreground" },
  { value: "contacted", label: "Contattato", color: "bg-blue-100 text-blue-800" },
  { value: "confirmed", label: "Confermato", color: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Scartato", color: "bg-red-100 text-red-800" },
];

// Fetch shortlist for a specific target
export const useShortlist = (targetId: string | null) => {
  return useQuery({
    queryKey: ["target-shortlist", targetId],
    queryFn: async () => {
      if (!targetId) return [];
      
      const { data, error } = await supabase
        .from("target_shortlist")
        .select(`
          *,
          profile:profiles(
            id,
            first_name,
            last_name,
            profile_photo_url,
            city,
            talent_categories
          )
        `)
        .eq("target_id", targetId)
        .order("added_at", { ascending: false });

      if (error) throw error;
      return data as ShortlistItem[];
    },
    enabled: !!targetId,
  });
};

// Get shortlist count for a target
export const useShortlistCount = (targetId: string | null) => {
  return useQuery({
    queryKey: ["target-shortlist-count", targetId],
    queryFn: async () => {
      if (!targetId) return 0;
      
      const { count, error } = await supabase
        .from("target_shortlist")
        .select("*", { count: "exact", head: true })
        .eq("target_id", targetId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!targetId,
  });
};

// Add talent to shortlist
export const useAddToShortlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetId, profileId, notes }: { targetId: string; profileId: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("target_shortlist")
        .insert({
          target_id: targetId,
          profile_id: profileId,
          notes: notes || null,
          added_by_user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["target-shortlist", variables.targetId] });
      queryClient.invalidateQueries({ queryKey: ["target-shortlist-count", variables.targetId] });
    },
  });
};

// Remove talent from shortlist
export const useRemoveFromShortlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shortlistId, targetId }: { shortlistId: string; targetId: string }) => {
      const { error } = await supabase
        .from("target_shortlist")
        .delete()
        .eq("id", shortlistId);

      if (error) throw error;
      return targetId;
    },
    onSuccess: (targetId) => {
      queryClient.invalidateQueries({ queryKey: ["target-shortlist", targetId] });
      queryClient.invalidateQueries({ queryKey: ["target-shortlist-count", targetId] });
    },
  });
};

// Update shortlist item status
export const useUpdateShortlistStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shortlistId, status, targetId }: { shortlistId: string; status: ShortlistStatus; targetId: string }) => {
      const { data, error } = await supabase
        .from("target_shortlist")
        .update({ status })
        .eq("id", shortlistId)
        .select()
        .single();

      if (error) throw error;
      return { data, targetId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["target-shortlist", result.targetId] });
    },
  });
};

// Update shortlist item notes
export const useUpdateShortlistNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shortlistId, notes, targetId }: { shortlistId: string; notes: string; targetId: string }) => {
      const { data, error } = await supabase
        .from("target_shortlist")
        .update({ notes })
        .eq("id", shortlistId)
        .select()
        .single();

      if (error) throw error;
      return { data, targetId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["target-shortlist", result.targetId] });
    },
  });
};

// Check if profile is in shortlist
export const useIsInShortlist = (targetId: string | null, profileId: string | null) => {
  return useQuery({
    queryKey: ["is-in-shortlist", targetId, profileId],
    queryFn: async () => {
      if (!targetId || !profileId) return false;
      
      const { data, error } = await supabase
        .from("target_shortlist")
        .select("id")
        .eq("target_id", targetId)
        .eq("profile_id", profileId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!targetId && !!profileId,
  });
};
