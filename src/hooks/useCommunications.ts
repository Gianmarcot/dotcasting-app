import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { sortCommunications, type Communication } from "@/lib/communications";

const asCommunication = (row: Record<string, unknown>): Communication =>
  ({
    ...row,
    action_payload: (row.action_payload ?? {}) as Communication["action_payload"],
  }) as Communication;

/** Comunicazioni ricevute dal talent autenticato, dalla più recente. */
export const useCommunications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["communications", user?.id],
    queryFn: async (): Promise<Communication[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("communications")
        .select("*")
        .eq("talent_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return sortCommunications((data ?? []).map(asCommunication));
    },
    enabled: !!user?.id,
    refetchInterval: 60000,
  });
};

export const useUnreadCommunicationsCount = () => {
  const { data } = useCommunications();
  return (data ?? []).filter((c) => !c.read_at).length;
};

export const useMarkCommunicationRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("communications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communications", user?.id] });
    },
  });
};

export const useMarkAllCommunicationsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase
        .from("communications")
        .update({ read_at: new Date().toISOString() })
        .eq("talent_user_id", user.id)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communications", user?.id] });
    },
  });
};

/** Inserisce una voce di sistema nel thread lato agenzia. */
const appendSystemEntry = async (
  threadId: string | null,
  body: string,
  actionType?: string | null
) => {
  if (!threadId) return;
  await supabase.from("messages").insert({
    thread_id: threadId,
    sender_user_id: null,
    kind: "system",
    action_type: actionType ?? null,
    body,
  });
};

/** Risposta del talent a una richiesta di disponibilità. */
export const useRespondAvailability = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      communication,
      response,
    }: {
      communication: Communication;
      response: "available" | "unavailable";
    }) => {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("communications")
        .update({ response, responded_at: now, resolved_at: now, read_at: now })
        .eq("id", communication.id);
      if (error) throw error;

      await appendSystemEntry(
        communication.thread_id,
        response === "available"
          ? "Il talent ha confermato la disponibilità."
          : "Il talent ha indicato di non essere disponibile.",
        "availability"
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["communication-batch"] });
      queryClient.invalidateQueries({ queryKey: ["thread-messages"] });
    },
  });
};

export const TALENT_DOCS_BUCKET = "talent-documents";

/** Caricamento del materiale richiesto dall'agenzia. */
export const useUploadCommunicationMaterial = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      communication,
      file,
    }: {
      communication: Communication;
      file: File;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `${user.id}/comunicazioni/${communication.id}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(TALENT_DOCS_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const now = new Date().toISOString();
      const { error } = await supabase
        .from("communications")
        .update({
          response: "uploaded",
          responded_at: now,
          resolved_at: now,
          read_at: now,
          action_payload: {
            ...communication.action_payload,
            file_path: path,
            file_name: file.name,
          },
        })
        .eq("id", communication.id);
      if (error) throw error;

      await appendSystemEntry(
        communication.thread_id,
        `Il talent ha caricato il materiale richiesto: ${file.name}`,
        "upload"
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["communication-batch"] });
      queryClient.invalidateQueries({ queryKey: ["thread-messages"] });
    },
  });
};

export interface BatchRecipient {
  communication: Communication;
  profile: {
    first_name: string | null;
    last_name: string | null;
    profile_photo_url: string | null;
  } | null;
}

/** Riepilogo di un invio multiplo: destinatari e rispettiva risposta. */
export const useCommunicationBatch = (batchId: string | null) =>
  useQuery({
    queryKey: ["communication-batch", batchId],
    queryFn: async (): Promise<BatchRecipient[]> => {
      if (!batchId) return [];
      const { data, error } = await supabase
        .from("communications")
        .select("*")
        .eq("batch_id", batchId);
      if (error) throw error;
      const comms = (data ?? []).map(asCommunication);
      const userIds = comms.map((c) => c.talent_user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, profile_photo_url")
        .in("user_id", userIds);
      const map = new Map((profiles ?? []).map((p) => [p.user_id, p]));
      return comms.map((c) => ({
        communication: c,
        profile: map.get(c.talent_user_id) ?? null,
      }));
    },
    enabled: !!batchId,
  });
