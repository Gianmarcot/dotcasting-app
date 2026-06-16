import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCastingClientPasswordStatus = (castingId: string | undefined) =>
  useQuery({
    queryKey: ["casting-client-password-status", castingId],
    enabled: !!castingId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_casting_client_password_status",
        { p_casting_id: castingId! }
      );
      if (error) throw error;
      return !!data;
    },
  });

export const useSetCastingClientPassword = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      castingId,
      password,
    }: {
      castingId: string;
      password: string | null;
    }) => {
      const { error } = await supabase.rpc("set_casting_client_password", {
        p_casting_id: castingId,
        p_password: password,
      });
      if (error) throw error;
    },
    onSuccess: (_, { castingId }) => {
      qc.invalidateQueries({
        queryKey: ["casting-client-password-status", castingId],
      });
    },
  });
};
