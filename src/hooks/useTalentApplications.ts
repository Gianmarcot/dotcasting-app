import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export type TalentApplicationStatus = "submitted" | "shortlisted" | "hold" | "rejected" | "callback" | "booked" | "withdrawn";

export interface TalentApplication {
  id: string;
  status: TalentApplicationStatus;
  submitted_at: string;
  updated_at: string;
  cover_note: string | null;
  casting_id: string;
  casting: {
    id: string;
    title: string;
    category: string | null;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    company: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export const useTalentApplications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["talent-applications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          submitted_at,
          updated_at,
          cover_note,
          casting_id,
          casting:castings(
            id,
            title,
            category,
            description,
            start_date,
            end_date,
            company:companies(id, name)
          )
        `)
        .eq("talent_user_id", user.id)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      return (data || []).map(app => ({
        ...app,
        status: (app.status || "submitted") as TalentApplicationStatus,
      })) as TalentApplication[];
    },
    enabled: !!user?.id,
  });
};

export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, withdraw }: { id: string; withdraw: boolean }) => {
      const newStatus = withdraw ? "withdrawn" : "submitted";
      
      const { data, error } = await supabase
        .from("applications")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["talent-applications"] });
      toast({
        title: variables.withdraw ? "Candidatura ritirata" : "Candidatura riattivata",
        description: variables.withdraw 
          ? "Puoi riattivare la candidatura in qualsiasi momento."
          : "La tua candidatura è stata riattivata con successo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la candidatura.",
        variant: "destructive",
      });
      console.error("Error updating application:", error);
    },
  });
};
