import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ArrowLeft } from "lucide-react";
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
import { Button } from "@/components/ui/button";

export const TalentMessages = () => {
  const isMobile = useIsMobile();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

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

  // Mobile: show either list or conversation
  const showList = !isMobile || !selectedThreadId;
  const showConversation = !isMobile || !!selectedThreadId;

  const participant = selectedThread?.otherParticipant;
  const participantName = participant
    ? `${participant.first_name || ""} ${participant.last_name || ""}`.trim() || "Piattaforma"
    : "Piattaforma";
  const participantInitials = participantName.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <div className="h-[calc(100vh-6rem)] flex animate-fade-up">
      {/* Thread list */}
      {showList && (
        <div className={`${isMobile ? "w-full" : "w-80"} border-r flex flex-col`}>
          <div className="p-3 border-b">
            <h2 className="font-medium text-lg">Conversazioni</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threads.length === 0 && !threadsLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                <MessageSquare className="h-10 w-10 mb-3 opacity-50" />
                <p>Nessun messaggio</p>
                <p className="text-sm mt-1">
                  Riceverai qui le comunicazioni dalla piattaforma
                </p>
              </div>
            ) : (
              <ThreadList
                threads={threads}
                selectedThreadId={selectedThreadId}
                onSelectThread={setSelectedThreadId}
                isLoading={threadsLoading}
              />
            )}
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
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TalentMessages;
