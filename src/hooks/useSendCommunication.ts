import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { CommunicationActionPayload } from "@/lib/communications";

export interface AttachedAction {
  type: "upload" | "link" | "availability";
  /** richiesta materiale */
  material?: string;
  /** rimando a una sezione del profilo */
  target?: string;
  /** richiesta di disponibilità */
  periodStart?: string;
  periodEnd?: string;
  deadline?: string;
}

export interface SendCommunicationInput {
  /** destinatari (auth user id dei talent) */
  recipients: string[];
  title?: string;
  body: string;
  action?: AttachedAction | null;
  castingId?: string | null;
}

const actionTitle = (action: AttachedAction | null | undefined) => {
  switch (action?.type) {
    case "upload":
      return "Materiale richiesto";
    case "availability":
      return "Richiesta di disponibilità";
    case "link":
      return "Aggiorna il tuo profilo";
    default:
      return "Comunicazione dall'agenzia";
  }
};

const findOrCreateThread = async (
  ownUserId: string,
  talentUserId: string,
  castingId?: string | null
) => {
  const { data: mine } = await supabase
    .from("message_participants")
    .select("thread_id")
    .eq("user_id", ownUserId);

  if (mine?.length) {
    const { data: shared } = await supabase
      .from("message_participants")
      .select("thread_id")
      .eq("user_id", talentUserId)
      .in(
        "thread_id",
        mine.map((m) => m.thread_id)
      )
      .limit(1)
      .maybeSingle();
    if (shared) return shared.thread_id as string;
  }

  const { data: thread, error } = await supabase
    .from("message_threads")
    .insert({
      casting_id: castingId ?? null,
      context_type: castingId ? "casting" : "general",
    })
    .select()
    .single();
  if (error) throw error;

  const { error: partError } = await supabase.from("message_participants").insert([
    { thread_id: thread.id, user_id: ownUserId },
    { thread_id: thread.id, user_id: talentUserId },
  ]);
  if (partError) throw partError;

  return thread.id as string;
};

/**
 * Invia una comunicazione a uno o più talent: crea il messaggio nella
 * conversazione individuale e la relativa comunicazione lato talent.
 */
export const useSendCommunication = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipients,
      title,
      body,
      action,
      castingId,
    }: SendCommunicationInput) => {
      if (!user?.id) throw new Error("Not authenticated");
      const batchId = recipients.length > 1 ? crypto.randomUUID() : null;

      const actionPayload: CommunicationActionPayload = {};
      if (action?.type === "upload") {
        actionPayload.material = action.material;
        actionPayload.label = "Carica il materiale";
      }
      if (action?.type === "link") {
        actionPayload.target = action.target;
        actionPayload.label = "Vai alla sezione";
      }
      if (action?.type === "availability") {
        actionPayload.period_start = action.periodStart;
        actionPayload.period_end = action.periodEnd;
      }

      for (const talentUserId of recipients) {
        const threadId = await findOrCreateThread(user.id, talentUserId, castingId);

        const { data: message, error: msgError } = await supabase
          .from("messages")
          .insert({
            thread_id: threadId,
            sender_user_id: user.id,
            body,
            kind: "message",
            action_type: action?.type ?? null,
            action_payload: actionPayload as never,
          })
          .select()
          .single();
        if (msgError) throw msgError;

        const { error: commError } = await supabase.from("communications").insert({
          talent_user_id: talentUserId,
          thread_id: threadId,
          message_id: message.id,
          batch_id: batchId,
          type: "agency_message",
          title: title?.trim() || actionTitle(action),
          body,
          action_type: action?.type ?? null,
          action_payload: actionPayload as never,
          deadline: action?.deadline || null,
          created_by_user_id: user.id,
        });
        if (commError) throw commError;
      }

      return { batchId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
      queryClient.invalidateQueries({ queryKey: ["thread-messages"] });
    },
  });
};
