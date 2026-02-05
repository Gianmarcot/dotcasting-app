import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Plus, ArrowLeft } from "lucide-react";
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

export const OwnerMessages = () => {
  const isMobile = useIsMobile();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newThreadOpen, setNewThreadOpen] = useState(false);

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

  const handleSendMessage = (body: string) => {
    if (selectedThreadId) {
      sendMessage.mutate({ threadId: selectedThreadId, body });
    }
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
            <Button size="icon" variant="ghost" onClick={() => setNewThreadOpen(true)}>
              <Plus className="h-5 w-5" />
            </Button>
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
                disabled={sendMessage.isPending}
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
      <NewThreadDialog
        open={newThreadOpen}
        onOpenChange={setNewThreadOpen}
        onThreadCreated={handleThreadCreated}
      />
    </div>
  );
};

export default OwnerMessages;
