import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MessageThread {
  id: string;
  context_type: string | null;
  casting_id: string | null;
  application_id: string | null;
  created_at: string;
  lastMessage?: Message | null;
  unreadCount: number;
  otherParticipant?: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    profile_photo_url: string | null;
  } | null;
  casting?: {
    id: string;
    title: string;
  } | null;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_user_id: string | null;
  body: string;
  created_at: string;
  read_at: string | null;
  sender?: {
    first_name: string | null;
    last_name: string | null;
    profile_photo_url: string | null;
  } | null;
}

// Fetch all threads for current user
export const useThreads = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["message-threads", user?.id],
    queryFn: async (): Promise<MessageThread[]> => {
      if (!user?.id) return [];

      // Get threads where user is a participant
      const { data: participations, error: partError } = await supabase
        .from("message_participants")
        .select("thread_id")
        .eq("user_id", user.id);

      if (partError) throw partError;
      if (!participations?.length) return [];

      const threadIds = participations.map(p => p.thread_id);

      // Get thread details
      const { data: threads, error: threadsError } = await supabase
        .from("message_threads")
        .select(`
          *,
          casting:castings(id, title)
        `)
        .in("id", threadIds)
        .order("created_at", { ascending: false });

      if (threadsError) throw threadsError;

      // Get last message and unread count for each thread
      const enrichedThreads = await Promise.all(
        (threads || []).map(async (thread) => {
          // Last message
          const { data: messages } = await supabase
            .from("messages")
            .select("*")
            .eq("thread_id", thread.id)
            .order("created_at", { ascending: false })
            .limit(1);

          // Unread count
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("thread_id", thread.id)
            .neq("sender_user_id", user.id)
            .is("read_at", null);

          // Other participant
          const { data: otherParts } = await supabase
            .from("message_participants")
            .select("user_id")
            .eq("thread_id", thread.id)
            .neq("user_id", user.id);

          let otherParticipant = null;
          if (otherParts?.length) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("user_id, first_name, last_name, profile_photo_url")
              .eq("user_id", otherParts[0].user_id)
              .maybeSingle();
            otherParticipant = profile;
          }

          return {
            ...thread,
            lastMessage: messages?.[0] || null,
            unreadCount: unreadCount || 0,
            otherParticipant,
          };
        })
      );

      // Sort by last message date
      return enrichedThreads.sort((a, b) => {
        const dateA = a.lastMessage?.created_at || a.created_at;
        const dateB = b.lastMessage?.created_at || b.created_at;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    },
    enabled: !!user?.id,
  });

  // Realtime subscription for new messages
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          // Refetch threads when any message changes
          queryClient.invalidateQueries({ queryKey: ["message-threads"] });
          queryClient.invalidateQueries({ queryKey: ["thread-messages"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return query;
};

// Fetch messages for a specific thread
export const useThreadMessages = (threadId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["thread-messages", threadId],
    queryFn: async (): Promise<Message[]> => {
      if (!threadId) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch sender profiles
      const senderIds = [...new Set(data?.map(m => m.sender_user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, profile_photo_url")
        .in("user_id", senderIds as string[]);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return (data || []).map(msg => ({
        ...msg,
        sender: msg.sender_user_id ? profileMap.get(msg.sender_user_id) || null : null,
      }));
    },
    enabled: !!threadId && !!user?.id,
    refetchInterval: 5000, // Fallback polling in case realtime misses updates
  });
};

// Send a message
export const useSendMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, body }: { threadId: string; body: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("messages")
        .insert({
          thread_id: threadId,
          sender_user_id: user.id,
          body: body.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["thread-messages", variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
    },
  });
};

// Mark messages as read
export const useMarkAsRead = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: string) => {
      if (!user?.id) return;

      const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("thread_id", threadId)
        .neq("sender_user_id", user.id)
        .is("read_at", null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
    },
  });
};

// Create a new thread
export const useCreateThread = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      otherUserId,
      castingId,
      applicationId,
      contextType = "general",
      initialMessage,
    }: {
      otherUserId: string;
      castingId?: string;
      applicationId?: string;
      contextType?: string;
      initialMessage?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Create thread
      const { data: thread, error: threadError } = await supabase
        .from("message_threads")
        .insert({
          casting_id: castingId || null,
          application_id: applicationId || null,
          context_type: contextType,
        })
        .select()
        .single();

      if (threadError) throw threadError;

      // Add participants
      const { error: partError } = await supabase
        .from("message_participants")
        .insert([
          { thread_id: thread.id, user_id: user.id },
          { thread_id: thread.id, user_id: otherUserId },
        ]);

      if (partError) throw partError;

      // Send initial message if provided
      if (initialMessage) {
        await supabase.from("messages").insert({
          thread_id: thread.id,
          sender_user_id: user.id,
          body: initialMessage.trim(),
        });
      }

      return thread;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
    },
  });
};

// Get or create a thread with a specific user
export const useFindOrCreateThread = () => {
  const { user } = useAuth();
  const createThread = useCreateThread();

  return useCallback(
    async (otherUserId: string, castingId?: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Check if thread already exists between these users
      const { data: myThreads } = await supabase
        .from("message_participants")
        .select("thread_id")
        .eq("user_id", user.id);

      if (myThreads?.length) {
        const threadIds = myThreads.map(t => t.thread_id);
        
        const { data: sharedThread } = await supabase
          .from("message_participants")
          .select("thread_id")
          .eq("user_id", otherUserId)
          .in("thread_id", threadIds)
          .limit(1)
          .maybeSingle();

        if (sharedThread) {
          return sharedThread.thread_id;
        }
      }

      // Create new thread
      const newThread = await createThread.mutateAsync({
        otherUserId,
        castingId,
        contextType: castingId ? "casting" : "general",
      });

      return newThread.id;
    },
    [user?.id, createThread]
  );
};

// Get total unread count
export const useUnreadMessagesCount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["unread-messages-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      // Get threads where user is participant
      const { data: participations } = await supabase
        .from("message_participants")
        .select("thread_id")
        .eq("user_id", user.id);

      if (!participations?.length) return 0;

      const threadIds = participations.map(p => p.thread_id);

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("thread_id", threadIds)
        .neq("sender_user_id", user.id)
        .is("read_at", null);

      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });
};
