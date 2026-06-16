import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TeamMember = {
  user_id: string;
  email: string;
  role: "owner" | "admin";
  created_at: string;
  last_sign_in_at: string | null;
};

export type TeamInvitation = {
  id: string;
  email: string;
  role: "owner" | "admin";
  token: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: string;
  created_at: string;
};

export const useTeamMembers = () =>
  useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_team_members");
      if (error) throw error;
      return (data ?? []) as TeamMember[];
    },
  });

export const useTeamInvitations = () =>
  useQuery({
    queryKey: ["team-invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_invitations")
        .select("id, email, role, token, status, expires_at, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TeamInvitation[];
    },
  });

export const useInviteMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; role: "owner" | "admin" }) => {
      const { data, error } = await supabase.functions.invoke("invite-team-member", {
        body: input,
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as { ok: true; accept_url: string; token: string; expires_at: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-invitations"] });
      toast.success("Invito creato");
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
};

export const useRevokeInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("team_invitations")
        .update({ status: "revoked" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-invitations"] });
      toast.success("Invito revocato");
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
};

export const useUpdateMemberRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { user_id: string; new_role: "owner" | "admin" }) => {
      const { error } = await supabase.rpc("update_member_role", {
        p_user_id: input.user_id,
        p_new_role: input.new_role,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Ruolo aggiornato");
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
};

export const useRemoveMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (user_id: string) => {
      const { error } = await supabase.rpc("remove_team_member", { p_user_id: user_id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Membro rimosso");
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
};
