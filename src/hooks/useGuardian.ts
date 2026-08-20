import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { TablesUpdate } from "@/integrations/supabase/types";

export type GuardianUpdate = TablesUpdate<"guardians">;

/**
 * Riga `guardians` dell'account tutore. Il talent minore non ha contatti
 * propri: quelli mostrati sul profilo e sulle card sono questi.
 */
export const useGuardian = (guardianUserId?: string | null) => {
  const { user } = useAuth();
  const targetId = guardianUserId ?? null;

  return useQuery({
    queryKey: ["guardian", targetId],
    queryFn: async () => {
      if (!targetId) return null;
      const { data, error } = await supabase
        .from("guardians")
        .select("*")
        .eq("user_id", targetId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!targetId && !!user?.id,
  });
};

export const useUpdateGuardian = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: GuardianUpdate) => {
      if (!user?.id) throw new Error("User not authenticated");
      const { error } = await supabase
        .from("guardians")
        .upsert(
          { ...updates, user_id: user.id, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guardian"] });
    },
  });
};
