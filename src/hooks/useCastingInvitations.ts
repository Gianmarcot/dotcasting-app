import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type InvitationStatus = "pending" | "accepted" | "declined";

export interface CastingInvitation {
  id: string;
  casting_id: string;
  talent_user_id: string;
  invited_by_user_id: string;
  status: InvitationStatus;
  message: string | null;
  created_at: string;
  responded_at: string | null;
  casting?: {
    id: string;
    title: string;
    category: string | null;
    company?: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export const useCastingInvitations = (talentUserId?: string) => {
  return useQuery({
    queryKey: ["casting-invitations", talentUserId],
    queryFn: async () => {
      let query = supabase
        .from("casting_invitations")
        .select(`
          *,
          casting:castings(
            id,
            title,
            category,
            company:companies(id, name)
          )
        `)
        .order("created_at", { ascending: false });

      if (talentUserId) {
        query = query.eq("talent_user_id", talentUserId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CastingInvitation[];
    },
    enabled: true,
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      castingId,
      talentUserId,
      message,
    }: {
      castingId: string;
      talentUserId: string;
      message?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("casting_invitations")
        .insert({
          casting_id: castingId,
          talent_user_id: talentUserId,
          invited_by_user_id: user.id,
          message: message || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Questo talent è già stato invitato per questo casting");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["casting-invitations"] });
      toast({
        title: "Invito inviato",
        description: "Il talent è stato invitato a candidarsi per il casting.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile inviare l'invito.",
        variant: "destructive",
      });
    },
  });
};

export const useRespondToInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invitationId,
      status,
    }: {
      invitationId: string;
      status: "accepted" | "declined";
    }) => {
      const { data, error } = await supabase
        .from("casting_invitations")
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq("id", invitationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["casting-invitations"] });
      toast({
        title: variables.status === "accepted" ? "Invito accettato" : "Invito rifiutato",
        description:
          variables.status === "accepted"
            ? "Puoi ora candidarti per questo casting."
            : "Hai rifiutato l'invito.",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile rispondere all'invito.",
        variant: "destructive",
      });
    },
  });
};

export const useCheckExistingInvitation = (castingId: string, talentUserId: string) => {
  return useQuery({
    queryKey: ["check-invitation", castingId, talentUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("casting_invitations")
        .select("id, status")
        .eq("casting_id", castingId)
        .eq("talent_user_id", talentUserId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!castingId && !!talentUserId,
  });
};
