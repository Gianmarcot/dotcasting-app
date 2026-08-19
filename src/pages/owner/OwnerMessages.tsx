import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Plus, ArrowLeft, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useThreads,
  useThreadMessages,
  useSendMessage,
  useMarkAsRead,
} from "@/hooks/useMessages";
import { ThreadList } from "@/components/messages/ThreadList";
import { ThreadView } from "@/components/messages/ThreadView";
import { MessageInput } from "@/components/messages/MessageInput";
import { NewThreadDialog } from "@/components/messages/NewThreadDialog";
import { BroadcastDialog } from "@/components/messages/BroadcastDialog";
import { BatchSummaryDialog } from "@/components/messages/BatchSummaryDialog";
import { useSendCommunication, type AttachedAction } from "@/hooks/useSendCommunication";

export const OwnerMessages = () => {
  const isMobile = useIsMobile();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newThreadOpen, setNewThreadOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [batchId, setBatchId] = useState<string | null>(null);
  const sendCommunication = useSendCommunication();

  const { data: threads = [], isLoading: threadsLoading } = useThreads();
  const { data: messages = [], isLoading: messagesLoading } = useThreadMessages(selectedThreadId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  const selectedThread = threads.find(t => t.id === selectedThreadId);

  // Mark as read when selecting a thread
  useEffect(() => {
    if (selectedThreadId && selectedThread?.unreadCount) {
      markAsRead.mutate(selectedThreadId);
    }
  }, [selectedThreadId]);

  const handleSendMessage = (body: string, action?: AttachedAction | null) => {
    if (!selectedThreadId) return;
    const talentUserId = selectedThread?.otherParticipant?.user_id;
    // Con un'azione allegata (o verso un talent) la comunicazione passa dal
    // flusso comunicazioni, così arriva anche nella sua sezione dedicata.
    if (talentUserId) {
      sendCommunication.mutate({
        recipients: [talentUserId],
        body,
        action: action ?? null,
        castingId: selectedThread?.casting_id ?? null,
      });
      return;
    }
    sendMessage.mutate({ threadId: selectedThreadId, body });
  };

  const handleThreadCreated = (threadId: string) => {
    setSelectedThreadId(threadId);
    setNewThreadOpen(false);
  };

  // Mobile: show either list or conversation
  const showList = !isMobile || !selectedThreadId;
  const showConversation = !isMobile || !!selectedThreadId;

  const participant = selectedThread?.otherParticipant;
  const participantName = participant
    ? `${participant.first_name || ""} ${participant.last_name || ""}`.trim() || "Utente"
    : "Utente";
  const participantInitials = participantName.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <div className="h-[calc(100vh-6rem)] flex animate-fade-up">
      {/* Thread list */}
      {showList && (
        <div className={`${isMobile ? "w-full" : "w-80"} border-r flex flex-col`}>
          <div className="p-3 border-b flex items-center justify-between">
            <h2 className="font-medium text-lg">Conversazioni</h2>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                aria-label="Invio a più talent"
                onClick={() => setBroadcastOpen(true)}
              >
                <Users className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" aria-label="Nuova conversazione" onClick={() => setNewThreadOpen(true)}>
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ThreadList
              threads={threads}
              selectedThreadId={selectedThreadId}
              onSelectThread={setSelectedThreadId}
              isLoading={threadsLoading}
            />
          </div>
        </div>
      )}

      {/* Conversation view */}
      {showConversation && (
        <div className="flex-1 flex flex-col">
          {selectedThreadId ? (
            <>
              {/* Conversation header */}
              <div className="p-3 border-b flex items-center gap-3">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedThreadId(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={participant?.profile_photo_url || undefined} />
                  <AvatarFallback>{participantInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{participantName}</p>
                  {selectedThread?.casting && (
                    <p className="text-xs text-primary">{selectedThread.casting.title}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ThreadView messages={messages} isLoading={messagesLoading} />

              {/* Input */}
              <MessageInput
                onSend={handleSendMessage}
                disabled={sendMessage.isPending || sendCommunication.isPending}
                enableActions
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Seleziona una conversazione</p>
                <p className="text-sm mt-1">o iniziane una nuova</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New thread dialog */}
      <BroadcastDialog
        open={broadcastOpen}
        onOpenChange={setBroadcastOpen}
        onSent={(id) => setBatchId(id)}
      />

      <BatchSummaryDialog
        batchId={batchId}
        open={!!batchId}
        onOpenChange={(o) => !o && setBatchId(null)}
      />

      <NewThreadDialog
        open={newThreadOpen}
        onOpenChange={setNewThreadOpen}
        onThreadCreated={handleThreadCreated}
      />
    </div>
  );
};

export default OwnerMessages;
